from django.db import models

# Using Firestore directly in frontend, so Django models are primarily for 
# local sync if needed, but not strictly required by the prompt.
# We will rely on Firebase admin SDK to talk to Firestore directly in views if needed.
