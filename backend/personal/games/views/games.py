import requests
from django.shortcuts import render
from games.models import Game
from games.serializer import GameSerializer
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class CreateListGame(generics.ListCreateAPIView):
    queryset = Game.objects.all().order_by("-is_favorite", "title")
    serializer_class = GameSerializer
    permission_classes = [AllowAny]


class GameDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    lookup_field = "pk"
    permission_classes = [AllowAny]


@api_view(["GET"])
@permission_classes([AllowAny])
def fetch_steam_game(request, appid):
    """
    Fetch game metadata (title, header image, background) directly from Steam Store API for a given App ID.
    """
    try:
        url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
        res = requests.get(url, timeout=10)
        data = res.json()

        if str(appid) in data and data[str(appid)].get("success"):
            game_data = data[str(appid)]["data"]
            name = game_data.get("name")
            header_image = game_data.get("header_image")
            background = game_data.get("background")

            # Check if game already exists
            game, created = Game.objects.get_or_create(
                steam_appid=appid,
                defaults={
                    "title": name,
                    "cover_url": f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_600x900_2x.jpg",
                    "hero_url": f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_hero.jpg",
                    "icon_url": header_image or f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg",
                    "review_headline": f"My thoughts on {name}",
                    "review_content": f"<p>{game_data.get('short_description', '')}</p>",
                    "rating": 9,
                    "playtime_hours": 15.0,
                },
            )
            serializer = GameSerializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
        else:
            return Response({"error": "Game not found on Steam API"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
