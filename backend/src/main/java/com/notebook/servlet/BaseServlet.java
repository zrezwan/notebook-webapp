package com.notebook.servlet;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.notebook.dto.ApiResponse;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;

public abstract class BaseServlet extends HttpServlet {

    protected static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ")
            .create();

    protected int getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("User ID not found in request. Is AuthFilter configured?");
        }
        return (int) userId;
    }

    protected String getUserEmail(HttpServletRequest request) {
        return (String) request.getAttribute("userEmail");
    }

    protected String getUserName(HttpServletRequest request) {
        return (String) request.getAttribute("userName");
    }

    protected <T> T parseBody(HttpServletRequest request, Class<T> clazz) throws IOException {
        try (BufferedReader reader = request.getReader()) {
            return gson.fromJson(reader, clazz);
        }
    }

    protected void sendJson(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(data));
    }

    protected <T> void sendSuccess(HttpServletResponse response, T data) throws IOException {
        sendJson(response, ApiResponse.success(data));
    }

    protected void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        sendJson(response, ApiResponse.error(message));
    }

    protected String getPathParam(HttpServletRequest request) {
        String pathInfo = request.getPathInfo();
        if (pathInfo != null && pathInfo.length() > 1) {
            return pathInfo.substring(1);
        }
        return null;
    }

    protected Integer getPathParamAsInt(HttpServletRequest request) {
        String param = getPathParam(request);
        if (param != null) {
            try {
                return Integer.parseInt(param);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
