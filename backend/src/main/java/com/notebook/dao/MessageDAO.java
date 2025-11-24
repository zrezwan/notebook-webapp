package com.notebook.dao;

import com.notebook.config.DatabaseConfig;
import com.notebook.models.Message;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MessageDAO {

    /**
     * Get chat messages for a notebook
     */
    public List<Message> getNotebookMessages(int notebookId) {
        List<Message> messages = new ArrayList<>();
        String sql = "SELECT m.*, u.name as user_name FROM Messages m " +
                "JOIN Users u ON m.user_id = u.user_id " +
                "WHERE m.notebook_id = ? " +
                "ORDER BY m.timestamp ASC";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notebookId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Message msg = new Message();
                msg.setMessageId(rs.getInt("message_id"));
                msg.setNotebookId(rs.getInt("notebook_id"));
                msg.setUserId(rs.getInt("user_id"));
                msg.setUserName(rs.getString("user_name"));
                msg.setMessageText(rs.getString("message_text"));
                msg.setTimestamp(rs.getTimestamp("timestamp"));
                messages.add(msg);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return messages;
    }

    /**
     * Send a message
     */
    public boolean sendMessage(int notebookId, int userId, String text) {
        String sql = "INSERT INTO Messages (notebook_id, user_id, message_text) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notebookId);
            stmt.setInt(2, userId);
            stmt.setString(3, text);

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
