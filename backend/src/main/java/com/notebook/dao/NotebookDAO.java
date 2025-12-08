package com.notebook.dao;

import com.notebook.config.DatabaseConfig;
import com.notebook.models.Collaborator;
import com.notebook.models.Notebook;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class NotebookDAO {

    /**
     * Check if a user has access to a notebook
     * Access granted if:
     * 1. User is the owner
     * 2. User is a collaborator (Editor or Viewer)
     * 3. Notebook is Public
     */
    public boolean canUserAccessNotebook(int userId, int notebookId) {
        String sql = "SELECT 1 FROM Notebooks n " +
                "LEFT JOIN NotebookCollaborators nc ON n.notebook_id = nc.notebook_id " +
                "WHERE n.notebook_id = ? AND " +
                "(n.visibility = 'Public' OR n.owner_id = ? OR nc.user_id = ?)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notebookId);
            stmt.setInt(2, userId);
            stmt.setInt(3, userId);

            ResultSet rs = stmt.executeQuery();
            return rs.next();

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Check if a user has edit permissions (Owner or Editor)
     */
    public boolean isUserEditor(int userId, int notebookId) {
        String sql = "SELECT 1 FROM Notebooks n " +
                "LEFT JOIN NotebookCollaborators nc ON n.notebook_id = nc.notebook_id " +
                "WHERE n.notebook_id = ? AND " +
                "(n.owner_id = ? OR (nc.user_id = ? AND nc.role = 'Editor'))";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notebookId);
            stmt.setInt(2, userId);
            stmt.setInt(3, userId);

            ResultSet rs = stmt.executeQuery();
            return rs.next();

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Check if user is owner
     */
    public boolean isOwner(int userId, int notebookId) {
        String sql = "SELECT 1 FROM Notebooks WHERE notebook_id = ? AND owner_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, notebookId);
            stmt.setInt(2, userId);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Create notebook and return id
     */
    public Integer createNotebook(int ownerId, String title, String courseName, String visibility) {
        // visibility is a PostgreSQL enum (visibility_type); cast the parameter to avoid type errors
        String sql = "INSERT INTO Notebooks (title, owner_id, course_name, visibility) VALUES (?, ?, ?, ?::visibility_type) RETURNING notebook_id";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, title);
            stmt.setInt(2, ownerId);
            stmt.setString(3, courseName);
            stmt.setString(4, visibility);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("notebook_id");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Notebook getNotebookById(int notebookId) {
        String sql = "SELECT n.*, u.name as owner_name, 'Owner' as user_role " +
                "FROM Notebooks n JOIN Users u ON n.owner_id = u.user_id WHERE n.notebook_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, notebookId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToNotebook(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteNotebook(int notebookId) {
        String sql = "DELETE FROM Notebooks WHERE notebook_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, notebookId);
            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get all notebooks for a user's dashboard (Owned + Shared)
     */
    public List<Notebook> getDashboardNotebooks(int userId) {
        List<Notebook> notebooks = new ArrayList<>();

        // Union query to get both owned and shared notebooks
        String sql = "SELECT n.*, u.name as owner_name, 'Owner' as user_role " +
                "FROM Notebooks n " +
                "JOIN Users u ON n.owner_id = u.user_id " +
                "WHERE n.owner_id = ? " +
                "UNION " +
                "SELECT n.*, u.name as owner_name, nc.role::text as user_role " +
                "FROM Notebooks n " +
                "JOIN Users u ON n.owner_id = u.user_id " +
                "JOIN NotebookCollaborators nc ON n.notebook_id = nc.notebook_id " +
                "WHERE nc.user_id = ? " +
                "ORDER BY updated_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            stmt.setInt(2, userId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                notebooks.add(mapResultSetToNotebook(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notebooks;
    }

    /**
     * Search notebooks by title or course name
     * Returns public notebooks OR private notebooks the user has access to
     */
    public List<Notebook> searchNotebooks(String query, int userId) {
        List<Notebook> notebooks = new ArrayList<>();
        String searchQuery = "%" + query + "%";

        String sql = "SELECT DISTINCT n.*, u.name as owner_name, " +
                "CASE WHEN n.owner_id = ? THEN 'Owner' " +
                "     WHEN nc.user_id = ? THEN nc.role::text " +
                "     ELSE 'Viewer' END as user_role " +
                "FROM Notebooks n " +
                "JOIN Users u ON n.owner_id = u.user_id " +
                "LEFT JOIN NotebookCollaborators nc ON n.notebook_id = nc.notebook_id " +
                "WHERE (n.title ILIKE ? OR n.course_name ILIKE ?) " +
                "AND (n.visibility = 'Public' OR n.owner_id = ? OR nc.user_id = ?) " +
                "ORDER BY n.updated_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            stmt.setInt(2, userId);
            stmt.setString(3, searchQuery);
            stmt.setString(4, searchQuery);
            stmt.setInt(5, userId);
            stmt.setInt(6, userId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                notebooks.add(mapResultSetToNotebook(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notebooks;
    }

    /**
     * Add a collaborator by email
     */
    public boolean addCollaboratorByEmail(int notebookId, String email, String role) {
        // TODO: Verify that the user making the request is the notebook owner or has
        // permission to add collaborators
        // First find the user ID
        String findUserSql = "SELECT user_id FROM Users WHERE email = ?";
        int collaboratorId = -1;

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(findUserSql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                collaboratorId = rs.getInt("user_id");
            } else {
                return false; // User not found
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        // Now insert the collaborator
        // Use Postgres CAST for the enum type
        // Note: Our schema doesn't have a unique constraint on (notebook_id, user_id)
        // yet,
        // but it's good practice. For now, simple insert.
        String insertSql = "INSERT INTO NotebookCollaborators (notebook_id, user_id, role) VALUES (?, ?, ?::role_type)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(insertSql)) {

            stmt.setInt(1, notebookId);
            stmt.setInt(2, collaboratorId);
            stmt.setString(3, role); // "Editor" or "Viewer"

            int rows = stmt.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Collaborator> getCollaborators(int notebookId) {
        List<Collaborator> collaborators = new ArrayList<>();
        String sql = "SELECT nc.user_id, nc.role, u.name, u.email " +
                "FROM NotebookCollaborators nc JOIN Users u ON nc.user_id = u.user_id " +
                "WHERE nc.notebook_id = ? ORDER BY u.name ASC";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, notebookId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Collaborator c = new Collaborator();
                c.setUserId(rs.getInt("user_id"));
                c.setName(rs.getString("name"));
                c.setEmail(rs.getString("email"));
                c.setRole(rs.getString("role"));
                collaborators.add(c);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return collaborators;
    }

    public boolean removeCollaborator(int notebookId, int userId) {
        String sql = "DELETE FROM NotebookCollaborators WHERE notebook_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, notebookId);
            stmt.setInt(2, userId);
            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper to map ResultSet to Notebook object
    private Notebook mapResultSetToNotebook(ResultSet rs) throws SQLException {
        Notebook nb = new Notebook();
        nb.setNotebookId(rs.getInt("notebook_id"));
        nb.setTitle(rs.getString("title"));
        nb.setOwnerId(rs.getInt("owner_id"));
        nb.setOwnerName(rs.getString("owner_name"));
        nb.setCourseName(rs.getString("course_name"));
        nb.setVisibility(rs.getString("visibility")); // PostgreSQL returns the enum as string
        nb.setCreatedAt(rs.getTimestamp("created_at"));
        nb.setUpdatedAt(rs.getTimestamp("updated_at"));
        nb.setUserRole(rs.getString("user_role"));
        return nb;
    }
}
