from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ContentType(str, Enum):
    blog = 'blog'
    product = 'product'
    social = 'social'
    email = 'email'
    seo_title = 'seo_title'
    seo_meta = 'seo_meta'


class ContentCreate(BaseModel):
    project_id: int | None = None
    title: str | None = None
    content_type: ContentType
    prompt: str
    generated_content: str | None = None
    tone: str | None = None
    word_count: int | None = None
    target_audience: str | None = None
    keywords: str | None = None
    language: str | None = None


class ContentDB(ContentCreate):
    id: int
    user_id: int
    favorite: bool
    created_at: datetime

    class Config:
        orm_mode = True
