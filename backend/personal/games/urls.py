from django.urls import path

from . import views

urlpatterns = [
    path("projects/", views.CreateListProject.as_view(), name="projects"),
    path("games/", views.CreateListGame.as_view(), name="games"),
    path("posts/", views.CreateListPost.as_view(), name="posts"),
]
