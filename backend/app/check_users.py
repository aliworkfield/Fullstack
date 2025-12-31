#!/usr/bin/env python3

from sqlmodel import Session, select
from app.core.db import engine
from app.models import User

def check_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print("Users in database:")
        print("=" * 80)
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"Keycloak User ID: {user.keycloak_user_id}")
            print(f"Is Superuser: {user.is_superuser}")
            print(f"Is Active: {user.is_active}")
            print("-" * 80)

if __name__ == "__main__":
    check_users()