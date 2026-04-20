"""End-to-end backend tests for La Clase Digital.

Covers:
- Public course endpoint
- Magic-link auth flow (request + verify + me)
- Dashboard (auth-protected)
- Admin seed + admin endpoints (overview, course/module updates)
- Stripe checkout create + status (test key may not actually transact)
- Course content access protection (no enrollment -> 403)
- Submissions, feedback, forum threads
"""
import os
import pytest
import requests

API = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"


# ─────────── Public ───────────
class TestPublicCourse:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_get_course_ia_ele(self, api_client):
        r = api_client.get(f"{API}/courses/ia-ele")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["slug"] == "ia-ele"
        assert d["price_eur"] == 25000
        assert d["price_founder_eur"] == 14900
        assert d["founder_seats"] == 20
        # is_founder_edition stays True until 20 seats taken
        assert isinstance(d["is_founder_edition"], bool)
        assert d["active"] is True

    def test_get_course_not_found(self, api_client):
        r = api_client.get(f"{API}/courses/no-existe")
        assert r.status_code == 404


# ─────────── Auth ───────────
class TestAuth:
    def test_request_magic_link_ok(self, api_client):
        r = api_client.post(
            f"{API}/auth/request-link", json={"email": "TEST_link@example.com"}
        )
        # Resend may fail silently but endpoint must return 200
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_request_magic_link_invalid_email(self, api_client):
        r = api_client.post(f"{API}/auth/request-link", json={"email": "not-an-email"})
        assert r.status_code == 422

    def test_verify_magic_link_creates_user(self, api_client):
        from tests.conftest import make_magic_token
        email = "TEST_verify_new@example.com"
        token = make_magic_token(email)
        r = api_client.post(f"{API}/auth/verify", json={"token": token})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and isinstance(body["token"], str)
        assert body["user"]["email"] == email.lower()
        assert body["user"]["role"] == "student"

    def test_verify_invalid_token(self, api_client):
        r = api_client.post(f"{API}/auth/verify", json={"token": "garbage"})
        assert r.status_code == 400

    def test_me_with_jwt(self, api_client, student_token, student_email):
        r = api_client.get(
            f"{API}/auth/me", headers={"Authorization": f"Bearer {student_token}"}
        )
        assert r.status_code == 200
        assert r.json()["email"] == student_email.lower()

    def test_me_without_jwt(self, api_client):
        r = api_client.get(f"{API}/auth/me")
        assert r.status_code == 401


