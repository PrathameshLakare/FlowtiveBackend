# Flowtive Backend

This is the backend server for the **Flowtive** project management application, built with **Node.js**, **Express.js**, and **MongoDB**. It provides RESTful APIs for managing users, teams, projects, tasks, and tags, with JWT-based authentication.

---

## 🧰 Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- dotenv
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)

---

## Quick Start

### 🚀 Running the Server

```bash
# Clone project
git clone https://github.com/PrathameshLakare/FlowtiveBackend.git

# Install dependencies
npm install

# Start the server
node api/index.js
```

### 🔑 Environment Variables

Create a `.env` file in the root and add:

```
MONGODB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## API Reference

### **Authentication**

#### **POST /auth/signup**

Register a new user  
**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here"
}
```

#### **POST /auth/login**

Login user  
**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User login successful.",
  "token": "jwt_token_here"
}
```

---

#### **GET /auth/me**

Get current user profile (requires JWT in `Authorization` header)  
**Response:**

```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### **Users**

#### **GET /users**

List all users (requires JWT)  
**Response:**

```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

### **Teams**

#### **POST /teams**

Create a new team  
**Request Body:**

```json
{
  "name": "Frontend Team",
  "description": "Handles UI/UX"
}
```

**Response:**

```json
{
  "message": "Team created successfully",
  "team": {}
}
```

#### **GET /teams**

List all teams  
**Response:**

```json
{
  "teams": [
    {
      "_id": "team_id",
      "name": "Frontend Team",
      "description": "Handles UI/UX"
    }
  ]
}
```

---

### **Projects**

#### **POST /projects**

Create a new project  
**Request Body:**

```json
{
  "name": "Website Redesign",
  "description": "Revamp the company website"
}
```

**Response:**

```json
{
  "message": "Project created successfully.",
  "project": {}
}
```

#### **GET /projects**

List all projects  
**Response:**

```json
{
  "message": "Projects fetched successfully.",
  "projects": []
}
```

---

### **Tags**

#### **POST /tags**

Create a new tag  
**Request Body:**

```json
{
  "name": "Urgent"
}
```

**Response:**

```json
{
  "message": "Tag created successfully.",
  "tag": {}
}
```

#### **GET /tags**

List all tags  
**Response:**

```json
{
  "message": "Tags fetched successfully.",
  "tags": []
}
```

---

### **Tasks**

#### **POST /tasks**

Create a new task  
**Request Body:**

```json
{
  "name": "Design Homepage",
  "project": "project_id",
  "team": "team_id",
  "owners": ["user_id1", "user_id2"],
  "tags": ["UI", "Urgent"],
  "status": "To Do",
  "timeToComplete": 3
}
```

**Response:**

```json
{
  "message": "Task created successfully",
  "task": {}
}
```

#### **GET /tasks**

List tasks (supports filtering by tags, status, owners, project, team)  
**Response:**

```json
[
  {
    "_id": "task_id",
    "name": "Design Homepage",
    "status": "To Do",
    "dueDate": "2025-06-14T12:00:00.000Z"
  }
]
```

#### **POST /tasks/:id**

Update a task  
**Request Body:** (fields to update)

```json
{
  "status": "Completed"
}
```

**Response:**

```json
{
  "message": "Task updated successfully",
  "task": {}
}
```

#### **DELETE /tasks/:id**

Delete a task  
**Response:**

```json
{
  "message": "Task deleted successfully",
  "task": {}
}
```

---

### **Reports**

#### **GET /report/last-week**

Get tasks completed in the last week  
**Response:**

```json
{
  "message": "Tasks completed in the last week.",
  "data": []
}
```

#### **GET /report/pending**

Get total pending work in days  
**Response:**

```json
{
  "message": "Total pending work in days.",
  "data": { "totalPendingDays": 5 }
}
```

#### **GET /report/closed-tasks?groupBy=team|owners|project**

Get closed tasks grouped by team, owners, or project  
**Response:**

```json
{
  "message": "Tasks closed by each team.",
  "data": []
}
```

---

## Contact

For bugs or feature requests, please reach out to prathameshlakare001@gmail.com
