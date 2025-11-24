from django.contrib import admin

from games.models import Game, Post, Project, Review

# Register your models here.
admin.site.register(Game)
admin.site.register(Project)
admin.site.register(Review)
admin.site.register(Post)
