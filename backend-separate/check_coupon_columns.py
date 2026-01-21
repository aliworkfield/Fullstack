#!/usr/bin/env python
"""Check the columns in the coupon table"""

from sqlmodel import create_engine, text
from app.core.config import settings

def check_coupon_columns():
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    with engine.connect() as conn:
        result = conn.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'coupon' ORDER BY ordinal_position"))
        print('Coupon table columns:')
        for row in result:
            print(row)

if __name__ == "__main__":
    check_coupon_columns()