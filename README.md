# Mercaduca — Frontend

Interfaz de usuario del marketplace Mercaduca. Desarrollada con React 18 + Vite, consume la API REST del backend y soporta tres roles: comprador, vendedor y administrador.

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| React | 18 |
| Vite | 5 |
| React Router DOM | 6 |
| Axios | 1.x |
| React Hot Toast | 2.x |
| Lucide React | 0.383 |
| Zustand | 4.x |
| React Query | 5.x |
| React Hook Form | 7.x |
| Date-fns | 3.x |

---

## Requisitos previos

- Node.js 18+ (`node -v`)
- npm 9+ o pnpm (`npm -v`)
- Backend corriendo en `http://localhost:8080`

---

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Juanbermudezp/mercadouca_frontend.git
cd mercadouca_frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

---

## Compilar para producción

```bash
npm run build
```

Los archivos generados quedan en la carpeta `dist/`.

---

## Estructura del proyecto

```
src/
├── api/              # Configuración de Axios e interceptores HTTP
├── components/
│   ├── common/       # Botones, inputs, cards, badges, spinners
│   └── layout/       # Navbar, sidebar, layout principal
├── context/          # AuthContext, CartContext
├── pages/
│   ├── admin/        # Panel de administración
│   ├── auth/         # Login y registro
│   ├── buyer/        # Perfil, notificaciones, favoritos, direcciones
│   ├── chat/         # Mensajería
│   ├── orders/       # Historial de compras
│   ├── product/      # Detalle de producto
│   ├── seller/       # Dashboard, productos, ventas del vendedor
│   └── shop/         # Tienda con filtros y búsqueda
├── services/         # Capa de servicios (llamadas a la API por módulo)
├── constants/        # Constantes globales (rutas API, estados de órdenes)
└── main.jsx          # Punto de entrada
```

---

## Vistas por rol

### Comprador (BUYER)
- Tienda con búsqueda y filtros
- Detalle de producto con reseñas y preguntas
- Carrito, checkout y seguimiento de órdenes
- Chat con vendedores
- Lista de deseos, notificaciones, direcciones, disputas

### Vendedor (SELLER)
- Hereda todas las vistas del comprador
- Dashboard con métricas de ventas
- Gestión de productos (crear, editar, eliminar)
- Gestión de ventas recibidas
- Cupones y gestión de disputas

### Administrador (ADMIN)
- Dashboard general de la plataforma
- Gestión de usuarios (activar/desactivar, aprobar vendedores)
- Gestión de productos (eliminar)
- Gestión de órdenes con búsqueda
- Categorías y disputas

---

## Variables de entorno disponibles

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:8080/api/v1` |

---

## Equipo

Proyecto académico — Universidad. Todos los derechos reservados.
