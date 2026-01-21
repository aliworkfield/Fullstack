from sqlmodel import Session, select
from app.core.db import engine
from app.models import User

with Session(engine) as session:
    users = session.exec(select(User)).all()
    print('Number of users:', len(users))
    for i, user in enumerate(users):
        print(f'User {i+1}: ID={user.id}, Email={user.email}, FullName={user.full_name}, KeycloakID={user.keycloak_user_id}, Superuser={user.is_superuser}')