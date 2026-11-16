from fastapi import HTTPException
from sqlmodel import Session

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


def list_usuarios(session: Session) -> list[Usuario]:
    return UsuarioRepository(session).get_all()


def activar_usuario(session: Session, usuario_id: int) -> Usuario:
    repo = UsuarioRepository(session)
    user = repo.get_by_id(usuario_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.disabled = False
    repo.add(user)
    session.commit()
    session.refresh(user)
    return user


def desactivar_usuario(
    session: Session, usuario_id: int, current_user: Usuario
) -> Usuario:
    if usuario_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Un admin no puede desactivarse a sí mismo",
        )
    repo = UsuarioRepository(session)
    user = repo.get_by_id(usuario_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.disabled = True
    repo.add(user)
    session.commit()
    session.refresh(user)
    return user