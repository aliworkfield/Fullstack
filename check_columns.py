from app.core.config import settings
from sqlalchemy import create_engine, text

def check_announcement_columns():
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'announcement' 
                ORDER BY ordinal_position
            """)
        )
        print('Announcement table columns:')
        for row in result:
            print(row)

if __name__ == "__main__":
    check_announcement_columns()