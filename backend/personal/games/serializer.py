from rest_framework import serializers

from games.models import Game, Project


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "title", "cover"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "title", "cover", "is_opensource"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["id", "title", "rating", "review_date"]


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        field = ["id", "title", "body", "post_date"]
