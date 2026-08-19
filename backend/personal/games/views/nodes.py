from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from games.models import SphereNode, Story
from games.serializer import SphereNodeSerializer, StorySerializer


class SphereNodeListView(generics.ListCreateAPIView):
    serializer_class = SphereNodeSerializer

    def get_queryset(self):
        return SphereNode.objects.filter(is_active=True).order_by("order", "-created_at")

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class SphereNodeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SphereNode.objects.all()
    serializer_class = SphereNodeSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class StoryListView(generics.ListCreateAPIView):
    serializer_class = StorySerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Story.objects.all().order_by("-published_at")
        return Story.objects.filter(is_published=True).order_by("-published_at")

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class StoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Story.objects.all()
        return Story.objects.filter(is_published=True)

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
