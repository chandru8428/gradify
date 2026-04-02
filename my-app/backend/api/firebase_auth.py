import os
import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings

# In a real scenario, the serviceAccountKey.json should be placed here
# or passed via env vars. We will dummy this out if the file is missing to allow server to start,
# but it will fail on token verification if not present.
cred_path = os.path.join(settings.BASE_DIR, "serviceAccountKey.json")

if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    print("WARNING: serviceAccountKey.json not found. Firebase Admin SDK not initialized.")
    # Initialize without creds for now just so it doesn't crash on import
    # It will crash on auth.verify_id_token though.
    try:
        firebase_admin.initialize_app()
    except ValueError:
        pass # already initialized

def verify_token(token):
    try:
        return auth.verify_id_token(token)
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
