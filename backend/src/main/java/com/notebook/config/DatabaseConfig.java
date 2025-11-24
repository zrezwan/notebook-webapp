package com.notebook.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/**
 * Database configuration and connection manager for PostgreSQL
 */
public class DatabaseConfig {

    // Database connection parameters
    private static final String DATABASE_URL = getDatabaseUrl();
    // Parse connection details from DATABASE_URL
    private static final String DB_HOST;
    private static final String DB_PORT;
    private static final String DB_NAME;
    private static final String DB_USER;
    private static final String DB_PASSWORD;
    private static final String JDBC_URL;

    static {
        // Parse the PostgreSQL URL: postgresql://user:password@host:port/database
        try {
            String url = DATABASE_URL;

            // Remove postgresql:// prefix
            url = url.replace("postgresql://", "");

            // Extract user:password
            String[] parts = url.split("@");
            String[] credentials = parts[0].split(":");
            DB_USER = credentials[0];
            DB_PASSWORD = credentials[1];

            // Extract host:port/database
            String[] hostParts = parts[1].split("/");
            String[] hostPort = hostParts[0].split(":");
            DB_HOST = hostPort[0];
            DB_PORT = hostPort.length > 1 ? hostPort[1] : "5432";
            DB_NAME = hostParts[1];

            // Construct JDBC URL
            JDBC_URL = String.format("jdbc:postgresql://%s:%s/%s", DB_HOST, DB_PORT, DB_NAME);

            // Load PostgreSQL JDBC driver
            Class.forName("org.postgresql.Driver");
            System.out.println("PostgreSQL JDBC Driver loaded successfully");

        } catch (ClassNotFoundException e) {
            System.err.println("PostgreSQL JDBC Driver not found!");
            throw new RuntimeException("Failed to load PostgreSQL driver", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse DATABASE_URL", e);
        }
    }

    /**
     * Get a database connection
     * 
     * @return Connection object
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        try {
            Connection conn = DriverManager.getConnection(JDBC_URL, DB_USER, DB_PASSWORD);
            System.out.println("Database connection established successfully");
            return conn;
        } catch (SQLException e) {
            System.err.println("Failed to establish database connection!");
            System.err.println("JDBC URL: " + JDBC_URL);
            System.err.println("User: " + DB_USER);
            throw e;
        }
    }

    /**
     * Test the database connection
     * 
     * @return true if connection is successful
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("Database connection test failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Close a database connection safely
     * 
     * @param conn Connection to close
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
                System.out.println("Database connection closed");
            } catch (SQLException e) {
                System.err.println("Error closing database connection: " + e.getMessage());
            }
        }
    }

    /**
     * Get database connection info (for debugging, without password)
     * 
     * @return Connection info string
     */
    public static String getConnectionInfo() {
        return String.format("Database: %s@%s:%s/%s", DB_USER, DB_HOST, DB_PORT, DB_NAME);
    }

    private static String getDatabaseUrl() {
        String url = System.getenv("DATABASE_URL");
        if (url != null)
            return url;

        try {
            java.nio.file.Path path = Paths.get(".env");
            if (Files.exists(path)) {
                List<String> lines = Files.readAllLines(path);
                for (String line : lines) {
                    if (line.trim().startsWith("DATABASE_URL=")) {
                        return line.split("=", 2)[1].trim();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to read .env file: " + e.getMessage());
        }
        return null;
    }
}
