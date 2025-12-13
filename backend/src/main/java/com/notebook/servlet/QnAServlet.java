package com.notebook.servlet;

import com.notebook.dao.NoteDAO;
import com.notebook.dao.NotebookDAO;
import com.notebook.dao.QnADAO;
import com.notebook.models.Note;
import com.notebook.models.Question;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/pages/*/questions", "/api/questions/*/answers"})
public class QnAServlet extends BaseServlet {

    private final QnADAO qnaDAO = new QnADAO();
    private final NoteDAO noteDAO = new NoteDAO();
    private final NotebookDAO notebookDAO = new NotebookDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String servletPath = request.getServletPath();
        if (servletPath.startsWith("/api/pages/")) {
            Integer pageId = extractId(servletPath, "pages");
            if (pageId == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid page id");
                return;
            }
            Note note = noteDAO.getNoteById(pageId);
            if (note == null) {
                sendError(response, HttpServletResponse.SC_NOT_FOUND, "Page not found");
                return;
            }
            int userId = getUserId(request);
            if (!notebookDAO.canUserAccessNotebook(userId, note.getNotebookId())) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }
            List<Question> threads = qnaDAO.getQnAThread(pageId);
            sendSuccess(response, threads);
            return;
        }
        sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String servletPath = request.getServletPath();

        // Post question to a page
        if (servletPath.startsWith("/api/pages/")) {
            Integer pageId = extractId(servletPath, "pages");
            if (pageId == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid page id");
                return;
            }
            Note note = noteDAO.getNoteById(pageId);
            if (note == null) {
                sendError(response, HttpServletResponse.SC_NOT_FOUND, "Page not found");
                return;
            }
            int userId = getUserId(request);
            if (!notebookDAO.canUserAccessNotebook(userId, note.getNotebookId())) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }
            QnaRequest body = parseBody(request, QnaRequest.class);
            if (body == null || body.text == null || body.text.isBlank()) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Question text required");
                return;
            }
            boolean ok = qnaDAO.postQuestion(pageId, userId, body.text);
            if (!ok) {
                sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to post question");
                return;
            }
            sendSuccess(response, Map.of("message", "Question posted"));
            return;
        }

        // Post answer to a question
        if (servletPath.startsWith("/api/questions/")) {
            Integer questionId = extractId(servletPath, "questions");
            if (questionId == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid question id");
                return;
            }
            Integer noteId = qnaDAO.getNoteIdForQuestion(questionId);
            if (noteId == null) {
                sendError(response, HttpServletResponse.SC_NOT_FOUND, "Question not found");
                return;
            }
            Note note = noteDAO.getNoteById(noteId);
            if (note == null) {
                sendError(response, HttpServletResponse.SC_NOT_FOUND, "Page not found");
                return;
            }
            int userId = getUserId(request);
            if (!notebookDAO.canUserAccessNotebook(userId, note.getNotebookId())) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }
            QnaRequest body = parseBody(request, QnaRequest.class);
            if (body == null || body.text == null || body.text.isBlank()) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Answer text required");
                return;
            }
            boolean ok = qnaDAO.postAnswer(questionId, userId, body.text);
            if (!ok) {
                sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to post answer");
                return;
            }
            sendSuccess(response, Map.of("message", "Answer posted"));
            return;
        }

        sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
    }

    private Integer extractId(String servletPath, String key) {
        // /api/{key}/{id}/rest...
        String[] parts = servletPath.split("/");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals(key) && i + 1 < parts.length) {
                try {
                    return Integer.parseInt(parts[i + 1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }

    private static class QnaRequest {
        String text;
    }
}

