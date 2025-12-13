package com.notebook.servlet;

import com.notebook.dao.NoteDAO;
import com.notebook.dao.NotebookDAO;
import com.notebook.models.Note;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/pages/*", "/api/notebooks/*/pages", "/api/notebooks/pages/*"})
public class PageServlet extends BaseServlet {

    private final NoteDAO noteDAO = new NoteDAO();
    private final NotebookDAO notebookDAO = new NotebookDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String servletPath = request.getServletPath();
        String pathInfo = request.getPathInfo();
        int userId = getUserId(request);

        // List pages for a notebook:
        // Supported paths:
        //  - /api/notebooks/{id}/pages
        //  - /api/notebooks/pages/{id}
        if (servletPath.startsWith("/api/notebooks")) {
            Integer notebookId = extractNotebookId(request);
            if (notebookId == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
                return;
            }

            if (!notebookDAO.canUserAccessNotebook(userId, notebookId)) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }

            List<Note> notes = noteDAO.getNotesByNotebookId(notebookId);
            sendSuccess(response, notes);
            return;
        }

        // Get page by id: /api/pages/{id}
        Integer pageId = getPathParamAsInt(request);
        if (pageId == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid page id");
            return;
        }

        Note note = noteDAO.getNoteById(pageId);
        if (note == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Page not found");
            return;
        }

        if (!notebookDAO.canUserAccessNotebook(userId, note.getNotebookId())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        sendSuccess(response, note);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String servletPath = request.getServletPath();
        int userId = getUserId(request);

        // Create page under notebook:
        //  - /api/notebooks/{id}/pages
        //  - /api/notebooks/pages/{id}
        if (!servletPath.startsWith("/api/notebooks")) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            return;
        }

        Integer notebookId = extractNotebookId(request);
        if (notebookId == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid notebook id");
            return;
        }

        if (!notebookDAO.isUserEditor(userId, notebookId)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Edit permission required");
            return;
        }

        CreatePageRequest body = parseBody(request, CreatePageRequest.class);
        if (body == null || body.content == null || body.content.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Content is required");
            return;
        }

        Note created = noteDAO.createNote(notebookId, body.content);
        if (created == null) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create page");
            return;
        }

        sendSuccess(response, created);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Integer pageId = getPathParamAsInt(request);
        if (pageId == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid page id");
            return;
        }
        int userId = getUserId(request);

        Note note = noteDAO.getNoteById(pageId);
        if (note == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Page not found");
            return;
        }

        if (!notebookDAO.isUserEditor(userId, note.getNotebookId())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Edit permission required");
            return;
        }

        CreatePageRequest body = parseBody(request, CreatePageRequest.class);
        if (body == null || body.content == null || body.content.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Content is required");
            return;
        }

        boolean updated = noteDAO.updateNote(pageId, body.content);
        if (!updated) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update page");
            return;
        }

        Note refreshed = noteDAO.getNoteById(pageId);
        sendSuccess(response, refreshed);
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Integer pageId = getPathParamAsInt(request);
        if (pageId == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid page id");
            return;
        }
        int userId = getUserId(request);

        Note note = noteDAO.getNoteById(pageId);
        if (note == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Page not found");
            return;
        }

        if (!notebookDAO.isUserEditor(userId, note.getNotebookId())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Edit permission required");
            return;
        }

        boolean deleted = noteDAO.deleteNote(pageId);
        if (!deleted) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to delete page");
            return;
        }

        sendSuccess(response, Map.of("message", "Page deleted"));
    }

    private Integer extractNotebookId(HttpServletRequest request) {
        // Supports:
        //  /api/notebooks/{id}/pages
        //  /api/notebooks/pages/{id}
        String uri = request.getRequestURI(); // includes context path and mapping
        String[] parts = uri.split("/");
        for (int i = 0; i < parts.length; i++) {
            if ("notebooks".equals(parts[i])) {
                // /api/notebooks/{id}/pages
                if (i + 1 < parts.length && isNumeric(parts[i + 1])) {
                    return Integer.parseInt(parts[i + 1]);
                }
                // /api/notebooks/pages/{id}
                if (i + 2 < parts.length && "pages".equals(parts[i + 1]) && isNumeric(parts[i + 2])) {
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

    private static class CreatePageRequest {
        String content;
    }
}

