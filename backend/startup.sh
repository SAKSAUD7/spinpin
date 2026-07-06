#!/bin/bash
set -e

# Temporarily bypassed to prevent DB lock hangs during crash loop recovery
# python manage.py migrate --noinput

echo "Running safe SpinPin seed scripts in background..."
(
    python populate_spinpin_content.py || true
    python full_seed.py || true
    python cms_seed_spinpin.py || true
) &

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn --bind=0.0.0.0:8000 --timeout 120 --workers 2 --access-logfile - --error-logfile - ninja_backend.wsgi:application
