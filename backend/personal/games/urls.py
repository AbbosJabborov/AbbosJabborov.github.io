from django.urls import path

from .views import games, nodes, notes, posts, projects, spotify

urlpatterns = [
    path("nodes/", nodes.SphereNodeListView.as_view(), name="nodes-list"),
    path("nodes/<int:pk>/", nodes.SphereNodeDetailView.as_view(), name="node-detail"),
    path("stories/", nodes.StoryListView.as_view(), name="stories-list"),
    path("stories/<slug:slug>/", nodes.StoryDetailView.as_view(), name="story-detail"),
    path("games/", games.CreateListGame.as_view(), name="games"),
    path("games/<int:pk>/", games.GameDetailView.as_view(), name="game-detail"),
    path("games/steam/<int:appid>/", games.fetch_steam_game, name="fetch-steam-game"),
    path("games/sync-steam/", games.sync_steam_library, name="sync-steam-library"),
    path("games/epic/", games.add_epic_game, name="add-epic-game"),
    path("steam/profile/", games.get_steam_profile, name="steam-profile"),
    path("projects/", projects.CreateListProject.as_view(), name="projects"),
    path(
        "projects/<slug:slug>",
        projects.ProjectView.as_view(),
        name="project-view",
    ),
    path("posts/", posts.CreateListPost.as_view(), name="posts"),
    path("posts/<pk>/<slug:slug>", posts.PostView.as_view(), name="post-view"),
    path("spotify/currently-playing/", spotify.currently_playing),
    path("spotify/login/", spotify.login),
    path("spotify/callback/", spotify.callback),
    path("notes/", notes.notes_list),
    path("notes/<int:note_id>/position/", notes.update_note_position),
    path("notes/<int:note_id>/reply/", notes.admin_reply),
    path("notes/<int:note_id>/", notes.delete_note),
]

