import random

from django.utils import timezone
from games.models import Note
from games.serializer import AdminReplySerializer, NoteSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def notes_list(request):
    if request.method == "GET":
        notes = Note.objects.all()
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()

        if "position_x" not in data:
            data["position_x"] = random.uniform(5, 85)
        if "position_y" not in data:
            data["position_y"] = random.uniform(5, 85)

        # Onyx palette - darker tones
        colors = [
            "#c9cfcf",  # onyx-200
            "#afb6b6",  # onyx-300
            "#949e9e",  # onyx-400
            "#798686",  # onyx-500
            "#616b6b",  # onyx-600
        ]
        if "color" not in data:
            data["color"] = random.choice(colors)

        serializer = NoteSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])  # Only admin can reply
def admin_reply(request, note_id):
    try:
        note = Note.objects.get(id=note_id)
    except Note.DoesNotExist:
        return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdminReplySerializer(data=request.data)
    if serializer.is_valid():
        note.admin_reply = serializer.validated_data["admin_reply"]
        note.replied_at = timezone.now()
        note.save()
        return Response(NoteSerializer(note).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])  # Only admin can delete
def delete_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Note.DoesNotExist:
        return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
