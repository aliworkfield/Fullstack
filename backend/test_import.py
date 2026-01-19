import sys
import traceback

try:
    print('Testing basic imports...')
    from sqlmodel import SQLModel, Field
    print('SQLModel imported successfully')
    
    from app.models import Announcement
    print('Announcement model imported successfully')
    
    from app.schemas.announcement import AnnouncementPublic
    print('Announcement schema imported successfully')
    
    from app.crud import get_published_announcements
    print('CRUD functions imported successfully')
    
    print('All imports successful!')
    
except Exception as e:
    print(f'Import error: {e}')
    traceback.print_exc()
    sys.exit(1)