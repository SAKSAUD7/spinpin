import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure PostgreSQL connection details
DB_HOST = os.getenv('DB_HOST', 'ninjaparkdb.postgres.database.azure.com')
DB_USER = os.getenv('DB_USER', 'ninja_admin')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'ninjaparkdb')

print(f"Connecting to PostgreSQL server: {DB_HOST}")
print(f"User: {DB_USER}")
print(f"Database to create: {DB_NAME}")

try:
    # Connect to the default 'postgres' database to create our database
    conn = psycopg2.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database='postgres',  # Connect to default database
        sslmode='require'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
    exists = cursor.fetchone()
    
    if exists:
        print(f"✅ Database '{DB_NAME}' already exists")
    else:
        # Create the database
        cursor.execute(f'CREATE DATABASE {DB_NAME}')
        print(f"✅ Database '{DB_NAME}' created successfully!")
    
    cursor.close()
    conn.close()
    
    print("\n✅ Database setup complete!")
    print(f"You can now run: python manage.py migrate")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nMake sure:")
    print("1. Your .env file has the correct DB_PASSWORD")
    print("2. Your IP is allowed in Azure PostgreSQL firewall rules")
    print("3. The PostgreSQL server is running")
