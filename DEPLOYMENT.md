## Production Deployment Guide

This document describes how to deploy MasterProfi to a Linux server (Ubuntu 22.04 LTS recommended) using Docker.

### 1) Prerequisites

- Docker Engine 24+ and Docker Compose v2
- A domain and TLS (via reverse proxy or cloud LB)
- Server sizing: 4 vCPU, 8–16 GB RAM, 100+ GB SSD (see system requirements)

### 2) Environment

Create a `.env` file at the repository root with secure values:

```
POSTGRES_USER=masterprofi
POSTGRES_PASSWORD=change_me_secure
POSTGRES_DB=masterprofi

JWT_SECRET=change_me_secure_jwt
JWT_REFRESH_SECRET=change_me_secure_refresh
JWT_EXPIRES_IN=1h

YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=

VITE_API_URL=https://your-domain/api
```

> Note: `VITE_API_URL` is injected at build-time for the web-admin Docker image.

### 3) Build and Run (Production)

```
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

- Backend (NestJS) runs on internal network, port 3000 (container).
- Web admin is served by Nginx on host port 8080. Put your reverse proxy (Nginx/Traefik) in front of it with TLS.

### 4) Reverse Proxy

Point your reverse proxy:
- `https://your-domain/` → web-admin (host:8080)
- `https://your-domain/api` → backend (service `masterprofi_backend`:3000)

If you use a single Nginx outside of Docker on the server, configure upstreams accordingly.

### 5) Database and Backups

- Postgres data is persisted in a named volume `postgres_data`.
- Set up regular logical backups (`pg_dump`) and consider PITR for critical data.

### 6) Migrations

Migrations are included. If you need to run them manually:

```
docker compose -f docker-compose.prod.yml exec backend \
  node node_modules/typeorm/cli.js migration:run -d ormconfig.ts
```

or via the provided npm script inside the container:

```
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

### 7) Logs and Monitoring

- Containers log to stdout/stderr; use `docker logs -f <service>`.
- Consider Prometheus + Grafana. Winston logs can be redirected to files if needed.

### 8) Updating

```
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 9) Troubleshooting

- Verify env variables are set correctly.
- `docker compose ps` / `docker compose logs -f backend` for runtime errors.
- Ensure `VITE_API_URL` matches your API reverse proxy path.






