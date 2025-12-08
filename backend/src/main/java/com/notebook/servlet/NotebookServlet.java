package com.notebook.servlet;

import com.notebook.dao.NotebookDAO;
import com.notebook.models.Notebook;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@WebServlet("/api/notebooks/*")
public class NotebookServlet extends BaseServlet {

    private final NotebookDAO notebookDAO = new NotebookDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();

        String[] segments = pathInfo == null ? new String[0] : pathInfo.substring(1).split("/");

        // Dashboard list
        if (segments.length == 0 || (segments.length == 1 && segments[0].isBlank())) {
            int userId = getUserId(request);
            List<Notebook> notebooks = notebookDAO.getDashboardNotebooks(userId);
            sendSuccess(response, notebooks);
            return;
        }

        // Search
        if (segments.length == 1 && "search".equals(segments[0])) {
            int userId = getUserId(request);
            String q = request.getParameter("q");
            if (q == null || q.isBlank()) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing search query");
                return;
            }
            List<Notebook> results = notebookDAO.searchNotebooks(q, userId);
            sendSuccess(response, results);
            return;
        }

        // Collaborators list: /{id}/collaborators
        if (segments.length == 2 && "collaborators".equals(segments[1])) {
            Integer notebookId = parseInt(segments[0]);
            if (notebookId == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
                return;
            }
            int userId = getUserId(request);
            if (!notebookDAO.isOwner(userId, notebookId)) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Only owners can view collaborators");
                return;
            }
            sendSuccess(response, notebookDAO.getCollaborators(notebookId));
            return;
        }

        // Get by id
        Integer id = parseInt(segments[0]);
        if (id == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
            return;
        }

        int userId = getUserId(request);
        if (!notebookDAO.canUserAccessNotebook(userId, id)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        Notebook nb = notebookDAO.getNotebookById(id);
        if (nb == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Notebook not found");
            return;
        }
        sendSuccess(response, nb);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        String[] segments = pathInfo == null ? new String[0] : pathInfo.substring(1).split("/");

        // Add collaborator
        if (segments.length == 2 && "collaborators".equals(segments[1])) {
            Integer notebookId = parseInt(segments[0]);
            if (notebookId == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
                return;
            }
            int userId = getUserId(request);
            if (!notebookDAO.isOwner(userId, notebookId)) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Only owners can share");
                return;
            }

            CollaboratorRequest body = parseBody(request, CollaboratorRequest.class);
            if (body == null || body.email == null || body.email.isBlank()) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Email is required");
                return;
            }
            String role = body.role == null || body.role.isBlank() ? "Viewer" : body.role;
            boolean added = notebookDAO.addCollaboratorByEmail(notebookId, body.email, role);
            if (!added) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Could not add collaborator");
                return;
            }
            sendSuccess(response, java.util.Map.of("message", "Collaborator added"));
            return;
        }

        // Create notebook
        if (segments.length > 0) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            return;
        }

        CreateNotebookRequest body = parseBody(request, CreateNotebookRequest.class);
        if (body == null || body.title == null || body.title.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Title is required");
            return;
        }
        String visibility = Objects.requireNonNullElse(body.visibility, "Private");
        String courseName = Objects.requireNonNullElse(body.courseName, "");

        int userId = getUserId(request);
        Integer newId = notebookDAO.createNotebook(userId, body.title, courseName, visibility);
        if (newId == null) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create notebook");
            return;
        }
        Notebook nb = notebookDAO.getNotebookById(newId);
        sendSuccess(response, nb);
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        String[] segments = pathInfo == null ? new String[0] : pathInfo.substring(1).split("/");

        // Remove collaborator: /{id}/collaborators/{userId}
        if (segments.length == 3 && "collaborators".equals(segments[1])) {
            Integer notebookId = parseInt(segments[0]);
            Integer userIdParam = parseInt(segments[2]);
            if (notebookId == null || userIdParam == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid id");
                return;
            }
            int userId = getUserId(request);
            if (!notebookDAO.isOwner(userId, notebookId)) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Only owners can remove collaborators");
                return;
            }
            boolean removed = notebookDAO.removeCollaborator(notebookId, userIdParam);
            if (!removed) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Failed to remove collaborator");
                return;
            }
            sendSuccess(response, java.util.Map.of("message", "Collaborator removed"));
            return;
        }

        Integer id = segments.length > 0 ? parseInt(segments[0]) : null;
        if (id == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
            return;
        }
        int userId = getUserId(request);
        if (!notebookDAO.isOwner(userId, id)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Only owners can delete notebooks");
            return;
        }
        boolean deleted = notebookDAO.deleteNotebook(id);
        if (!deleted) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to delete notebook");
            return;
        }
        sendSuccess(response, java.util.Map.of("message", "Notebook deleted"));
    }

    private static class CreateNotebookRequest {
        String title;
        String courseName;
        String visibility;
    }

    private static class CollaboratorRequest {
        String email;
        String role;
    }

    private Integer parseInt(String s) {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return null;
        }
    }
}

