FROM python:3.11-slim

# Install Docker CLI so Django can spawn containers on Railway
RUN apt-get update && apt-get install -y \
    docker.io \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# migrate + collectstatic at runtime (so env vars like SECRET_KEY are available)
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn codenest_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
