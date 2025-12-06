package com.notebook.config;

import java.sql.Connection;
import java.sql.SQLException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.github.cdimascio.dotenv.Dotenv;

public class DatabaseConfig {
    private static final Dotenv dotenv = loadDotenv();
    private static final String DATABASE_URL = getEnv("DATABASE_URL");
    private static final HikariDataSource dataSource;

    private static Dotenv loadDotenv() {
        String[] paths = {
            "src/main/resources",
            "backend/src/main/resources",
            "../backend/src/main/resources",
            System.getProperty("catalina.base", "."),
            "."
        };

        for (String path : paths) {
            try {
                return Dotenv.configure()
                        .directory(path)
                        .load();
            } catch (Exception ignored) {}
        }

        return Dotenv.configure().ignoreIfMissing().load();
    }

    static {
        try {
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

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setDriverClassName("org.postgresql.Driver");
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

    public static String getEnv(String key) {
        String value = System.getenv(key);
        if (value != null && !value.isEmpty()) {
            return value;
        }
        return dotenv.get(key);
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
                conn.close();
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
}
