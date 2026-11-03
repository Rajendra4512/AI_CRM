# Stage 6: Docker Container Setup & Deployment Plan

## Requirements
- Single container monolithic architecture
- Docker Desktop installed (already available)
- Don't touch existing containers
- Plan for new container with proportionate resources
- Marketing on localhost:5000, App on app.localhost:5000
- Check port 5000 availability (done - available)

## Container Strategy
Create a new Docker container `salesfortis-app` with all services running inside via supervisord.

## Dockerfile Structure
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    redis-server \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy and build frontend
COPY apps/web ./apps/web
RUN cd apps/web && npm install && npm run build

# Copy backend and other files
COPY . .

# Setup supervisord
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 5000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

## Supervisord Configuration
Manage all processes:
- nginx (reverse proxy / static files)
- postgresql
- redis
- qdrant
- fastapi (uvicorn)
- celery workers (ingestion, ml, notifications)
- mlflow server (optional)
- litellm proxy (optional)

## Resource Allocation
Initial allocation (proportionate to laptop):
```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
    reservations:
      cpus: '2'
      memory: 4G
```

Adjust based on actual needs. Can be modified in docker-compose for the new container.

## Docker Compose for New Container
Create `docker-compose.salesfortis.yml`:
```yaml
version: '3.8'
services:
  salesfortis:
    build: .
    container_name: salesfortis-app
    ports:
      - "5000:5000"
    volumes:
      - salesfortis_data:/var/lib/postgresql/data
      - salesfortis_redis:/data
      - salesfortis_qdrant:/qdrant/storage
      - salesfortis_uploads:/app/uploads
    environment:
      - DATABASE_URL=postgresql://salesfortis:password@localhost:5432/salesfortis
      - REDIS_URL=redis://localhost:6379
      - QDRANT_URL=http://localhost:6333
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
```

## Host File Configuration
May need to add to hosts file for app.localhost:
```
127.0.0.1 localhost app.localhost
```

But requirement says "app can be hosted on app.localhost:5000" - need to ensure routing works.

## Port Routing Strategy
Option 1: Use different server names in nginx - localhost for marketing, app.localhost for app
Option 2: Use path-based routing - / for marketing, /app for application
Option 3: Use different ports (but requirement says same port structure)

Need to implement nginx config to handle both.

## Volume Management
Persistent volumes for:
- PostgreSQL data
- Redis data
- Qdrant storage
- Uploaded documents
- ML models/artifacts
- Logs

## Build and Run
```bash
docker-compose -f docker-compose.salesfortis.yml build
docker-compose -f docker-compose.salesfortis.yml up -d
```

## Health Checks
Add health check endpoint and container health monitoring
