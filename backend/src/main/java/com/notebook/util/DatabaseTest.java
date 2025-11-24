package com.notebook.util;

import com.notebook.config.DatabaseConfig;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Utility class to test database connection and display sample data
 */
public class DatabaseTest {

    public static void main(String[] args) {
        System.out.println("=== Database Connection Test ===\n");

        // Test connection
        System.out.println("Connection Info: " + DatabaseConfig.getConnectionInfo());

        if (DatabaseConfig.testConnection()) {
            System.out.println("✓ Database connection successful!\n");

            // Display sample data
            displayTableCounts();
            displaySampleUsers();
            displaySampleNotebooks();
        } else {
            System.out.println("✗ Database connection failed!");
            System.exit(1);
        }
    }

    /**
     * Display count of records in each table
     */
    private static void displayTableCounts() {
        System.out.println("=== Table Record Counts ===");

        String[] tables = { "Users", "Notebooks", "NotebookCollaborators",
                "Notes", "Questions", "Answers", "Messages" };

        try (Connection conn = DatabaseConfig.getConnection();
                Statement stmt = conn.createStatement()) {

            for (String table : tables) {
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + table);
                if (rs.next()) {
                    System.out.printf("%-25s: %d records\n", table, rs.getInt(1));
                }
                rs.close();
            }
            System.out.println();

        } catch (Exception e) {
            System.err.println("Error displaying table counts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Display sample users
     */
    private static void displaySampleUsers() {
        System.out.println("=== Sample Users ===");

        String query = "SELECT user_id, name, email FROM Users ORDER BY user_id LIMIT 5";

        try (Connection conn = DatabaseConfig.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                System.out.printf("ID: %d | Name: %-20s | Email: %s\n",
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("email"));
            }
            System.out.println();

        } catch (Exception e) {
            System.err.println("Error displaying users: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Display sample notebooks
     */
    private static void displaySampleNotebooks() {
        System.out.println("=== Sample Notebooks ===");

        String query = "SELECT n.notebook_id, n.title, u.name as owner, n.visibility " +
                "FROM Notebooks n " +
                "JOIN Users u ON n.owner_id = u.user_id " +
                "ORDER BY n.notebook_id LIMIT 5";

        try (Connection conn = DatabaseConfig.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                System.out.printf("ID: %d | Title: %-30s | Owner: %-15s | Visibility: %s\n",
                        rs.getInt("notebook_id"),
                        rs.getString("title"),
                        rs.getString("owner"),
                        rs.getString("visibility"));
            }
            System.out.println();

        } catch (Exception e) {
            System.err.println("Error displaying notebooks: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
