#!/usr/bin/env python3

"""
Database seed runner script
Run this script to initialize the database with seed data
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.seed_data import seed_database

if __name__ == "__main__":
    seed_database()
