#!/usr/bin/env python
"""
Script to manually run the shop migration on Azure database.
This adds the min_hours_before_slot column to the shop_voucher table.
"""

import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def check_column_exists():
    """Check if min_hours_before_slot column exists"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'shop_voucher' 
            AND column_name = 'min_hours_before_slot'
        """)
        result = cursor.fetchone()
        return result is not None

def add_column_manually():
    """Manually add the column if migration fails"""
    print("Adding min_hours_before_slot column manually...")
    with connection.cursor() as cursor:
        cursor.execute("""
            ALTER TABLE shop_voucher 
            ADD COLUMN IF NOT EXISTS min_hours_before_slot INTEGER DEFAULT 0
        """)
    print("✅ Column added successfully!")

def main():
    print("=" * 60)
    print("Azure Database Migration Fix")
    print("=" * 60)
    
    # Check if column already exists
    if check_column_exists():
        print("✅ Column 'min_hours_before_slot' already exists!")
        return
    
    print("❌ Column 'min_hours_before_slot' does NOT exist")
    print("\nAttempting to run Django migration...")
    
    try:
        # Try running the migration
        call_command('migrate', 'shop', '--noinput')
        print("✅ Migration completed successfully!")
        
        # Verify
        if check_column_exists():
            print("✅ Column verified!")
        else:
            print("⚠️  Migration ran but column not found. Adding manually...")
            add_column_manually()
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\nAttempting manual column addition...")
        try:
            add_column_manually()
        except Exception as e2:
            print(f"❌ Manual addition also failed: {e2}")
            sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Migration fix completed!")
    print("=" * 60)

if __name__ == '__main__':
    main()
