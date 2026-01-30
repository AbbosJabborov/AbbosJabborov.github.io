from django.shortcuts import render
from games.models import Project
from games.serializer import ProjectSerializer
from rest_framework import generics


class CreateListProject(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ProjectView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = "slug"
