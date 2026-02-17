#!/bin/bash
set -e

echo "Running database migrations..."
python manage.py migrate --noinput || echo "WARNING: Major migration failed, but continuing startup..."

echo "COMPREHENSIVE MIGRATION FIX (ALL APPS)..."
python manage.py fix_all_migrations || echo "Comprehensive fix command not found, trying individual migrations..."

echo "Running bookings app migration explicitly (CRITICAL)..."
python manage.py migrate bookings --noinput || echo "Bookings migration warning"

echo "Running emails app migration explicitly..."
python manage.py migrate emails --noinput || echo "Email migration warning"

echo "Checking marketing migrations status..."
python manage.py showmigrations marketing || echo "Could not show marketing migrations"

echo "Running marketing app migration explicitly..."
python manage.py migrate marketing --noinput || echo "WARNING: Marketing migration failed, but continuing..."

echo "checking cms migrations..."
python manage.py showmigrations cms || echo "Could not show cms migrations"
python manage.py migrate cms --noinput || echo "CMS migration FAILED but continuing..."

echo "Running core app migrations (for RBAC users)..."
python manage.py showmigrations core || echo "Could not show core migrations"
python manage.py migrate core --noinput || echo "Core migration FAILED but continuing..."

echo "Running shop app migrations (for vouchers)..."
python manage.py showmigrations shop || echo "Could not show shop migrations"
python manage.py migrate shop --noinput || echo "Shop migration FAILED but continuing..."

echo "Creating RBAC users via management command..."
python manage.py create_rbac_users || echo "WARNING: User creation command failed"

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn --bind=0.0.0.0:8000 --timeout 600 --workers 2 --access-logfile - --error-logfile - ninja_backend.wsgi:application
