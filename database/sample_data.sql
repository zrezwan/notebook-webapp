-- Sample Data for Testing the Notebook WebApp Database
-- Run this after setup.sql to populate the database with test data

-- Insert sample users
INSERT INTO Users (name, email, password_hash) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'), -- password: password123
('Bob Smith', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'), -- password: password123
('Carol Williams', 'carol@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'), -- password: password123
('David Brown', 'david@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'); -- password: password123

-- Insert sample notebooks
INSERT INTO Notebooks (title, owner_id, course_name, visibility) VALUES
('CSCI 201 - Week 1 Notes', 1, 'CSCI 201', 'Public'),
('Data Structures Study Guide', 1, 'CSCI 201', 'Private'),
('Algorithms Final Review', 2, 'CSCI 270', 'Public'),
('Database Systems Notes', 3, 'CSCI 485', 'Public'),
('Personal Study Notes', 2, NULL, 'Private');

-- Insert notebook collaborators
INSERT INTO NotebookCollaborators (notebook_id, user_id, role) VALUES
(1, 2, 'Editor'),  -- Bob can edit Alice's CSCI 201 notes
(1, 3, 'Viewer'),  -- Carol can view Alice's CSCI 201 notes
(3, 1, 'Editor'),  -- Alice can edit Bob's Algorithms notes
(4, 2, 'Viewer'),  -- Bob can view Carol's Database notes
(4, 4, 'Editor');  -- David can edit Carol's Database notes

-- Insert sample notes
INSERT INTO Notes (notebook_id, content) VALUES
(1, '# Introduction to Java\n\n## Object-Oriented Programming\n- Classes and Objects\n- Inheritance\n- Polymorphism\n- Encapsulation\n\n## Key Concepts\nJava is a strongly-typed, object-oriented programming language.'),
(1, '# Week 1 Lab Notes\n\n## Setting up IntelliJ IDEA\n1. Download from JetBrains website\n2. Install JDK 17\n3. Create first project\n\n## Hello World Program\n```java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n```'),
(2, '# Linked Lists\n\n## Singly Linked List\n- Each node contains data and a reference to the next node\n- Head pointer points to first node\n- Last node points to null\n\n## Time Complexity\n- Insert at head: O(1)\n- Insert at tail: O(n)\n- Search: O(n)'),
(3, '# Sorting Algorithms\n\n## Quick Sort\n- Divide and conquer algorithm\n- Average case: O(n log n)\n- Worst case: O(n²)\n\n## Merge Sort\n- Stable sorting algorithm\n- Time complexity: O(n log n)\n- Space complexity: O(n)'),
(4, '# SQL Basics\n\n## SELECT Statement\n```sql\nSELECT column1, column2\nFROM table_name\nWHERE condition;\n```\n\n## JOIN Operations\n- INNER JOIN\n- LEFT JOIN\n- RIGHT JOIN\n- FULL OUTER JOIN');

-- Insert sample questions
INSERT INTO Questions (note_id, user_id, question_text) VALUES
(1, 2, 'Can you explain the difference between inheritance and composition?'),
(1, 3, 'What are the four pillars of OOP?'),
(3, 1, 'How do you implement a doubly linked list in Java?'),
(4, 3, 'When should I use Quick Sort vs Merge Sort?'),
(5, 2, 'What is the difference between INNER JOIN and LEFT JOIN?');

-- Insert sample answers
INSERT INTO Answers (question_id, user_id, answer_text) VALUES
(1, 1, 'Inheritance represents an "is-a" relationship where a class inherits properties from a parent class. Composition represents a "has-a" relationship where a class contains instances of other classes. Composition is generally preferred for code reusability.'),
(2, 1, 'The four pillars of OOP are:\n1. Encapsulation - bundling data and methods\n2. Abstraction - hiding complex details\n3. Inheritance - creating new classes from existing ones\n4. Polymorphism - objects taking multiple forms'),
(3, 2, 'A doubly linked list has nodes with two references: one to the next node and one to the previous node. This allows traversal in both directions but requires more memory.'),
(4, 2, 'Use Quick Sort when you need in-place sorting and average-case performance is acceptable. Use Merge Sort when you need guaranteed O(n log n) performance and stability (preserving order of equal elements).'),
(5, 4, 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table, with NULL for non-matching rows.');

-- Insert sample messages
INSERT INTO Messages (notebook_id, user_id, message_text) VALUES
(1, 2, 'Great notes Alice! Really helpful for the midterm.'),
(1, 3, 'Can we add more examples for polymorphism?'),
(1, 1, 'Thanks Bob! I''ll add more examples this weekend.'),
(3, 1, 'Bob, your sorting algorithm notes are excellent!'),
(4, 2, 'Carol, could you add some examples of complex queries?'),
(4, 3, 'Sure Bob, I''ll add them after the lecture tomorrow.');

-- Verify the data was inserted
SELECT 'Users' as table_name, COUNT(*) as count FROM Users
UNION ALL
SELECT 'Notebooks', COUNT(*) FROM Notebooks
UNION ALL
SELECT 'NotebookCollaborators', COUNT(*) FROM NotebookCollaborators
UNION ALL
SELECT 'Notes', COUNT(*) FROM Notes
UNION ALL
SELECT 'Questions', COUNT(*) FROM Questions
UNION ALL
SELECT 'Answers', COUNT(*) FROM Answers
UNION ALL
SELECT 'Messages', COUNT(*) FROM Messages;
