"""Pydantic models for request/response payloads."""
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr


class VerifyTokenRequest(BaseModel):
    token: str


class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None
    role: Literal["student", "admin"] = "student"
    created_at: str


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    surname: str = Field(min_length=1, max_length=120)


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


class FeedbackIn(BaseModel):
    feedback_md: str
    grade: Optional[int] = Field(None, ge=0, le=10)


class ThreadPostIn(BaseModel):
    body_md: str
    parent_id: Optional[str] = None


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
    user_ids: Optional[list[str]] = None


class UserBulkDeleteIn(BaseModel):
    user_ids: list[str]
