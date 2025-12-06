package com.notebook.filter;

import com.notebook.util.JwtUtil;
import com.google.gson.Gson;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@WebFilter("/api/*")
public class AuthFilter implements Filter {

    private static final Gson gson = new Gson();

    private static final Set<String> PUBLIC_ENDPOINTS = Set.of(
            "/api/auth/login",
            "/api/auth/register"
    );

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        String relativePath = path.substring(contextPath.length());

        // Allow public endpoints
        if (isPublicEndpoint(relativePath)) {
            chain.doFilter(req, res);
            return;
        }

        // Extract JWT from Authorization header
        String token = extractTokenFromHeader(request);

        if (token == null) {
            sendUnauthorized(response, "Authentication required");
            return;
        }

        try {
            Claims claims = JwtUtil.validateToken(token);

            // Attach user info to request for use in servlets
            request.setAttribute("userId", Integer.parseInt(claims.getSubject()));
            request.setAttribute("userEmail", claims.get("email", String.class));
            request.setAttribute("userName", claims.get("name", String.class));

            chain.doFilter(req, res);

        } catch (JwtException e) {
            sendUnauthorized(response, "Invalid or expired token");
        }
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.contains(path);
    }

    private void sendUnauthorized(HttpServletResponse response, String message)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(Map.of(
                "success", false,
                "error", message
        )));
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void destroy() {}
}
