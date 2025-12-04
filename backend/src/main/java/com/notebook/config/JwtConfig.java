package com.notebook.config;

import io.github.cdimascio.dotenv.Dotenv;

public class JwtConfig {
    private static final Dotenv dotenv = loadDotenv();

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
    private static final String JWT_SECRET = getEnv("JWT_SECRET", "default-jwt-secret-key-must-be-at-least-32-chars");
    private static final long EXPIRATION_HOURS = Long.parseLong(getEnv("JWT_EXPIRATION_HOURS", "24"));
    private static final String COOKIE_NAME = "auth_token";

    public static String getSecret() {
        return JWT_SECRET;
    }

    public static long getExpirationMs() {
        return EXPIRATION_HOURS * 60 * 60 * 1000;
    }

    public static String getCookieName() {
        return COOKIE_NAME;
    }

    private static String getEnv(String key, String defaultValue) {
        String value = System.getenv(key);
        if (value != null && !value.isEmpty()) {
            return value;
        }
        String envValue = dotenv.get(key);
        return envValue != null ? envValue : defaultValue;
    }
}
