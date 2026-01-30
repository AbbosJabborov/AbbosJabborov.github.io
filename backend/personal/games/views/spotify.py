from django.shortcuts import redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..services.spotify import (
    get_auth_url,
    get_cached_currently_playing,
    get_currently_playing,
    get_token_from_code,
)


@api_view(["GET"])
def currently_playing(request):
    data = get_cached_currently_playing(get_currently_playing)
    return Response(data)


@api_view(["GET"])
def login(request):
    auth_url = get_auth_url()
    return redirect(auth_url)


@api_view(["GET"])
def callback(request):
    code = request.GET.get("code")
    error = request.GET.get("error")

    if error:
        return Response({"error": error}, status=400)

    if not code:
        return Response({"error": "No code provided"}, status=400)

    token_info = get_token_from_code(code)

    if token_info:
        return Response(
            {
                "message": "Success! Add this to your .env file:",
                "refresh_token": token_info["refresh_token"],
            }
        )

    return Response({"error": "Failed to get token"}, status=400)
