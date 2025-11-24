package com.notebook.dao;

import com.notebook.config.DatabaseConfig;
import com.notebook.models.Note;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class NoteDAO {

    /**
     * Get all notes for a specific notebook
     */
    public List<Note> getNotesByNotebookId(int notebookId) {
        List<Note> notes = new ArrayList<>();
        String sql = "SELECT * FROM Notes WHERE notebook_id = ? ORDER BY created_at ASC";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notebookId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Note note = new Note();
                note.setNoteId(rs.getInt("note_id"));
                note.setNotebookId(rs.getInt("notebook_id"));
                note.setContent(rs.getString("content"));
                note.setCreatedAt(rs.getTimestamp("created_at"));
                note.setUpdatedAt(rs.getTimestamp("updated_at"));
                notes.add(note);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notes;
    }

    /**
     * Create a new note
     */
    public boolean createNote(int notebookId, String content) {
        String sql = "INSERT INTO Notes (notebook_id, content) VALUES (?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notebookId);
            stmt.setString(2, content);

            int rows = stmt.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update an existing note
     */
    public boolean updateNote(int noteId, String content) {
        String sql = "UPDATE Notes SET content = ? WHERE note_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, content);
            stmt.setInt(2, noteId);

            int rows = stmt.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Delete a note
     */
    public boolean deleteNote(int noteId) {
        String sql = "DELETE FROM Notes WHERE note_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, noteId);

            int rows = stmt.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
