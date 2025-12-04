package com.notebook.util;

import com.notebook.config.JwtConfig;
import com.notebook.models.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

public class JwtUtil {

    private static final SecretKey key = Keys.hmacShaKeyFor(JwtConfig.getSecret().getBytes());

    public static String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + JwtConfig.getExpirationMs());

        return Jwts.builder()
                .header()
                    .type("JWT")
                    .and()
                .subject(String.valueOf(user.getUserId()))
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public static Claims validateToken(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static int getUserIdFromToken(String token) throws JwtException {
        Claims claims = validateToken(token);
        return Integer.parseInt(claims.getSubject());
    }

    public static boolean isTokenValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
