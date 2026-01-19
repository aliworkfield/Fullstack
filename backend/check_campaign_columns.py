#!/usr/bin/env python
"""Check the columns in the campaign table"""

from sqlmodel import create_engine, text
from app.core.config import settings

def check_campaign_columns():
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    with engine.connect() as conn:
        result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'campaign' ORDER BY ordinal_position"))
        print('Campaign table columns:')
        for row in result:
            print(row)

if __name__ == "__main__":
    check_campaign_columns()