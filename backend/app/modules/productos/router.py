from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    DisponibilidadUpdate,
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoUpdate,
    StockUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])
admin_only = require_role(["admin"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    service: ProductoService = Depends(get_producto_service),
):
    return service.list(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def detalle(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.get(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


@router.post(
    "", response_model=ProductoRead, status_code=status.HTTP_201_CREATED
)
def crear(
    data: ProductoCreate,
    _: Usuario = Depends(admin_only),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.create(data)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(
    producto_id: int,
    data: ProductoUpdate,
    _: Usuario = Depends(admin_only),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.update(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def cambiar_stock(
    producto_id: int,
    data: StockUpdate,
    _: Usuario = Depends(admin_only),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.update_stock(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


@router.patch("/{producto_id}/disponibilidad", response_model=ProductoRead)
def cambiar_disponibilidad(
    producto_id: int,
    data: DisponibilidadUpdate,
    _: Usuario = Depends(admin_only),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.update_disponibilidad(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(
    producto_id: int,
    _: Usuario = Depends(admin_only),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.delete(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")