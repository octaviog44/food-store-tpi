from fastapi import HTTPException
from sqlmodel import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserRegister


def register_user(session: Session, data: UserRegister) -> Usuario:
    repo = UsuarioRepository(session)

    if repo.get_by_username(data.username):
        raise HTTPException(status_code=409, detail="Username ya existe")
    if repo.get_by_email(data.email):
        raise HTTPException(status_code=409, detail="Email ya existe")

    user = Usuario(
        username=data.username,
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="user",
    )
    repo.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(
    session: Session, username: str, password: str
) -> Usuario:
    repo = UsuarioRepository(session)
    user = repo.get_by_username(username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401, detail="Credenciales incorrectas"
        )
    if user.disabled:
        raise HTTPException(
            status_code=400, detail="Cuenta de usuario desactivada"
        )
    return user


def issue_token_for(user: Usuario) -> str:
    return create_access_token(user.username)