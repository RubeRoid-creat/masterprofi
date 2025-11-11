# MasterProfi Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
# Root
npm install

# Backend
cd backend
npm install

# Web Admin (coming soon)
cd ../web-admin
npm install
```

### 2. Database Setup

```bash
# Option A: Docker (recommended)
docker-compose up -d postgres redis

# Option B: Local PostgreSQL
# Create database:
psql -U postgres
CREATE DATABASE masterprofi;
CREATE USER masterprofi WITH PASSWORD 'masterprofi_pass';
GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;
\q
```

### 3. Environment Configuration

```bash
cd backend
cp .env.example .env

# Edit .env with your settings
```

### 4. Run Backend

```bash
cd backend
npm run start:dev
```

Backend will run on: http://localhost:3000
API Docs: http://localhost:3000/api/docs

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/api

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Architecture

```
MasterProfi/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication
│   │   ├── users/    # User management
│   │   ├── orders/   # Order processing
│   │   ├── payments/ # Payment handling
│   │   ├── mlm/      # MLM calculations
│   │   └── notification/ # Real-time
│   └── test/
├── web-admin/        # React Admin (TODO)
├── mobile/           # React Native (TODO)
└── docs/             # Documentation
```

## Development

### Backend Scripts

```bash
npm run start:dev    # Development mode
npm run build        # Build for production
npm run test         # Run tests
npm run test:cov     # Coverage report
npm run lint         # Lint code
```

### Code Generation

```bash
# Generate module
nest g module users

# Generate controller
nest g controller users

# Generate service
nest g service users
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `PATCH /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker ps

# Or
pg_isready -h localhost -U masterprofi
```

### Port already in use
```bash
# Change PORT in .env
PORT=3001
```

### TypeORM errors
```bash
# Drop and recreate
npm run migration:revert
npm run migration:run
```

## Next Steps

1. Implement MLM calculation engine
2. Add payment processing
3. Create React Admin panel
4. Build mobile app
5. Add real-time notifications

