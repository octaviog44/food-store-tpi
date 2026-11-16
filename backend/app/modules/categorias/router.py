from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])
admin_only = require_role(["admin"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    return service.list()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def detalle(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.get(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED
)
def crear(
    data: CategoriaCreate,
    _: Usuario = Depends(admin_only),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.create(data)
    except NombreDuplicado:
        raise HTTPException(status_code=409, detail="Nombre duplicado")


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(
    categoria_id: int,
    data: CategoriaUpdate,
    _: Usuario = Depends(admin_only),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.update(categoria_id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    except NombreDuplicado:
        raise HTTPException(status_code=409, detail="Nombre duplicado")


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(
    categoria_id: int,
    _: Usuario = Depends(admin_only),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.delete(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")