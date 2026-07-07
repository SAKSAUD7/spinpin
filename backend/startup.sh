#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Loading CMS data into Postgres..."
python manage.py loaddata azure_seed_data.json


echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn --bind=0.0.0.0:8000 --timeout 120 --workers 2 --access-logfile - --error-logfile - ninja_backend.wsgi:application
