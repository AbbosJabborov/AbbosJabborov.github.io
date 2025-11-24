from django.shortcuts import render
from rest_framework import generics

from games.models import Game, Post, Project
from games.serializer import GameSerializer, PostSerializer, ProjectSerializer


class CreateListGame(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class CreateListProject(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class CreateListPost(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
