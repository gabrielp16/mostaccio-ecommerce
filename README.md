# E-commerce React + MongoDB + Bootstrap

Proyecto base full stack inspirado en una experiencia de marca con foco visual.

## Stack

- Frontend: React + Vite + Bootstrap + CSS custom
- Backend: Node.js + Express
- Base de datos: MongoDB + Mongoose

## Estructura

- `client/`: web UI
- `server/`: API + seed de productos

## 1) Backend

```bash
cd server
cp .env.example .env
npm run dev
```

Si aun no tienes productos en MongoDB:

```bash
cd server
npm run seed
```

## 2) Frontend

```bash
cd client
cp .env.example .env
npm run dev
```

La UI quedara en `http://localhost:5173` y consumira la API en `http://localhost:5000/api`.

## Endpoints base

- `GET /api/health`
- `GET /api/products`
- `POST /api/orders`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/admin/orders` (admin)
- `GET /api/admin/products` (admin)
- `POST /api/admin/products` (admin)
- `PATCH /api/admin/products/:id` (admin)
- `DELETE /api/admin/products/:id` (admin)
- `GET /api/admin/users` (permiso `users:read`)
- `GET /api/admin/users/:id` (permiso `users:read`)
- `POST /api/admin/users` (permiso `users:create`)
- `PATCH /api/admin/users/:id` (permiso `users:update`)
- `DELETE /api/admin/users/:id` (permiso `users:delete`)
- `GET /api/admin/roles` (permiso `roles:read`)
- `POST /api/admin/roles` (permiso `roles:create`)
- `PATCH /api/admin/roles/:id` (permiso `roles:update`)
- `DELETE /api/admin/roles/:id` (permiso `roles:delete`)

## Admin demo

Despues de ejecutar `npm run seed` en server:

- Administrador: `admin@mostaccio.local` / `admin12345`
- Empleado: `empleado@mostaccio.local` / `empleado12345`
- Contador: `contador@mostaccio.local` / `contador12345`
- Supervisor: `supervisor@mostaccio.local` / `supervisor12345`

## Roles base del sistema

- `admin`: acceso total (usuarios, roles, ordenes y productos)
- `employee`: gestion operativa de productos y lectura de ordenes
- `accountant`: lectura y actualizacion de estados de orden
- `supervisor`: supervision de ordenes/productos y lectura de usuarios
- `customer`: registro/login para compra en ecommerce

## Siguientes mejoras recomendadas

- Login/JWT para clientes y panel admin
- Pasarela de pago (Stripe/Mercado Pago)
- Inventario por tallas/variantes
- Busqueda avanzada y filtros por precio
