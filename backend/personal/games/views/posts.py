from django.shortcuts import render
from games.models import Post
from games.serializer import PostSerializer
from rest_framework import generics


class CreateListPost(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class PostView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = "slug"
