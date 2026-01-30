from django.shortcuts import render
from games.models import Game
from games.serializer import GameSerializer
from rest_framework import generics


class CreateListGame(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class GameView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    lookup_field = "slug"
