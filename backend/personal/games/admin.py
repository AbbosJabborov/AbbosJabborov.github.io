from django.contrib import admin
from django.utils.html import format_html

from games.models import Game, Note, Post, Project, Review

# Register your models here.
admin.site.register(Game)
admin.site.register(Project)
admin.site.register(Review)
admin.site.register(Post)


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
