# 05 — Docker Infrastructure & Container Topology

## 1. Local Multi-Host Docker Topology Diagram

```mermaid
flowchart TD
    subgraph HostPorts["Host Network Ports"]
        P5000["Host Port 5000"]
        P5001["Host Port 5001"]
        P8001["Host Port 8001"]
        P5432["Host Port 5432"]
        P6379["Host Port 6379"]
    end

    subgraph DockerBridge["SalesFortis Docker Network (bridge)"]
        subgraph WebContainer["salesfortis-web (NGINX Multi-Host)"]
            NGINX_MKT["Server: localhost:80<br/>(serves /dist marketing)"]
            NGINX_APP["Server: app.localhost:80<br/>(serves /dist app portal)"]
            NGINX_PROXY["proxy_pass http://api:8001"]
        end

        subgraph APIContainer["salesfortis-api (FastAPI Modular Monolith)"]
            UVICORN["Uvicorn ASGI (:8001)<br/>FastAPI Application"]
        end

        subgraph WorkerContainer["salesfortis-worker (Background Worker)"]
            CELERY["Celery Worker<br/>(workers/ingestion.py)"]
        end

        subgraph StorageContainers["Data Persistence Containers"]
            PG_CONT["salesfortis-postgres<br/>(postgres:16-alpine)"]
            REDIS_CONT["salesfortis-redis<br/>(redis:7-alpine)"]
        end
    end

    subgraph Volumes["Host Persistent Storage"]
        VOL_PG[("postgres_data")]
        VOL_REDIS[("redis_data")]
    end

    subgraph ExternalContainers["Existing External Containers (Strictly Untouched)"]
        EXT1["portfolio-compass-frontend-1 (Preserved)"]
        EXT2["portfolio-compass-backend-1 (Preserved)"]
    end

    P5000 -->|Marketing HTTP| NGINX_MKT
    P5001 -->|CRM App HTTP| NGINX_APP
    NGINX_APP -->|/api/*| NGINX_PROXY
    NGINX_PROXY -->|internal:8001| UVICORN
    P8001 -->|Direct API| UVICORN

    UVICORN -->|Port 5432| PG_CONT
    UVICORN -->|Port 6379| REDIS_CONT
    CELERY -->|Task Queue| REDIS_CONT
    CELERY -->|Store Results| PG_CONT

    P5432 --> PG_CONT
    P6379 --> REDIS_CONT

    PG_CONT --- VOL_PG
    REDIS_CONT --- VOL_REDIS
```

---

## 2. Port Allocation & Healthcheck Register

| Service Container | Context / Dockerfile | Internal Port | Host Port | Healthcheck Specification |
| :--- | :--- | :--- | :--- | :--- |
| `salesfortis-web` | `infra/Dockerfile.web` | `80` | `5000:80`, `5001:80` | `wget -qO- http://localhost:80/ > /dev/null \|\| exit 1` |
| `salesfortis-api` | `infra/Dockerfile.api` (includes `workers/`) | `8001` | `8001:8001` | `curl -f http://localhost:8001/api/health \|\| exit 1` |
| `salesfortis-worker` | `infra/Dockerfile.worker` | - | - | Dependent on `postgres` & `redis` health |
| `salesfortis-postgres` | `postgres:16-alpine` | `5432` | `127.0.0.1:5432:5432` (Loopback Only) | `pg_isready -U salesfortis -d salesfortis` |
| `salesfortis-redis` | `redis:7-alpine` | `6379` | `127.0.0.1:6379:6379` (Loopback Only) | `redis-cli ping` |

---

## 3. Strict Non-Destructive Operation Rules
- **No Global Prunes**: Commands like `docker system prune`, `docker stop $(docker ps -q)`, or `docker rm -f` are strictly prohibited.
- **Explicit Project Scoping**: All compose commands must explicitly specify the compose file:
  `docker compose -f infra/docker-compose.dev.yml up -d`
- **External Container Protection**: Existing running or stopped containers (e.g. `portfolio-compass-*`) are completely isolated on their own networks and will never be modified or stopped.

