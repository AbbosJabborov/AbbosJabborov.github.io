from django.contrib import admin
from django.utils.html import format_html

from games.models import Game, Note, Post, Project, Review, SphereNode, Story

# Register your models here.
admin.site.register(Game)
admin.site.register(Project)
admin.site.register(Review)
admin.site.register(Post)


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "reading_time", "is_published", "published_at", "created_at"]
    list_filter = ["is_published", "published_at"]
    search_fields = ["title", "subtitle", "content", "tags"]
    prepopulated_fields = {"slug": ("title",)}
    fieldsets = (
        ("Story Header", {"fields": ("title", "slug", "subtitle", "author", "tags", "reading_time")}),
        ("Media & Visuals", {"fields": ("cover", "cover_url")}),
        ("Content (Markdown / Notion / Telegra.ph style)", {"fields": ("content",)}),
        ("Publishing", {"fields": ("is_published", "published_at")}),
    )


@admin.register(SphereNode)
class SphereNodeAdmin(admin.ModelAdmin):
    list_display = ["label", "category", "node_type", "color_badge", "url", "story", "order", "is_active"]
    list_filter = ["category", "node_type", "is_active", "is_featured"]
    search_fields = ["label", "subtitle", "url", "custom_slug"]
    list_editable = ["order", "is_active"]

    def color_badge(self, obj):
        return format_html(
            '<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background-color:{}; margin-right:6px; vertical-align:middle;"></span>{}',
            obj.color,
            obj.color,
        )

    color_badge.short_description = "Color"



@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["id", "message_preview", "sender", "created_at", "has_reply"]
    list_filter = ["created_at", "replied_at"]
    search_fields = ["message", "sender", "admin_reply"]
    readonly_fields = ["created_at", "replied_at"]

    fieldsets = (
        (
            "Note Details",
            {
                "fields": (
                    "message",
                    "sender",
                    "position_x",
                    "position_y",
                    "color",
                    "created_at",
                )
            },
        ),
        (
            "Admin Reply",
            {"fields": ("admin_reply", "replied_at"), "classes": ("collapse",)},
        ),
    )

    def message_preview(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message

    message_preview.short_description = "Message"

    def has_reply(self, obj):
        return "✅" if obj.admin_reply else "❌"

    has_reply.short_description = "Replied"

    def save_model(self, request, obj, form, change):
        if change and obj.admin_reply and not obj.replied_at:
            from django.utils import timezone

            obj.replied_at = timezone.now()
        super().save_model(request, obj, form, change)
