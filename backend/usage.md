# Backend Usage Guide: Database Helper Functions

This guide explains how to use the new Database Access Objects (DAOs) in your Servlets.
Instead of writing SQL queries, use these pre-built Java classes.

## 1. User Management (`UserDAO`)

**Use for:** Login, Registration, Checking emails.

```java
UserDAO userDAO = new UserDAO();

// Login
User user = userDAO.loginUser("alice@example.com", "password123");
if (user != null) {
    session.setAttribute("user", user);
}

// Register
boolean success = userDAO.registerUser("New User", "new@example.com", "pass");

// Check Email
if (userDAO.emailExists("test@example.com")) {
    // Show error: "Email taken"
}
```

## 2. Notebooks & Dashboard (`NotebookDAO`)

**Use for:** Dashboard, Search, Access Control, Sharing.

```java
NotebookDAO notebookDAO = new NotebookDAO();
int userId = user.getUserId();

// Get Dashboard (Owned + Shared notebooks)
List<Notebook> myNotebooks = notebookDAO.getDashboardNotebooks(userId);

// Search (Secure search across titles/courses)
List<Notebook> results = notebookDAO.searchNotebooks("algorithms", userId);

// Check Access (CRITICAL: Always check this before showing a notebook!)
if (!notebookDAO.canUserAccessNotebook(userId, notebookId)) {
    response.sendError(403, "Access Denied");
    return;
}

// Check Edit Permission
if (notebookDAO.isUserEditor(userId, notebookId)) {
    // Show "Edit" button
}

// Share Notebook
boolean added = notebookDAO.addCollaboratorByEmail(notebookId, "bob@example.com", "Editor");
```

## 3. Notes (`NoteDAO`)

**Use for:** Creating, Reading, Updating, Deleting notes.

```java
NoteDAO noteDAO = new NoteDAO();

// Get all notes for a notebook
List<Note> notes = noteDAO.getNotesByNotebookId(notebookId);

// Create Note
noteDAO.createNote(notebookId, "# My New Note\nContent here...");

// Update Note
noteDAO.updateNote(noteId, "Updated content");
```

## 4. Q&A Threads (`QnADAO`)

**Use for:** Fetching questions and answers efficiently.

```java
QnADAO qnaDAO = new QnADAO();

// Get all questions AND answers for a note (Optimized 1 query)
List<Question> threads = qnaDAO.getQnAThread(noteId);

for (Question q : threads) {
    System.out.println("Q: " + q.getQuestionText());
    for (Answer a : q.getAnswers()) {
        System.out.println("  A: " + a.getAnswerText());
    }
}

// Post Question
qnaDAO.postQuestion(noteId, userId, "What does this mean?");

// Post Answer
qnaDAO.postAnswer(questionId, userId, "It means...");
```

## 5. Chat Messages (`MessageDAO`)

**Use for:** Notebook chat/discussion.

```java
MessageDAO messageDAO = new MessageDAO();

// Get Chat History
List<Message> chat = messageDAO.getNotebookMessages(notebookId);

// Send Message
messageDAO.sendMessage(notebookId, userId, "Hello everyone!");
```

## Best Practices

1.  **Never write SQL in Servlets**: If you need a new query, add a method to the appropriate DAO.
2.  **Always check access**: Use `notebookDAO.canUserAccessNotebook()` at the start of any Servlet that loads notebook data.
3.  **Use Models**: Pass `User`, `Notebook`, `Note` objects to your JSPs, not raw strings.
