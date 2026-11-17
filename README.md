# Food Store — Trabajo Práctico Integrador

Sistema de pedidos de comida con backend **FastAPI + SQLModel + PostgreSQL** y frontend **React + TypeScript + Zustand + TanStack Query**.

- **Materia:** Programación IV
- **Entrega:** Trabajo Práctico Integrador (TPI)
- **Repositorio:** https://github.com/octaviog44/food-store-tpi
- **Video de demostración:** PEGAR_AQUI_URL_DEL_VIDEO

---

## Índice

- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Backend](#backend)
- [Frontend](#frontend)
- [Variables de entorno](#variables-de-entorno)
- [Usuario admin del seed](#usuario-admin-del-seed)
- [Video de demostración](#video-de-demostración)

---

## Estructura del proyecto

```
food-store/
├── backend/
│   ├── app/
│   │   ├── core/              # Configuración, seguridad, DB, UoW base
│   │   ├── modules/           # auth, usuarios, categorias, productos, pedidos
│   │   ├── db/                # seed.py
│   │   └── main.py            # App FastAPI
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/          # auth, catalog, cart, orders, admin
│   │   ├── shared/            # api, components, hooks, types
│   │   ├── router.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.11 |
| PostgreSQL | 15 |
| Node.js | 20 |
| pnpm | 9 |
| Git | 2.30 |

> **Nota sobre Python:** el proyecto fue desarrollado y probado con Python 3.14 usando las versiones fijadas en `requirements.txt`. Para versiones 3.11 a 3.13 también funciona sin cambios.

---

## Backend

### 1. Instalación

```bash
cd backend

# Crear y activar el entorno virtual
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Windows (Git Bash):
source venv/Scripts/activate

# Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Crear la base de datos

Con PostgreSQL corriendo, crear la base `food_store_db` (con pgAdmin o psql):

```sql
CREATE DATABASE food_store_db;
```

### 3. Configurar variables de entorno

Copiar `backend/.env.example` a `backend/.env` y completar los valores:

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/food_store_db
SECRET_KEY=GENERAR_CON_EL_COMANDO_DE_ABAJO
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

Para generar una `SECRET_KEY` segura:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

> **Seguridad:** el archivo `.env` **nunca** debe subirse al repositorio. Solo se versiona `.env.example`.

### 4. Cargar datos iniciales (seed)

```bash
python -m app.db.seed
```

El seed es **idempotente**: si se ejecuta dos veces, no duplica datos. Crea:

- Usuario administrador (ver [Usuario admin del seed](#usuario-admin-del-seed))
- 4 categorías: Hamburguesas, Pizzas, Bebidas, Postres
- 7 productos de ejemplo con stock e imagen

### 5. Ejecutar el backend

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Documentación alternativa (Redoc): http://localhost:8000/redoc

### Arquitectura en capas

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Router | `router.py` | HTTP: valida schemas, resuelve sesión y rol, delega al Service |
| Service | `service.py` | Reglas de negocio (RN-01 a RN-06) |
| Unit of Work | `unit_of_work.py` | Abre la sesión y hace commit o rollback en `__exit__` |
| Repository | `repository.py` | Consultas SQL (sin lógica de negocio) |
| Model | `models.py` | Tablas SQLModel (`table=True`) |
| Schema | `schemas.py` | Modelos Pydantic de entrada y salida de la API |

> **Regla del Unit of Work:** ningún Service ni Router llama a `session.commit()`. El commit ocurre únicamente en el `__exit__` del Unit of Work, y los Services de categorías, productos y pedidos devuelven los schemas dentro del bloque `with self.uow as uow`.

### Reglas de negocio implementadas

- **RN-01** Crear pedido: transaccional, valida stock y descuenta en la misma iteración.
- **RN-02** Máquina de estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`, con `CANCELADO` desde cualquier estado no terminal. Estados terminales: `ENTREGADO` y `CANCELADO`.
- **RN-03** Cancelar: restituye el stock de cada línea en la misma transacción que cambia el estado.
- **RN-04** Permisos: el cliente solo ve y cancela sus propios pedidos y solo desde `PENDIENTE`; el admin ve todos y puede avanzar o cancelar.
- **RN-05** Inmutabilidad: las líneas y el total no cambian después de creado el pedido.
- **RN-06** Datos del pedido: `forma_pago` (`EFECTIVO` o `TRANSFERENCIA`) y `direccion_entrega` (5 a 200 caracteres) validados en el schema.

---

## Frontend

### 1. Instalación

```bash
cd frontend
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp frontend/.env.example frontend/.env
```

Contenido de `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Ejecutar en desarrollo

Con el backend corriendo en otra terminal:

```bash
pnpm dev
```

Abrir http://localhost:5173.

### 4. Build de producción

```bash
pnpm build
pnpm preview
```

### Estructura del frontend

```
src/
├── features/                  # Organización por dominio
│   ├── auth/                  # Login, Register, ProtectedRoute, authStore
│   ├── catalog/               # Catálogo, búsqueda, filtros, paginación
│   ├── cart/                  # Carrito y checkout
│   ├── orders/                # Mis pedidos
│   └── admin/                 # Dashboard, pedidos, productos, categorías, usuarios
├── shared/
│   ├── api/                   # Cliente Axios con withCredentials e interceptor 401
│   ├── components/            # Layout
│   ├── hooks/                 # useDebounce
│   └── types/                 # Tipos TypeScript del backend
├── router.tsx                 # Rutas con ProtectedRoute por rol
└── main.tsx                   # Entry point
```

### Stack del frontend

| Librería | Rol |
|---|---|
| React + TypeScript (strict) | UI y tipado |
| Vite | Bundler |
| Tailwind CSS | Estilos |
| Zustand + persist | Estado de sesión (`authStore`) y carrito (`cartStore`) |
| TanStack Query | Estado del servidor, caché e invalidación |
| TanStack Form | Formularios de auth, checkout y admin |
| TanStack Table | Tablas del panel de administración |
| Axios | Cliente HTTP con `withCredentials` e interceptor de 401 |
| React Router | Rutas y `ProtectedRoute` por rol |

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://postgres:pass@localhost:5432/food_store_db` |
| `SECRET_KEY` | Clave secreta para firmar los JWT | (generar con `secrets.token_urlsafe(32)`) |
| `ALGORITHM` | Algoritmo de firma del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de validez del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## Usuario admin del seed

| Campo | Valor |
|---|---|
| **Usuario** | `admin` |
| **Contraseña** | `admin123` |
| **Email** | `admin@foodstore.com` |
| **Rol** | `admin` |

Para crear un cliente de prueba, usar la pantalla `/register` del frontend.

---

## Video de demostración

**URL:** PEGAR_AQUI_URL_DEL_VIDEO

Duración: 10 a 15 minutos. Contenido del video:

1. Presentación con cámara encendida.
2. Registro de un usuario nuevo.
3. Compra como cliente: catálogo, carrito, checkout, ver pedido.
4. Verificación del descuento de stock.
5. Gestión como admin: dashboard, avance de pedidos, edición de productos, activación y desactivación de usuarios.
6. Cancelación de pedido con restitución de stock.
7. Recorrido por la documentación de la API en `/docs`.