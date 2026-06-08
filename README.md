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

## Admin demo

Despues de ejecutar `npm run seed` en server:

- Correo: `admin@motaccio.local`
- Password: `admin12345`

## Siguientes mejoras recomendadas

- Login/JWT para clientes y panel admin
- Pasarela de pago (Stripe/Mercado Pago)
- Inventario por tallas/variantes
- Busqueda avanzada y filtros por precio
