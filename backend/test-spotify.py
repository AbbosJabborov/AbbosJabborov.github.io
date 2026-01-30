# test_spotify.py
import base64
import os

import requests
from dotenv import load_dotenv

load_dotenv()

client_id = os.environ.get("SPOTIFY_CLIENT_ID")
client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")

print(f"Client ID: {client_id}")
print(
    f"Client Secret: {client_secret[:10]}... (length: {len(client_secret) if client_secret else 0})"
)

# Test the credentials
auth_str = f"{client_id}:{client_secret}"
b64_auth_str = base64.b64encode(auth_str.encode()).decode()

response = requests.post(
    "https://accounts.spotify.com/api/token",
    data={
        "grant_type": "client_credentials",  # Just test auth, no refresh token
    },
    headers={
        "Authorization": f"Basic {b64_auth_str}",
    },
)

print(f"\nResponse: {response.status_code}")
print(response.json())
