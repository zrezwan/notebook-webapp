# Database Setup Guide

## Overview

This project uses PostgreSQL hosted on Render for data persistence. The database schema includes tables for users, notebooks, collaborators, notes, questions, answers, and messages.

## Database Connection

### Environment Variables

Database credentials are stored in `backend/.env`:

```bash
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DATABASE_URL=
```

⚠️ **Important**: The `.env` file is gitignored to protect credentials. Never commit it to version control.

### Java Configuration

The `DatabaseConfig` class (`backend/src/main/java/com/notebook/config/DatabaseConfig.java`) handles database connections:

```java
// Get a connection
Connection conn = DatabaseConfig.getConnection();

// Test connection
boolean isConnected = DatabaseConfig.testConnection();

// Close connection
DatabaseConfig.closeConnection(conn);
```

## Database Schema

### Tables

1. **Users** - User accounts with authentication
2. **Notebooks** - Notebook storage with ownership
3. **NotebookCollaborators** - Collaboration permissions (Editor/Viewer)
4. **Notes** - Note content within notebooks
5. **Questions** - Q&A on notes
6. **Answers** - Responses to questions
7. **Messages** - Notebook messaging/comments

### Entity Relationships

- Users → Notebooks (one-to-many)
- Notebooks → Notes (one-to-many)
- Notebooks → NotebookCollaborators (many-to-many with Users)
- Notes → Questions (one-to-many)
- Questions → Answers (one-to-many)
- Notebooks → Messages (one-to-many)

## Setup Instructions

### 1. Install PostgreSQL Client (if needed)

```bash
brew install postgresql@15
```

### 2. Initialize Database Schema

```bash
/usr/local/opt/postgresql@15/bin/psql "$DATABASE_URL" -f database/setup.sql
```

### 3. Load Sample Data (Optional)

```bash
/usr/local/opt/postgresql@15/bin/psql "$DATABASE_URL" -f database/sample_data.sql
```

### 4. Test Connection

```bash
# Using psql
/usr/local/opt/postgresql@15/bin/psql "$DATABASE_URL" -c "\dt"

# Using Java test utility
cd backend
mvn compile exec:java -Dexec.mainClass="com.notebook.util.DatabaseTest"
```

## Sample Data

The `database/sample_data.sql` file includes:

- 4 sample users (Alice, Bob, Carol, David)
- 5 notebooks across different courses
- 5 collaborator relationships
- 5 notes with markdown content
- 5 questions and answers
- 6 messages

All sample users have the password: `password123` (hashed with bcrypt)

## Common Database Operations

### Connect via psql

```bash
/usr/local/opt/postgresql@15/bin/psql "$DATABASE_URL"
```

### View all tables

```sql
\dt
```

### View table structure

```sql
\d notebooks
```

### Query examples

```sql
-- Get all public notebooks
SELECT * FROM Notebooks WHERE visibility = 'Public';

-- Get notebooks with owner info
SELECT n.title, u.name as owner, n.visibility 
FROM Notebooks n 
JOIN Users u ON n.owner_id = u.user_id;

-- Get all collaborators for a notebook
SELECT u.name, nc.role 
FROM NotebookCollaborators nc 
JOIN Users u ON nc.user_id = u.user_id 
WHERE nc.notebook_id = 1;
```

### Reset database

```bash
# Drop and recreate all tables
/usr/local/opt/postgresql@15/bin/psql "$DATABASE_URL" -f database/setup.sql

# Reload sample data
/usr/local/opt/postgresql@15/bin/psql "$DATABASE_URL" -f database/sample_data.sql
```

## Files Structure

```
notebook-webapp/
├── database/
│   ├── setup.sql           # Schema definition
│   ├── sample_data.sql     # Test data
│   └── README.md           # This file
├── backend/
│   ├── .env                # Environment variables (gitignored)
│   ├── pom.xml             # Maven dependencies
│   └── src/main/java/com.notebook/
│       ├── config/
│       │   └── DatabaseConfig.java    # DB connection manager
│       └── util/
│           └── DatabaseTest.java      # Connection test utility
└── .gitignore              # Excludes .env files
```

## Troubleshooting

### Connection Issues

1. Verify Render database is running
2. Check firewall/network settings
3. Confirm credentials in `.env` file
4. Test with: `DatabaseConfig.testConnection()`

### Schema Issues

1. Drop all tables: Run `setup.sql` (includes DROP statements)
2. Verify PostgreSQL version compatibility
3. Check for foreign key constraint violations

## Security Notes

- ✅ Database credentials are in `.env` (gitignored)
- ✅ Passwords are hashed with bcrypt
- ✅ Foreign keys enforce referential integrity
- ✅ CASCADE DELETE prevents orphaned records
- ⚠️ Use environment variables in production
- ⚠️ Rotate credentials periodically

## Next Steps

1. Create DAO (Data Access Object) classes for each table
2. Implement user authentication with password hashing
3. Add connection pooling (HikariCP or Apache DBCP)
4. Set up database migrations (Flyway or Liquibase)
5. Add database backup strategy
