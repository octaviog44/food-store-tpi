from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.deps import get_session, require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    activar_usuario,
    desactivar_usuario,
    list_usuarios,
)

router = APIRouter(prefix="/admin/usuarios", tags=["admin-usuarios"])

admin_only = require_role(["admin"])


@router.get("", response_model=list[UserPublic])
def listar(
    _: Usuario = Depends(admin_only),
    session: Session = Depends(get_session),
):
    return list_usuarios(session)


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(
    usuario_id: int,
    _: Usuario = Depends(admin_only),
    session: Session = Depends(get_session),
):
    return activar_usuario(session, usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(
    usuario_id: int,
    current_user: Usuario = Depends(admin_only),
    session: Session = Depends(get_session),
):
    return desactivar_usuario(session, usuario_id, current_user)