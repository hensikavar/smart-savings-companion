# Smart Saving Companion — Setup Guide

- **Frontend repo:** https://github.com/hensikavar/smart-savings-companion
- **Backend repo:** https://github.com/hensikavar/smart-saving-companion-backend

## Prerequisites

- **Java 17** (JDK)
- **Node.js 20+** and **npm**
- **Docker & Docker Compose**
- **Git**

---

## 1. Clone the Repositories

This project is split across two repos — clone both into a common parent folder:

```bash
mkdir smart-saving-companion && cd smart-saving-companion

git clone https://github.com/hensikavar/smart-saving-companion-backend.git backend
git clone https://github.com/hensikavar/smart-savings-companion.git frontend
```

---

## 2. Database Setup (PostgreSQL via Docker)

From the `backend/` directory (where `docker-compose.yml` for Postgres lives):

```bash
cd backend
docker compose up -d postgres
```

This spins up:
- **Container:** `smart-expense-postgres`
- **DB name:** `smart_expense`
- **User / Password:** `postgres` / `postgres`
- **Port:** `5432` (mapped to host)
- **Volume:** `postgres_data` (persists data across restarts)

Verify it's running:

```bash
docker ps
docker logs smart-expense-postgres
```

> Flyway is enabled (`baseline-on-migrate: true`) and will automatically run migrations from `classpath:db/migration` the first time the backend starts.

---

## 3. Backend Setup (Spring Boot / Kotlin)

Set the required environment variable before running:

```bash
export SPLITWISE_ENCRYPTION_SECRET=your-secure-secret-here
```

From the `backend/` directory:

```bash
# Linux / macOS
./gradlew bootRun

# Windows
gradlew.bat bootRun
```

Or build a jar and run it:

```bash
./gradlew build
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

Backend runs at: **http://localhost:8000/api**
Swagger UI: **http://localhost:8000/api/swagger-ui.html**

---

## 4. Frontend Setup (React + Vite)

From the `frontend/` directory:

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

App runs at: **http://localhost:5173**

---

## Quick Start (all steps together)

```bash
# 0. Clone both repos (one time only)
mkdir smart-saving-companion && cd smart-saving-companion
git clone https://github.com/hensikavar/smart-saving-companion-backend.git backend
git clone https://github.com/hensikavar/smart-savings-companion.git frontend

# 1. Start the database
cd backend
docker compose up -d postgres

# 2. Start the backend
export SPLITWISE_ENCRYPTION_SECRET=your-secure-secret-here
./gradlew bootRun

# 3. In a new terminal, start the frontend
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

Then visit:
- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/api/swagger-ui.html

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `Connection refused` to Postgres | Ensure `docker compose up -d postgres` ran successfully and port `5432` isn't already in use |
| Flyway migration checksum errors | Delete the `flyway_schema_history` table (dev only) or run `docker compose down -v` to reset the DB volume |
| Frontend can't reach backend (CORS/404) | Confirm `VITE_API_URL` includes the `/api` context path, and check backend CORS config allows `http://localhost:5173` |
| Port `8000` or `5173` already in use | Change `server.port` in `application.yml` or pass `--port` to `vite` |
| Swagger UI 404 | Remember the context path — it's at `/api/swagger-ui.html`, not `/swagger-ui.html` |

---

## Security Notes Before Deploying

- Change the default Spring Security `admin/admin123` credentials
- Move the JWT secret and Splitwise encryption secret out of `application.yml` into environment variables / a secrets manager
- Change the default Postgres password
- Disable `show-sql` and set `hibernate.ddl-auto` to `validate` in production (rely on Flyway migrations only)
