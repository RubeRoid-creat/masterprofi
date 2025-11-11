# MasterProfi - Service Platform

## 🎯 Project Overview

Multi-service SaaS platform для управления сервисной сетью с MLM-механиками.

**Stack:** MERN + Python + React Native  
**Team:** 4-6 developers  
**Timeline:** 9 months  
**Budget:** ~$100K

## 🏗️ Architecture

### Microservices Structure
- **Auth Service** - JWT authentication & authorization
- **User Service** - User profiles & management
- **Order Service** - Order processing & tracking
- **Payment Service** - Payment processing & distribution
- **MLM Service** - MLM calculations & hierarchy
- **Notification Service** - Real-time notifications
- **Analytics Service** - Business intelligence

### Technology Stack
```
Backend:  NestJS + TypeScript + PostgreSQL
Frontend: React 18 + Redux Toolkit + Tailwind CSS
Mobile:   React Native + Redux Toolkit
MLM:      Python calculation engine
Real-time: Socket.io + Firebase
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd MasterProfi

# Install dependencies
npm run install:all

# Setup environment
cp .env.example .env

# Start database
docker-compose up -d postgres

# Run migrations
cd backend
npm run migration:run

# Start development servers
npm run dev
```

## 📁 Project Structure

```
MasterProfi/
├── backend/              # NestJS Backend API
│   ├── src/
│   │   ├── auth/        # Auth service
│   │   ├── users/       # User service
│   │   ├── orders/      # Order service
│   │   ├── payments/    # Payment service
│   │   ├── mlm/         # MLM service
│   │   └── shared/      # Shared modules
│   └── test/
├── web-admin/           # React Admin Panel
├── mobile/              # React Native App
├── mlm-engine/          # Python MLM calculator
└── docs/                # Documentation
```

## 🔐 Authentication

JWT-based with refresh tokens:
- Role-based access control (Client, Master, Admin)
- HttpOnly cookies for web
- SecureStore for mobile
- 2FA ready

## 💰 MLM System

Multi-level commission structure:
- Level 1: 3%
- Level 2: 2%
- Level 3: 1%
- Auto-calculation on payment
- Balance management

## 📊 Features

### Core Domains
- ✅ Service Management
- ✅ MLM Network
- ✅ Payment Processing
- ✅ Knowledge Base
- ✅ Analytics

### User Roles
- **Client** - Create orders, track status
- **Master** - Accept orders, manage services
- **Admin** - Full platform management

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [MLM System](docs/MLM.md)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🛠️ Development

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd web-admin && npm run dev

# Mobile
cd mobile && npm run android
```

## 📦 Deployment

```bash
# Build
npm run build

# Docker
docker-compose up -d

# Production
npm run start:prod
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

**Built with ❤️ for the Russian service market**