# ─────────── Admin seed ───────────
class TestAdminSeed:
    def test_admin_user_seeded_as_admin(self, api_client, admin_token, admin_email):
        r = api_client.get(
            f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == admin_email
        assert u["role"] == "admin"


# ─────────── Dashboard ───────────
class TestDashboard:
    def test_dashboard_unauth(self, api_client):
        r = api_client.get(f"{API}/dashboard")
        assert r.status_code == 401

    def test_dashboard_auth(self, api_client, student_token):
        r = api_client.get(
            f"{API}/dashboard", headers={"Authorization": f"Bearer {student_token}"}
        )
        assert r.status_code == 200
        d = r.json()
        assert "user" in d
        assert "enrollments" in d and isinstance(d["enrollments"], list)


# ─────────── Stripe checkout ───────────
class TestCheckout:
    def test_checkout_create(self, api_client):
        r = api_client.post(
            f"{API}/checkout/create",
            json={
                "course_slug": "ia-ele",
                "origin_url": "https://teach-preview.preview.emergentagent.com",
            },
        )
        # If Stripe key is invalid we must NOT get 500
        assert r.status_code == 200, f"status={r.status_code} body={r.text}"
        d = r.json()
        assert "url" in d and "session_id" in d
        assert d["url"].startswith("http")
        # Persist for next test
        TestCheckout.session_id = d["session_id"]

    def test_checkout_status(self, api_client):
        sid = getattr(TestCheckout, "session_id", None)
        if not sid:
            pytest.skip("No session_id from create test")
        r = api_client.get(f"{API}/checkout/status/{sid}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "status" in d
        assert "payment_status" in d


# ─────────── Admin endpoints ───────────
class TestAdminEndpoints:
    def test_overview(self, api_client, admin_token):
        r = api_client.get(
            f"{API}/admin/overview",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "courses" in d and len(d["courses"]) >= 1
        assert "enrollments" in d
        assert "pending_submissions" in d

    def test_admin_only_protection(self, api_client, student_token):
        r = api_client.get(
            f"{API}/admin/overview",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 403

    def test_update_course_founder_flag(self, api_client, admin_token):
        course_id = "course-ia-ele"
        # Toggle off then back on
        r1 = api_client.patch(
            f"{API}/admin/course/{course_id}",
            json={"is_founder_edition": False},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r1.status_code == 200, r1.text
        assert r1.json()["is_founder_edition"] is False

        r2 = api_client.patch(
            f"{API}/admin/course/{course_id}",
            json={"is_founder_edition": True},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r2.status_code == 200
        assert r2.json()["is_founder_edition"] is True

    def test_update_module_unlock(self, api_client, admin_token):
        mid = "mod-ia-02"
        # Lock then unlock
        r1 = api_client.patch(
            f"{API}/admin/module/{mid}",
            json={"unlocked": True},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r1.status_code == 200, r1.text
        assert r1.json().get("unlocked_at") is not None

        r2 = api_client.patch(
            f"{API}/admin/module/{mid}",
            json={"unlocked": False},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r2.status_code == 200
        assert r2.json().get("unlocked_at") is None


# ─────────── Course content protection ───────────
class TestCourseAccess:
    def test_no_enrollment_forbidden(self, api_client):
        """Brand new student without enrollment must receive 403."""
        from tests.conftest import make_magic_token
        email = "TEST_noenroll@example.com"
        tok = make_magic_token(email)
        v = api_client.post(f"{API}/auth/verify", json={"token": tok})
        assert v.status_code == 200
        jwt_tok = v.json()["token"]
        r = api_client.get(
            f"{API}/course/ia-ele/content",
            headers={"Authorization": f"Bearer {jwt_tok}"},
        )
        assert r.status_code == 403

    def test_enrolled_student_can_access(self, api_client, student_token, enrolled_student):
        r = api_client.get(
            f"{API}/course/ia-ele/content",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["course"]["slug"] == "ia-ele"
        assert len(d["modules"]) == 4
        # First module unlocked
        m1 = next(m for m in d["modules"] if m["module"]["order"] == 1)
        assert m1["unlocked"] is True
        assert len(m1["lessons"]) >= 1
        assert m1["task"] is not None


# ─────────── Submissions + feedback ───────────
class TestSubmissionsAndFeedback:
    def test_submit_then_list(self, api_client, student_token, enrolled_student):
        task_id = "mod-ia-01-task"
        s = api_client.post(
            f"{API}/course/ia-ele/task/{task_id}/submit",
            json={"content_md": "TEST_submission contenido"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert s.status_code == 200, s.text
        sub = s.json()
        assert sub["status"] == "pending"
        TestSubmissionsAndFeedback.sub_id = sub["id"]

        # GET task should list it
        g = api_client.get(
            f"{API}/course/ia-ele/task/{task_id}",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert g.status_code == 200
        ids = [x["id"] for x in g.json()["submissions"]]
        assert sub["id"] in ids

    def test_admin_feedback_marks_reviewed(self, api_client, admin_token):
        sid = getattr(TestSubmissionsAndFeedback, "sub_id", None)
        if not sid:
            pytest.skip("No submission id")
        r = api_client.post(
            f"{API}/admin/submission/{sid}/feedback",
            json={"feedback_md": "Buen trabajo TEST", "grade": 9},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "reviewed"
        assert d["grade"] == 9
        assert d["feedback_md"] == "Buen trabajo TEST"


# ─────────── Forum threads ───────────
class TestForum:
    def test_create_post_and_nested_reply(self, api_client, student_token, enrolled_student):
        task_id = "mod-ia-01-task"
        # Top-level
        r = api_client.post(
            f"{API}/course/ia-ele/task/{task_id}/threads",
            json={"body_md": "TEST primera reflexión"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 200, r.text
        parent_id = r.json()["id"]

        # Nested
        r2 = api_client.post(
            f"{API}/course/ia-ele/task/{task_id}/threads",
            json={"body_md": "TEST respuesta", "parent_id": parent_id},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r2.status_code == 200

        # List
        g = api_client.get(
            f"{API}/course/ia-ele/task/{task_id}/threads",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert g.status_code == 200
        posts = g.json()["posts"]
        ids = [p["id"] for p in posts]
        assert parent_id in ids
        assert any(p.get("parent_id") == parent_id for p in posts)
