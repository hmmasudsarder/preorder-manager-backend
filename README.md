# Preorder Manager Backend

This project is a Node.js, Express, TypeScript, and Prisma backend for managing preorder records with PostgreSQL.

## Requirements

- Node.js 18+
- PostgreSQL
- npm or bun

## 1. Clone and install

```bash
git clone <your-repo-url>
cd preorder-manager-backend
npm install
```

If you use Bun:

```bash
bun install
```

## 2. Create environment variables

Create a .env file in the project root:

```env
NODE_ENV=development
PORT=5000
HOST=localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/preorder_manager

JWT_ACCESS_SECRET=dev_access_secret
JWT_REFRESH_SECRET=dev_refresh_secret
JWT_RESET_PASS_ACCESS_EXPIRES_IN=10m

SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=super123456

BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## 3. Set up PostgreSQL

Create a database named preorder_manager in PostgreSQL, then run:

```bash
npx prisma generate
npx prisma db push
```

The app will automatically create a super admin on startup using the values from .env.

## 4. Run the project locally

```bash
npm run dev
```

The server will start at:

```text
http://localhost:5000
```

## 5. Sample data / seeding

- A super admin is created automatically when the server starts.
- To create sample preorder records, use the preorder API below.

## Preorder CRUD

Base URL:

```text
http://localhost:5000/api/v1/preorder
```

### Create preorder

```bash
curl -X POST http://localhost:5000/api/v1/preorder/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Preorder",
    "products": 5,
    "preorderWhen": "out-of-stock",
    "startsAt": "2026-07-01T00:00:00.000Z",
    "endsAt": "2026-07-31T00:00:00.000Z",
    "status": true
  }'
```

### Get all preorders

```bash
curl http://localhost:5000/api/v1/preorder
```

### Get one preorder

```bash
curl http://localhost:5000/api/v1/preorder/:id
```

### Update preorder

```bash
curl -X PUT http://localhost:5000/api/v1/preorder/:id \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Preorder",
    "status": false
  }'
```

### Delete preorder

```bash
curl -X DELETE http://localhost:5000/api/v1/preorder/:id
```

## Notes

- The list endpoint supports filtering and pagination through query parameters.
- If you want to inspect the database visually, you can run:

```bash
npx prisma studio
```
