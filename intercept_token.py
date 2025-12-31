# This script will help us intercept and log the token being sent by the frontend
# We'll modify the backend to log the token for debugging purposes

import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Read the current main.py file
main_py_path = os.path.join(os.path.dirname(__file__), 'backend', 'app', 'main.py')

with open(main_py_path, 'r') as f:
    content = f.read()

# Check if we've already added the logging
if '# DEBUG TOKEN INTERCEPT' not in content:
    # Find the position to insert our debug code
    insert_pos = content.find('app.include_router(api_router, prefix=settings.API_V1_STR)')
    
    if insert_pos != -1:
        # Insert debug middleware before the router inclusion
        debug_code = '''
# DEBUG TOKEN INTERCEPT - Log incoming requests and tokens
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import logging
    logger = logging.getLogger("uvicorn")
    
    # Log the authorization header
    auth_header = request.headers.get("authorization")
    if auth_header:
        logger.info(f"DEBUG AUTH HEADER: {auth_header[:50]}{'...' if len(auth_header) > 50 else ''}")
    else:
        logger.info("DEBUG AUTH HEADER: None")
    
    # Log the request
    logger.info(f"DEBUG REQUEST: {request.method} {request.url}")
    
    response = await call_next(request)
    return response
'''
        
        # Insert the debug code
        new_content = content[:insert_pos] + debug_code + content[insert_pos:]
        
        # Write the modified content back to the file
        with open(main_py_path, 'w') as f:
            f.write(new_content)
        
        print("Debug middleware added to main.py")
    else:
        print("Could not find the position to insert debug code")
else:
    print("Debug middleware already exists in main.py")