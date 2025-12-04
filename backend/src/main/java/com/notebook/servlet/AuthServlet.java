package com.notebook.servlet;

import com.notebook.dao.UserDAO;
import com.notebook.models.User;
import com.notebook.util.JwtUtil;
import com.notebook.util.PasswordUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Pattern;

@WebServlet("/api/auth/*")
public class AuthServlet extends BaseServlet {

    private final UserDAO userDAO = new UserDAO();
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String path = request.getPathInfo();

        if (path == null) {
            sendError(response, 404, "Endpoint not found");
            return;
        }


        switch (path) {
            case "/register" -> handleRegister(request, response);
            case "/login" -> handleLogin(request, response);
            case "/logout" -> handleLogout(request, response);
            default -> sendError(response, 404, "Endpoint not found");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String path = request.getPathInfo();

        if ("/me".equals(path)) {
            handleGetCurrentUser(request, response);
        } else {
            sendError(response, 404, "Endpoint not found");
        }
    }

    private void handleRegister(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Map<String, String> body = parseBody(request, Map.class);
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        // Validation
        if (name == null || name.trim().isEmpty()) {
            sendError(response, 400, "Name is required");
            return;
        }

        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            sendError(response, 400, "Valid email is required");
            return;
        }

        if (password == null || password.length() < 8) {
            sendError(response, 400, "Password must be at least 8 characters");
            return;
        }

        if (userDAO.emailExists(email)) {
            sendError(response, 409, "Email already registered");
            return;
        }

        // Hash password and register
        String hashedPassword = PasswordUtil.hashPassword(password);
        User user = userDAO.registerUser(name.trim(), email.toLowerCase(), hashedPassword);

        if (user == null) {
            sendError(response, 500, "Registration failed");
            return;
        }

        // Generate JWT and return in response
        String token = JwtUtil.generateToken(user);

        response.setStatus(201);
        sendSuccess(response, Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "token", token
        ));
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Map<String, String> body = parseBody(request, Map.class);
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            sendError(response, 400, "Email and password are required");
            return;
        }

        User user = userDAO.loginUser(email.toLowerCase(), password);

        if (user == null) {
            sendError(response, 401, "Invalid email or password");
            return;
        }

        // Generate JWT and return in response
        String token = JwtUtil.generateToken(user);

        sendSuccess(response, Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "token", token
        ));
    }

    private void handleLogout(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        sendSuccess(response, Map.of("message", "Logged out successfully"));
    }

    private void handleGetCurrentUser(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        int userId = getUserId(request);
        User user = userDAO.getUserById(userId);

        if (user == null) {
            sendError(response, 404, "User not found");
            return;
        }

        sendSuccess(response, Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }
}
