from typing import Callable

from fastapi import Cookie, Depends, HTTPException
from sqlmodel import Session

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


def get_session():
    with session_factory() as session:
        yield session


def get_current_user(
    access_token: str | None = Cookie(default=None, alias="access_token"),
    session: Session = Depends(get_session),
) -> Usuario:
    if not access_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    username = decode_access_token(access_token)
    if not username:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user = UsuarioRepository(session).get_by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    if current_user.disabled:
        raise HTTPException(
            status_code=400, detail="Cuenta de usuario desactivada"
        )
    return current_user


def require_role(allowed_roles: list[str]) -> Callable:
    def checker(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Rol no permitido")
        return current_user

    return checker