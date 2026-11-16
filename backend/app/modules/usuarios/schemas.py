from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime


class UserRegister(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=100)
    password: str = Field(min_length=6, max_length=72)


class UserCreate(SQLModel):
    """Para el seed: mismo que register pero con role explícito."""
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=100)
    password: str = Field(min_length=6, max_length=72)
    role: str = Field(default="user", max_length=10)