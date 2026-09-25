FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies for psycopg2, SQLite, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /app/

# Expose Django Daphne port
EXPOSE 8000

# Start ASGI server with Daphne
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "community.asgi:application"]