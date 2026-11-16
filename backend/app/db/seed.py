"""Seed idempotente: admin, categorías y productos."""
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def run_seed() -> None:
    with Session(engine) as session:
        _seed_admin(session)
        categorias = _seed_categorias(session)
        _seed_productos(session, categorias)


def _seed_admin(session: Session) -> None:
    existing = session.exec(
        select(Usuario).where(Usuario.username == "admin")
    ).first()
    if existing:
        print("· admin ya existe, se omite")
        return
    admin = Usuario(
        username="admin",
        full_name="Administrador",
        email="admin@foodstore.com",
        hashed_password=hash_password("admin123"),
        role="admin",
    )
    session.add(admin)
    session.commit()
    print("✓ admin creado (usuario: admin / contraseña: admin123)")


def _seed_categorias(session: Session) -> dict[str, Categoria]:
    data = [
        {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales"},
        {"nombre": "Pizzas", "descripcion": "Pizzas al horno de barro"},
        {"nombre": "Bebidas", "descripcion": "Bebidas frías y calientes"},
        {"nombre": "Postres", "descripcion": "Postres caseros"},
    ]
    result: dict[str, Categoria] = {}
    for item in data:
        cat = session.exec(
            select(Categoria).where(Categoria.nombre == item["nombre"])
        ).first()
        if not cat:
            cat = Categoria(**item)
            session.add(cat)
            session.commit()
            session.refresh(cat)
            print(f"✓ categoría creada: {cat.nombre}")
        result[cat.nombre] = cat
    return result


def _seed_productos(
    session: Session, categorias: dict[str, Categoria]
) -> None:
    data = [
        {
            "categoria": "Hamburguesas",
            "nombre": "Hamburguesa Clásica",
            "descripcion": "Carne, queso, lechuga y tomate",
            "precio_base": 5500.0,
            "stock": 20,
            "imagen_url": "https://placehold.co/400x300?text=Hamburguesa",
        },
        {
            "categoria": "Hamburguesas",
            "nombre": "Hamburguesa Doble",
            "descripcion": "Doble carne y doble queso",
            "precio_base": 7800.0,
            "stock": 15,
            "imagen_url": "https://placehold.co/400x300?text=Doble",
        },
        {
            "categoria": "Pizzas",
            "nombre": "Pizza Muzzarella",
            "descripcion": "Muzzarella y aceitunas",
            "precio_base": 8500.0,
            "stock": 10,
            "imagen_url": "https://placehold.co/400x300?text=Pizza",
        },
        {
            "categoria": "Pizzas",
            "nombre": "Pizza Napolitana",
            "descripcion": "Muzzarella, tomate y ajo",
            "precio_base": 9200.0,
            "stock": 8,
            "imagen_url": "https://placehold.co/400x300?text=Napolitana",
        },
        {
            "categoria": "Bebidas",
            "nombre": "Coca-Cola 500ml",
            "descripcion": "Gaseosa línea Coca-Cola",
            "precio_base": 1800.0,
            "stock": 50,
            "imagen_url": "https://placehold.co/400x300?text=Coca",
        },
        {
            "categoria": "Bebidas",
            "nombre": "Agua Mineral 500ml",
            "descripcion": "Agua sin gas",
            "precio_base": 900.0,
            "stock": 40,
            "imagen_url": "https://placehold.co/400x300?text=Agua",
        },
        {
            "categoria": "Postres",
            "nombre": "Flan Casero",
            "descripcion": "Con dulce de leche y crema",
            "precio_base": 3200.0,
            "stock": 12,
            "imagen_url": "https://placehold.co/400x300?text=Flan",
        },
    ]

    for item in data:
        cat = categorias[item["categoria"]]
        existing = session.exec(
            select(Producto).where(Producto.nombre == item["nombre"])
        ).first()
        if existing:
            continue
        producto = Producto(
            categoria_id=cat.id,
            nombre=item["nombre"],
            descripcion=item["descripcion"],
            precio_base=item["precio_base"],
            imagen_url=item["imagen_url"],
            stock=item["stock"],
        )
        session.add(producto)
        session.commit()
        print(f"✓ producto creado: {producto.nombre}")


if __name__ == "__main__":
    run_seed()
    print("\nSeed completado.")