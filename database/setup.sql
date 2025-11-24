-- PostgreSQL Database Setup Script
-- Note: Database creation is typically done separately on Render
-- This script assumes you're already connected to your database

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Messages CASCADE;
DROP TABLE IF EXISTS Answers CASCADE;
DROP TABLE IF EXISTS Questions CASCADE;
DROP TABLE IF EXISTS Notes CASCADE;
DROP TABLE IF EXISTS NotebookCollaborators CASCADE;
DROP TABLE IF EXISTS Notebooks CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS visibility_type CASCADE;
DROP TYPE IF EXISTS role_type CASCADE;

-- Create custom enum types
CREATE TYPE visibility_type AS ENUM ('Public', 'Private');
CREATE TYPE role_type AS ENUM ('Editor', 'Viewer');

-- Create Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notebooks table
CREATE TABLE Notebooks (
    notebook_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    course_name VARCHAR(255),
    visibility visibility_type DEFAULT 'Private',
    FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON Notebooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create NotebookCollaborators table
CREATE TABLE NotebookCollaborators (
    id SERIAL PRIMARY KEY,
    notebook_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role role_type NOT NULL,
    FOREIGN KEY (notebook_id) REFERENCES Notebooks(notebook_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Notes table
CREATE TABLE Notes (
    note_id SERIAL PRIMARY KEY,
    notebook_id INTEGER NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES Notebooks(notebook_id) ON DELETE CASCADE
);

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON Notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Questions table
CREATE TABLE Questions (
    question_id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES Notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Answers table
CREATE TABLE Answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Messages table
CREATE TABLE Messages (
    message_id SERIAL PRIMARY KEY,
    notebook_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES Notebooks(notebook_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_notebooks_owner ON Notebooks(owner_id);
CREATE INDEX idx_collaborators_notebook ON NotebookCollaborators(notebook_id);
CREATE INDEX idx_collaborators_user ON NotebookCollaborators(user_id);
CREATE INDEX idx_notes_notebook ON Notes(notebook_id);
CREATE INDEX idx_questions_note ON Questions(note_id);
CREATE INDEX idx_questions_user ON Questions(user_id);
CREATE INDEX idx_answers_question ON Answers(question_id);
CREATE INDEX idx_answers_user ON Answers(user_id);
CREATE INDEX idx_messages_notebook ON Messages(notebook_id);
CREATE INDEX idx_messages_user ON Messages(user_id);
