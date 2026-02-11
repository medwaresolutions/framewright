import type { ConventionQuestion } from "@/types/conventions";

export const pythonFastapiConventions: ConventionQuestion[] = [
  {
    id: "project-structure",
    category: "Code Organization",
    question: "How should the project be structured?",
    description: "Python projects have several common layout patterns.",
    applicableTo: ["python-fastapi", "python-django"],
    isRequired: true,
    options: [
      {
        id: "domain-driven",
        label: "Domain-driven (app/users/, app/orders/)",
        description: "Organize by business domain. Each domain has its own models, routes, and services.",
        isRecommended: true,
        generatedText: "**Project Structure**: Domain-driven layout. Each domain gets its own package: `app/users/`, `app/orders/`, `app/auth/`. Each package contains `routes.py`, `models.py`, `schemas.py`, `service.py`. Shared utilities go in `app/core/`.",
      },
      {
        id: "layer-based",
        label: "Layer-based (routes/, models/, services/)",
        description: "Organize by technical layer. All routes together, all models together.",
        isRecommended: false,
        generatedText: "**Project Structure**: Layer-based layout. Top-level directories by layer: `routes/`, `models/`, `schemas/`, `services/`, `core/`. Files within each layer are named by domain: `routes/users.py`, `models/users.py`.",
      },
    ],
  },
  {
    id: "api-style",
    category: "API Design",
    question: "What API design conventions should be followed?",
    description: "Consistent API design makes endpoints predictable for frontend consumers.",
    applicableTo: ["python-fastapi", "express"],
    isRequired: true,
    options: [
      {
        id: "rest-resource",
        label: "RESTful resource-based routes",
        description: "Standard REST: GET /users, POST /users, GET /users/{id}. The most common and AI-friendly pattern.",
        isRecommended: true,
        generatedText: "**API Design**: RESTful resource-based routing. Use plural nouns for resources: `GET /api/users`, `POST /api/users`, `GET /api/users/{id}`, `PATCH /api/users/{id}`. Use HTTP status codes correctly (201 for created, 404 for not found). Return consistent response shapes.",
      },
      {
        id: "action-based",
        label: "Action-based routes (/users/create, /users/list)",
        description: "RPC-style routes named after actions. Less conventional but sometimes clearer for complex operations.",
        isRecommended: false,
        generatedText: "**API Design**: Action-based routing. Name routes by their action: `POST /api/users/create`, `GET /api/users/list`, `POST /api/users/{id}/deactivate`. Group related actions under their resource prefix.",
      },
    ],
  },
  {
    id: "python-error-handling",
    category: "Error Handling",
    question: "How should API errors be returned?",
    description: "Consistent error responses make debugging easier for both humans and AI.",
    applicableTo: ["python-fastapi"],
    isRequired: true,
    options: [
      {
        id: "structured-errors",
        label: "Structured error responses with error codes",
        description: "Return JSON with error code, message, and details. Enables programmatic error handling on the frontend.",
        isRecommended: true,
        generatedText: "**Error Handling**: Return structured error responses: `{\"error\": {\"code\": \"USER_NOT_FOUND\", \"message\": \"User with ID 123 not found\", \"details\": {}}}`. Use HTTP exception handlers in FastAPI. Define error codes as an enum. Never expose stack traces in production.",
      },
      {
        id: "http-exceptions",
        label: "FastAPI HTTPException with detail strings",
        description: "Use FastAPI's built-in HTTPException. Simple but less structured.",
        isRecommended: false,
        generatedText: "**Error Handling**: Use FastAPI `HTTPException` for all error responses. Include descriptive `detail` messages. Use appropriate HTTP status codes. Add custom exception handlers for common error types.",
      },
    ],
  },
];
