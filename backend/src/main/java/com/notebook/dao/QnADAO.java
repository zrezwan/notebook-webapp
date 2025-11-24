package com.notebook.dao;

import com.notebook.config.DatabaseConfig;
import com.notebook.models.Answer;
import com.notebook.models.Question;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QnADAO {

    /**
     * Get all questions and their answers for a specific note
     * Optimized to fetch everything in a single query to avoid N+1 problem
     */
    public List<Question> getQnAThread(int noteId) {
        Map<Integer, Question> questionMap = new HashMap<>();
        List<Question> questions = new ArrayList<>();

        String sql = "SELECT q.question_id, q.note_id, q.question_text, q.timestamp as q_time, " +
                "qu.user_id as q_user_id, qu.name as q_user_name, " +
                "a.answer_id, a.answer_text, a.timestamp as a_time, " +
                "au.user_id as a_user_id, au.name as a_user_name " +
                "FROM Questions q " +
                "JOIN Users qu ON q.user_id = qu.user_id " +
                "LEFT JOIN Answers a ON q.question_id = a.question_id " +
                "LEFT JOIN Users au ON a.user_id = au.user_id " +
                "WHERE q.note_id = ? " +
                "ORDER BY q.timestamp DESC, a.timestamp ASC";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, noteId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                int questionId = rs.getInt("question_id");

                // Get or create the question object
                Question question = questionMap.get(questionId);
                if (question == null) {
                    question = new Question();
                    question.setQuestionId(questionId);
                    question.setNoteId(rs.getInt("note_id"));
                    question.setQuestionText(rs.getString("question_text"));
                    question.setTimestamp(rs.getTimestamp("q_time"));
                    question.setUserId(rs.getInt("q_user_id"));
                    question.setUserName(rs.getString("q_user_name"));

                    questionMap.put(questionId, question);
                    questions.add(question);
                }

                // If there is an answer, add it to the question
                int answerId = rs.getInt("answer_id");
                if (!rs.wasNull()) {
                    Answer answer = new Answer();
                    answer.setAnswerId(answerId);
                    answer.setQuestionId(questionId);
                    answer.setAnswerText(rs.getString("answer_text"));
                    answer.setTimestamp(rs.getTimestamp("a_time"));
                    answer.setUserId(rs.getInt("a_user_id"));
                    answer.setUserName(rs.getString("a_user_name"));

                    question.addAnswer(answer);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return questions;
    }

    /**
     * Post a new question
     */
    public boolean postQuestion(int noteId, int userId, String text) {
        String sql = "INSERT INTO Questions (note_id, user_id, question_text) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, noteId);
            stmt.setInt(2, userId);
            stmt.setString(3, text);

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Post a new answer
     */
    public boolean postAnswer(int questionId, int userId, String text) {
        String sql = "INSERT INTO Answers (question_id, user_id, answer_text) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, questionId);
            stmt.setInt(2, userId);
            stmt.setString(3, text);

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
