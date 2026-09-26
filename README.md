# CaneIQ — Sugarcane Belt Intelligence Platform

Fullstack monorepo for the CaneIQ platform: farm/parcel mapping with PostGIS,
crop-cycle tracking, offline-first field operations, and input financing.

## Layout

```
├── frontend/          React 19 + Vite + Tailwind + shadcn/ui + Leaflet
│   └── src/lib/api.ts Typed client for the backend
├── backend/           FastAPI + SQLAlchemy 2 + GeoAlchemy2 (async)
│   ├── app/
│   │   ├── api/       Versioned routers (v1) — the HTTP surface
│   │   ├── core/      Settings (pydantic-settings) + DB engine/session
│   │   ├── models/    SQLAlchemy domain models (PostGIS geometries)
│   │   ├── schemas/   Pydantic request/response contracts
│   │   ├── services/  Business logic layer
│   │   └── workers/   Celery app (NDVI ingestion, weather, overdue checks)
│   ├── alembic/       Migrations (0001 enables PostGIS)
│   ├── scripts/seed.py  Demo belt — Python port of the frontend mock data
│   └── tests/
└── docker-compose.yml PostGIS 16, Redis, API, Celery worker
```

## Quick start

```bash
# 1. Infra + API
cp backend/.env.example backend/.env
docker compose up db redis -d

cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head                                  # enables PostGIS
alembic revision --autogenerate -m "initial schema"   # generate schema migration
alembic upgrade head
python -m scripts.seed                                # demo belt (same data as the prototype)
uvicorn app.main:app --reload                         # http://localhost:8000/docs

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                                           # http://localhost:3000
```

The Vite dev server proxies `/api` → `http://localhost:8000`, so the frontend
calls the API same-origin in development (see `frontend/vite.config.ts`).

## Stack decisions

| Concern | Choice |
| --- | --- |
| Database | PostgreSQL + PostGIS — parcels/zones are polygons; spatial queries are native |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2 async, GeoAlchemy2, Alembic |
| Offline sync | PowerSync or ElectricSQL (Postgres → on-device SQLite) — plugs into `POST /api/v1/cycles/{id}/activities` |
| Storage | S3-compatible for field photos/receipts (never in the DB) |
| Auth | Keycloak / Supabase Auth with real RBAC — `User.role` and `external_auth_id` are in place; guard dependency TODO in `backend/app/api/deps.py` |
| Geospatial serving | Martin/pg_tileserv for belt-scale vector tiles (compose service is ready, commented out) |
| Background jobs | Celery + Redis — `backend/app/workers/celery_app.py` |

## Verification

```bash
cd backend && pytest           # API smoke tests
cd frontend && npm run build   # typecheck + production build
```
