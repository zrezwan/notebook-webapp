package com.notebook.servlet;

import com.notebook.dao.MessageDAO;
import com.notebook.dao.NotebookDAO;
import com.notebook.models.Message;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/notebooks/*/messages", "/api/notebooks/messages/*"})
public class ChatServlet extends BaseServlet {

    private final MessageDAO messageDAO = new MessageDAO();
    private final NotebookDAO notebookDAO = new NotebookDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Integer notebookId = extractNotebookId(request);
        if (notebookId == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
            return;
        }

        int userId = getUserId(request);
        if (!notebookDAO.canUserAccessNotebook(userId, notebookId)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        List<Message> messages = messageDAO.getNotebookMessages(notebookId);
        sendSuccess(response, messages);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Integer notebookId = extractNotebookId(request);
        if (notebookId == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
            return;
        }

        int userId = getUserId(request);
        if (!notebookDAO.canUserAccessNotebook(userId, notebookId)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        ChatRequest body = parseBody(request, ChatRequest.class);
        if (body == null || body.text == null || body.text.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Message text required");
            return;
        }

        boolean sent = messageDAO.sendMessage(notebookId, userId, body.text);
        if (!sent) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to send message");
            return;
        }
        sendSuccess(response, Map.of("message", "Sent"));
    }

    private Integer extractNotebookId(HttpServletRequest request) {
        // Supports:
        //  /api/notebooks/{id}/messages
        //  /api/notebooks/messages/{id}
        String uri = request.getRequestURI();
        String[] parts = uri.split("/");
        for (int i = 0; i < parts.length; i++) {
            if ("notebooks".equals(parts[i])) {
                // /api/notebooks/{id}/messages
                if (i + 1 < parts.length && isNumeric(parts[i + 1])) {
                    return Integer.parseInt(parts[i + 1]);
                }
                // /api/notebooks/messages/{id}
                if (i + 2 < parts.length && "messages".equals(parts[i + 1]) && isNumeric(parts[i + 2])) {
                    return Integer.parseInt(parts[i + 2]);
                }
            }
        }
        return null;
    }

    private boolean isNumeric(String s) {
        try {
            Integer.parseInt(s);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static class ChatRequest {
        String text;
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String path = request.getPathInfo();
        int userId = getUserId(request);

        if (path != null && path.matches("/\\d+")) {
            int messageId = Integer.parseInt(path.substring(1));
            handleDeleteMessage(request, response, userId, messageId);
        } else {
            sendError(response, 404, "Endpoint not found");
        }
    }

    private void handleDeleteMessage(HttpServletRequest request, HttpServletResponse response,
            int userId, int messageId) throws IOException {
        
        // Optional: Check if user owns this message
        // boolean deleted = messageDAO.deleteMessage(messageId, userId);
        
        boolean deleted = messageDAO.deleteMessage(messageId);

        if (!deleted) {
            sendError(response, 500, "Failed to delete message");
            return;
        }

        sendSuccess(response, Map.of("message", "Message deleted successfully"));
    }
}

