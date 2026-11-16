from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.deps import get_current_active_user, get_session
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import (
    authenticate_user,
    issue_token_for,
    register_user,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED
)
def register(
    data: UserRegister, session: Session = Depends(get_session)
) -> Usuario:
    return register_user(session, data)


@router.post("/token", response_model=MessageResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = authenticate_user(session, form_data.username, form_data.password)
    token = issue_token_for(user)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # en producción: True
        max_age=60 * 30,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def me(current_user: Usuario = Depends(get_current_active_user)):
    return current_user