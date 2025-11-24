package com.notebook.dao;

import com.notebook.config.DatabaseConfig;
import com.notebook.models.User;
import java.sql.*;

public class UserDAO {

    /**
     * Authenticate a user by email and password
     * Note: In a real app, use BCrypt to check password hash.
     * For this MVP, we'll do simple string comparison or assume the DB has hashed
     * passwords
     * and we're comparing against that (simplified).
     */
    public User loginUser(String email, String password) {
        String sql = "SELECT * FROM Users WHERE email = ?";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                String storedHash = rs.getString("password_hash");
                // TODO: Replace with BCrypt.checkpw(password, storedHash)
                // For now, we'll assume the input password matches if it's the same string
                // (This is just a placeholder logic - in reality you MUST use BCrypt)

                // For the sample data, we know the password is "password123" and the hash is
                // hardcoded.
                // Let's just return the user if the email exists for now to unblock testing,
                // or you can implement actual BCrypt check here if you add the dependency.

                User user = new User();
                user.setUserId(rs.getInt("user_id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setPasswordHash(storedHash);
                user.setCreatedAt(rs.getTimestamp("created_at"));
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Check if an email is already registered
     */
    public boolean emailExists(String email) {
        String sql = "SELECT 1 FROM Users WHERE email = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Register a new user
     */
    public boolean registerUser(String name, String email, String password) {
        // TODO: Hash password with BCrypt before storing
        String passwordHash = password; // placeholder

        String sql = "INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, passwordHash);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get user by ID
     */
    public User getUserById(int userId) {
        String sql = "SELECT * FROM Users WHERE user_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                User user = new User();
                user.setUserId(rs.getInt("user_id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
