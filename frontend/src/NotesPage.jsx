import React, { useEffect, useState } from "react";
import "./styles/NotesPage.css";
import API_BASE_URL from "./config/api";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({ message: "", sender: "" });
  const [draggedNote, setDraggedNote] = useState(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/notes/`);
        const data = await res.json();
        setNotes(data);
      } catch (e) {
        console.error("Failed to fetch notes", e);
      }
    }

    fetchNotes();
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/notes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes([...notes, newNote]);
        setFormData({ message: "", sender: "" });
        setShowForm(false);
      }
    } catch (e) {
      console.error("Failed to create note", e);
    }
  }

  function handleDragStart(e, note) {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!draggedNote) return;

    const container = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;

    // Update position (you'd need a PATCH endpoint for this)
    const updatedNotes = notes.map((n) =>
      n.id === draggedNote.id ? { ...n, position_x: x, position_y: y } : n,
    );
    setNotes(updatedNotes);
    setDraggedNote(null);
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>leave yo notes here</h1>
      </div>

      <div className="note-pack">
        <button
          className="take-note-btn"
          onClick={() => setShowForm(!showForm)}
        >
          📝 Take a Note
        </button>
        {showForm && (
          <form className="note-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="Write your message..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              maxLength={500}
              required
            />
            <input
              type="text"
              placeholder="Your name (optional)"
              value={formData.sender}
              onChange={(e) =>
                setFormData({ ...formData, sender: e.target.value })
              }
              maxLength={50}
            />
            <div className="form-actions">
              <button type="submit">Post Note</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div
        className="notes-wall"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            className="sticky-note"
            style={{
              left: `${note.position_x}%`,
              top: `${note.position_y}%`,
              backgroundColor: note.color,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, note)}
            onClick={() => setSelectedNote(note)}
          >
            <div className="note-content">
              <p>{note.message}</p>
              <span className="note-sender">
                — {note.sender || "Anonymous"}
              </span>
            </div>
            {note.admin_reply && (
              <div className="admin-badge">💬 Admin replied</div>
            )}
          </div>
        ))}
      </div>

      {selectedNote && (
        <div className="note-modal" onClick={() => setSelectedNote(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedNote(null)}>
              ×
            </button>
            <h3>Note from {selectedNote.sender || "Anonymous"}</h3>
            <p className="modal-message">{selectedNote.message}</p>
            <small>{new Date(selectedNote.created_at).toLocaleString()}</small>

            {selectedNote.admin_reply && (
              <div className="admin-reply">
                <h4>✨ Admin Response</h4>
                <p>{selectedNote.admin_reply}</p>
                <small>
                  {new Date(selectedNote.replied_at).toLocaleString()}
                </small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
