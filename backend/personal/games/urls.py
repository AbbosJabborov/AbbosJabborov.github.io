from django.urls import path

from .views import games, notes, posts, projects, spotify

urlpatterns = [
    path("games/", games.CreateListGame.as_view(), name="games"),
    path("games/<pk>/<slug:slug>", games.GameView.as_view(), name="game-view"),
    path("projects/", projects.CreateListProject.as_view(), name="projects"),
    path(
        "projects/<pk>/<slug:slug>",
        projects.ProjectView.as_view(),
        name="project-view",
    ),
    path("posts/", posts.CreateListPost.as_view(), name="posts"),
    path("posts/<pk>/<slug:slug>", posts.PostView.as_view(), name="post-view"),
    path("spotify/currently-playing/", spotify.currently_playing),
    path("spotify/login/", spotify.login),
    path("spotify/callback/", spotify.callback),
    path("notes/", notes.notes_list),
    path("notes/<int:note_id>/reply/", notes.admin_reply),
    path("notes/<int:note_id>/", notes.delete_note),
]
