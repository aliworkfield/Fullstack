import sys
sys.path.append('/app')
from sqlmodel import Session
from app.models import User
from app.db import engine

with Session(engine) as session:
    users = session.query(User).all()
    for user in users:
        # Fix NULL values for is_active and is_superuser
        if user.is_active is None:
            user.is_active = True
        if user.is_superuser is None:
            user.is_superuser = False
        session.add(user)
    session.commit()
    print('Fixed NULL values in user table')