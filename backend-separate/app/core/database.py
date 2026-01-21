from sqlmodel import Session, create_engine
from app.core.config import settings

# Create engine
engine = create_engine(str(settings.DATABASE_URL), echo=True)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session