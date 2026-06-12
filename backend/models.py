"""Pydantic models for request/response payloads."""
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    # RGPD opt-in: stored on the user only when the account is first created.
    marketing_consent: bool = False


class VerifyTokenRequest(BaseModel):
    token: str


class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None
    github_url: Optional[str] = None
    role: Literal["student", "admin"] = "student"
    created_at: str


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    surname: str = Field(min_length=1, max_length=120)
    github_url: Optional[str] = Field(default=None, max_length=200)


class CourseOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    price_eur: int
    price_founder_eur: int
    is_founder_edition: bool
    founder_seats: int
    founder_seats_taken: int
    active: bool
    hours: int = 20
    start_date: Optional[str] = None


class CheckoutRequest(BaseModel):
    course_slug: str
    origin_url: str


class SubmissionIn(BaseModel):
    content_md: str = ""
    file_url: Optional[str] = None
    repo_url: Optional[str] = Field(default=None, max_length=300)


class FeedbackIn(BaseModel):
    feedback_md: str
    grade: Optional[int] = Field(None, ge=0, le=10)


class ThreadPostIn(BaseModel):
    body_md: str
    parent_id: Optional[str] = None


class ThreadPostUpdate(BaseModel):
    body_md: str = Field(..., min_length=1, max_length=10000)


class ContactIn(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    asunto: str = Field("Otro", max_length=120)
    mensaje: str = Field(..., min_length=5, max_length=5000)


class LessonViewIn(BaseModel):
    lesson_id: str


class QuizSubmitIn(BaseModel):
    nombre: str = ""
    email: str = ""
    answers: dict[str, Any] = {}
    profile_key: str = ""
    total_score: int = 0


class AdminCourseUpdate(BaseModel):
    is_founder_edition: Optional[bool] = None
    founder_seats: Optional[int] = None
    founder_seats_taken: Optional[int] = None
    active: Optional[bool] = None
    intro_video_youtube_id: Optional[str] = None


class AdminModuleUpdate(BaseModel):
    order: Optional[int] = None
    unlocked: Optional[bool] = None  # sets/clears unlocked_at
    video_youtube_id: Optional[str] = None
    # ISO-8601 date or datetime string (or empty string to clear). When set,
    # the module will auto-unlock at that moment (scheduler runs hourly).
    unlock_at: Optional[str] = None


class AdminManualEnrollment(BaseModel):
    email: EmailStr
    course_slug: str = "ia-ele"
    as_founder: bool = False
    amount_eur: float = 0.0  # 0 = free/sponsored; otherwise arbitrary amount paid outside Stripe
    note: str = ""
    send_welcome_email: bool = True


class UserBroadcastIn(BaseModel):
    subject: str
    body_md: str
    target: Literal["all", "enrolled", "not_enrolled", "selected"] = "all"
    audience: Literal["current_edition", "alumni", "everyone"] = "current_edition"
    user_ids: Optional[list[str]] = None


class UserBulkDeleteIn(BaseModel):
    user_ids: list[str]


# ─────────────────────────── Polls / encuestas ───────────────────────────
class PollOptionIn(BaseModel):
    label: str = Field(min_length=1, max_length=200)


class PollCreate(BaseModel):
    question: str = Field(min_length=4, max_length=300)
    options: list[PollOptionIn] = Field(min_length=2, max_length=8)
    multi_choice: bool = False
    course_slug: Optional[str] = None  # restricts visibility to enrolled students
    intro_md: Optional[str] = Field(default=None, max_length=4000)
    closes_at: Optional[str] = None  # ISO-8601 datetime


class PollVoteIn(BaseModel):
    option_ids: list[str] = Field(min_length=1, max_length=8)


class PollEmailIn(BaseModel):
    subject: Optional[str] = Field(default=None, max_length=200)
    intro_md: Optional[str] = Field(default=None, max_length=4000)
    user_ids: Optional[list[str]] = None  # if None → all enrolled students


# ─────────────────────── Session recordings ──────────────────────────────
class SessionRecordingIn(BaseModel):
    course_slug: str = Field(min_length=1, max_length=80)
    session_n: int = Field(ge=1, le=99)
    title: str = Field(min_length=1, max_length=200)
    youtube_id: str = Field(min_length=4, max_length=40)
    recorded_at: Optional[str] = None  # ISO date (yyyy-mm-dd or full ISO)
    description_md: Optional[str] = Field(default=None, max_length=4000)


class SessionRecordingUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    youtube_id: Optional[str] = Field(default=None, min_length=4, max_length=40)
    recorded_at: Optional[str] = None
    description_md: Optional[str] = Field(default=None, max_length=4000)
    session_n: Optional[int] = Field(default=None, ge=1, le=99)
