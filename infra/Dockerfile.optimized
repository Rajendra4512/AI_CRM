FROM node:20-alpine AS frontend

WORKDIR /app/web
COPY apps/web/package*.json ./
RUN npm ci --only=production 2>&1 || npm install
COPY apps/web ./
RUN npm run build 2>&1 || true

FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    redis-server \
    nginx \
    supervisor \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /app/web/dist ./apps/web/dist

COPY infra/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 5000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
