#!/usr/bin/env python3

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect('postgresql://postgres:1122@localhost:5432/postgres')
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'edudemy_db'")
        exists = cursor.fetchone()

        if not exists:
            cursor.execute('CREATE DATABASE edudemy_db')
            print('Database edudemy_db created successfully')
        else:
            print('Database edudemy_db already exists')

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

if __name__ == "__main__":
    create_database()
