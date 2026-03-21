FROM python:3.11-slim

# Install Docker CLI (so Django can talk to the Railway Docker socket)
RUN apt-get update && apt-get install -y \
    docker.io \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD gunicorn codenest_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
