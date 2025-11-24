package com.notebook.config;

import java.sql.Connection;
import java.sql.SQLException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/**
 * Database configuration and connection manager for PostgreSQL
 */
public class DatabaseConfig {

    // Database connection parameters
    private static final String DATABASE_URL = getDatabaseUrl();
    private static final HikariDataSource dataSource;

    static {
        try {
            // Parse the PostgreSQL URL: postgresql://user:password@host:port/database
            String url = DATABASE_URL.replace("postgresql://", "");
            String[] parts = url.split("@");
            String[] credentials = parts[0].split(":");
            String[] hostParts = parts[1].split("/");
            String[] hostPort = hostParts[0].split(":");

            String dbUser = credentials[0];
            String dbPassword = credentials[1];
            String dbHost = hostPort[0];
            String dbPort = hostPort.length > 1 ? hostPort[1] : "5432";
            String dbName = hostParts[1];
            String jdbcUrl = String.format("jdbc:postgresql://%s:%s/%s", dbHost, dbPort, dbName);

            // Configure HikariCP
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setDriverClassName("org.postgresql.Driver");

            // Pool settings
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(30000);
            config.setConnectionTimeout(30000);

            dataSource = new HikariDataSource(config);
            System.out.println("HikariCP Connection Pool initialized successfully");

        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize database connection pool", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("Database connection test failed: " + e.getMessage());
            return false;
        }
    }

    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close(); // Returns connection to the pool
            } catch (SQLException e) {
                System.err.println("Error closing database connection: " + e.getMessage());
            }
        }
    }

    public static String getConnectionInfo() {
        if (dataSource != null) {
            return String.format("Database: %s (%s)", dataSource.getJdbcUrl(), dataSource.getUsername());
        }
        return "Database: Not initialized";
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
