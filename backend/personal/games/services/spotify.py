# services/spotify.py
import base64
import os
import time
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv

load_dotenv()


_cache = {"data": None, "ts": 0}
CACHE_TTL = 30

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"

REDIRECT_URI = "https://abbosjabborov-github-io.onrender.com/api/spotify/callback/"
SCOPES = "user-read-currently-playing user-read-playback-state"


def get_auth_url() -> str:
    params = {
        "client_id": os.environ.get("SPOTIFY_CLIENT_ID"),
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPES,
    }
    return f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"


def get_token_from_code(code: str) -> Optional[Dict[str, Any]]:
    """Exchange authorization code for access and refresh tokens"""
    try:
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")

        auth_str = f"{client_id}:{client_secret}"
        b64_auth_str = base64.b64encode(auth_str.encode()).decode()

        response = requests.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI,
            },
            headers={
                "Authorization": f"Basic {b64_auth_str}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to get token from code: {e}")
        return None


def get_access_token() -> Optional[str]:
    try:
        refresh_token = os.environ.get("SPOTIFY_REFRESH_TOKEN")
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")

        if not refresh_token:
            print("No refresh token found. Visit /api/spotify/login/ to authenticate")
            return None

        auth_str = f"{client_id}:{client_secret}"
        b64_auth_str = base64.b64encode(auth_str.encode()).decode()

        response = requests.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            headers={
                "Authorization": f"Basic {b64_auth_str}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

        if response.status_code != 200:
            print(f"Spotify error: {response.status_code} - {response.text}")
            return None

        return response.json()["access_token"]
    except Exception as e:
        print(f"Failed to get Spotify access token: {e}")
        return None


def get_cached_currently_playing(fetch_fn) -> Dict[str, Any]:
    now = time.time()
    if _cache["data"] and now - _cache["ts"] < CACHE_TTL:
        return _cache["data"]

    data = fetch_fn()
    _cache["data"] = data
    _cache["ts"] = now
    return data


def get_currently_playing() -> Dict[str, Any]:
    try:
        access_token = get_access_token()
        if not access_token:
            return {"is_playing": False}

        res = requests.get(
            SPOTIFY_NOW_PLAYING_URL, headers={"Authorization": f"Bearer {access_token}"}
        )

        if res.status_code == 204 or res.status_code == 404:
            return {"is_playing": False}

        res.raise_for_status()
        data = res.json()

        if not data or "item" not in data or not data["item"]:
            return {"is_playing": False}

        item = data["item"]
        images = item.get("album", {}).get("images", [])

        return {
            "is_playing": data.get("is_playing", False),
            "track": item.get("name", "Unknown"),
            "artist": ", ".join(a["name"] for a in item.get("artists", [])),
            "album": item.get("album", {}).get("name", "Unknown"),
            "album_art": images[0]["url"] if images else None,
            "song_url": item.get("external_urls", {}).get("spotify", ""),
        }
    except Exception as e:
        print(f"Error fetching currently playing: {e}")
        return {"is_playing": False}
