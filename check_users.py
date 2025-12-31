#!/usr/bin/env python3

import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from app.core.config import settings

def check_users():
    # Create database engine
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    
    # Connect to the database
    with engine.connect() as connection:
        # Query all users
        result = connection.execute(text("SELECT id, email, full_name, keycloak_user_id, is_superuser FROM \"user\";"))
        
        print("Users in database:")
        print("-" * 80)
        for row in result:
            print(f"ID: {row[0]}")
            print(f"Email: {row[1]}")
            print(f"Full Name: {row[2]}")
            print(f"Keycloak User ID: {row[3]}")
            print(f"Is Superuser: {row[4]}")
            print("-" * 80)

if __name__ == "__main__":
    check_users()