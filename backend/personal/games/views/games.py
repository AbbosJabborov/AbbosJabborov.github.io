import requests
from decouple import config
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


@api_view(["POST", "GET"])
@permission_classes([AllowAny])
def sync_steam_library(request):
    """
    Sync owned games and exact playtimes directly from user's Steam Profile via Steam Web API.
    """
    api_key = config("STEAM_API_KEY", default=None)
    steam_id = config("STEAM_ID64", default=None)

    # Fallback to query params
    api_key = request.GET.get("key", api_key)
    steam_id = request.GET.get("steamid", steam_id)

    if not api_key or not steam_id:
        return Response(
            {
                "error": "Missing STEAM_API_KEY or STEAM_ID64.",
                "instructions": "Register a key at https://steamcommunity.com/dev/apikey and set STEAM_API_KEY & STEAM_ID64 in backend/.env",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        url = f"https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={api_key}&steamid={steam_id}&format=json&include_appinfo=true&include_played_free_games=true"
        res = requests.get(url, timeout=10)
        data = res.json()

        games_list = data.get("response", {}).get("games", [])
        synced_count = 0

        for item in games_list:
            appid = item.get("appid")
            name = item.get("name")
            playtime_mins = item.get("playtime_forever", 0)
            playtime_hours = round(playtime_mins / 60.0, 1)

            # Only sync games with at least 1 hour played
            if playtime_hours < 1.0:
                continue

            icon_hash = item.get("img_icon_url")
            icon_url = f"http://media.steampowered.com/steamcommunity/public/images/apps/{appid}/{icon_hash}.jpg" if icon_hash else f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg"

            game, created = Game.objects.get_or_create(
                steam_appid=appid,
                defaults={
                    "title": name,
                    "cover_url": f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_600x900_2x.jpg",
                    "hero_url": f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_hero.jpg",
                    "icon_url": icon_url,
                    "playtime_hours": playtime_hours,
                    "review_headline": f"My review of {name}",
                    "review_content": f"Played {playtime_hours} hours on Steam.",
                    "rating": 9,
                },
            )

            if not created:
                game.playtime_hours = playtime_hours
                game.title = name
                game.save()

            synced_count += 1

        return Response({"message": f"Successfully synced {synced_count} games from Steam!", "total_owned": len(games_list)})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
