from rest_framework import serializers

from games.models import Game, Post, Project, Review, Note


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "title", "cover"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "slug", "title", "desc", "cover", "is_opensource", "embed_html"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "title", "desc", "rating", "review_date", "game_id"]


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "body", "post_date"]

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'message', 'sender', 'position_x', 'position_y', 
                  'color', 'created_at', 'admin_reply', 'replied_at']
        read_only_fields = ['id', 'created_at', 'admin_reply', 'replied_at']

class AdminReplySerializer(serializers.Serializer):
    admin_reply = serializers.CharField(max_length=500)