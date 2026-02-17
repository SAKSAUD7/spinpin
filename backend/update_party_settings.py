"""
Update settings for party availability
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

from apps.cms.models import Settings

def update_settings():
    """Update settings with SpinPin party availability"""
    
    settings = Settings.objects.first()
    if settings:
        settings.party_availability = "Thursday's to Sunday's"
        settings.save()
        print(f"✓ Updated party availability: {settings.party_availability}")
    else:
        print("⚠ No settings found")

if __name__ == '__main__':
    update_settings()
