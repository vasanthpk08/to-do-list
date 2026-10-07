# Todo Full Stack

Beginner-friendly Todo List using React + Vite, Java Spring Boot, and MongoDB.

## Requirements
- Java 17+
- Maven
- Node.js 18+
- npm
- MongoDB running locally

## Run MongoDB
Make sure MongoDB is running on:
`mongodb://localhost:27017`

The app uses database:
`todo_app`

## Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend:
http://localhost:8080

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:
http://localhost:5173

## API
- GET `/api/todos`
- POST `/api/todos`
- PUT `/api/todos/{id}`
- PATCH `/api/todos/{id}/toggle`
- DELETE `/api/todos/{id}`

## Architecture

React frontend -> Axios -> Spring Boot REST API -> Spring Data MongoDB -> MongoDB
