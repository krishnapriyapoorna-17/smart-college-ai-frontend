# Frontend API Integration Specification & Contract Guide

**Project:** AI-Powered Multi-Agent System for Smart College Administration  
**Module:** React Student Portal Frontend (Owned by Member 1)  
**Target Backend:** FastAPI REST Backend (Owned by Member 2)  
**Date:** September 2026  
**Status:** FINAL HANDOFF SPECIFICATION

---

## 1. Architectural Overview & Communication Flow

The React frontend communicates exclusively via HTTP with Member 2's FastAPI backend:

```
React UI (Pages & Components)
        ↓
Context / Custom Hooks (useAuth, useRequests)
        ↓
Service Layer (authService, requestService, uploadService, studentService)
        ↓
Central API Client (api.js via native fetch)
        ↓
HTTP (REST JSON / Multipart)
        ↓
FastAPI Backend (Member 2)
```

- **Runtime Mock Status:** **NONE**. All mock layers, seeded records, and mock transports have been permanently removed.
- **Base URL Configuration:** Read from environment variable `VITE_API_BASE_URL`. Defaults to `http://localhost:8000` for local development.
- **Authorization Header:** For all authenticated requests, `api.js` automatically attaches:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Error Handling:** FastAPI validation errors (HTTP 422 array of `{ loc, msg, type }`) and standard error bodies (`{ detail: "..." }`) are automatically parsed and displayed to the student without crashing the interface.

---

## 2. API Endpoints Specification Matrix

| # | Endpoint | Method | Auth Required | Request Body Format | Calling Service | Calling Pages |
|---|---|---|---|---|---|---|
| 1 | `/api/auth/register` | `POST` | No (`skipAuth: true`) | JSON | `authService.register` | `RegisterPage` |
| 2 | `/api/auth/login` | `POST` | No (`skipAuth: true`) | JSON | `authService.login` | `LoginPage` |
| 3 | `/api/auth/me` | `GET` | Yes (`Bearer <token>`) | None | `authService.getCurrentUser` | `AuthContext` (Session Restoration) |
| 4 | `/api/students/{id}` | `GET` | Yes (`Bearer <token>`) | None | `studentService.getStudentById` | Student Profile views |
| 5 | `/api/requests` | `POST` | Yes (`Bearer <token>`) | JSON | `requestService.createRequest` | `NewRequestPage` |
| 6 | `/api/requests` | `GET` | Yes (`Bearer <token>`) | Query Params | `requestService.getRequests` | `DashboardPage`, `RequestHistoryPage` |
| 7 | `/api/requests/{id}` | `GET` | Yes (`Bearer <token>`) | None | `requestService.getRequestById` | `RequestDetailsPage` |
| 8 | `/api/requests/{id}/status` | `PATCH` | Yes (`Bearer <token>`) | JSON | `requestService.updateRequestStatus` | Administrative / Service level |
| 9 | `/api/upload` | `POST` | Yes (`Bearer <token>`) | `multipart/form-data` | `uploadService.uploadDocument` | `NewRequestPage` (FileUpload) |

---

## 3. Detailed Endpoint Contracts

### 1. Register Student (`POST /api/auth/register`)
- **Authentication:** None.
- **Request Body (`application/json`):**
  ```json
  {
    "student_id": "STU001",
    "full_name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "password": "Password123"
  }
  ```
- **Expected Success Response (HTTP 201 Created or 200 OK):**
  ```json
  {
    "message": "Student registered successfully",
    "user": {
      "id": "STU001",
      "student_id": "STU001",
      "full_name": "Jane Doe",
      "email": "jane.doe@college.edu"
    }
  }
  ```
- **Expected Error Responses:**
  - `400 Bad Request`: `{"detail": "Email or Student ID already registered"}`
  - `422 Unprocessable Entity`: FastAPI validation errors
- **Frontend Behavior:** Displays success screen and redirects to `/login` after 1.5 seconds.

---

### 2. Student Login (`POST /api/auth/login`)
- **Authentication:** None.
- **Request Body (`application/json`):**
  ```json
  {
    "identifier": "STU001",
    "password": "Password123"
  }
  ```
  *(Note for Member 2: The frontend accepts either student enrollment ID or institutional email in the `identifier` field).*
- **Expected Success Response (HTTP 200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "student_id": "STU001",
      "full_name": "Jane Doe",
      "email": "jane.doe@college.edu"
    }
  }
  ```
- **Expected Error Responses:**
  - `401 Unauthorized`: `{"detail": "Invalid student credentials"}`
- **Frontend Behavior:** Stores `access_token` in `localStorage` under key `smart_college_token`, populates `AuthContext`, and navigates to `/dashboard`.

---

### 3. Current Authenticated Student (`GET /api/auth/me`)
- **Authentication:** `Bearer <access_token>`.
- **Request Body:** None.
- **Expected Success Response (HTTP 200 OK):**
  ```json
  {
    "student_id": "STU001",
    "studentId": "STU001",
    "full_name": "Jane Doe",
    "fullName": "Jane Doe",
    "email": "jane.doe@college.edu",
    "department": "Computer Science & Engineering"
  }
  ```
- **Expected Error Responses:**
  - `401 Unauthorized`: Token expired or invalid.
- **Frontend Behavior:** Restores authenticated session on page refresh. If 401 is returned, purges stored token and redirects to `/login`.

---

### 4. Retrieve Student Profile (`GET /api/students/{id}`)
- **Authentication:** `Bearer <access_token>`.
- **Path Parameter:** `id` (e.g. `STU001`).
- **Expected Success Response (HTTP 200 OK):**
  ```json
  {
    "student_id": "STU001",
    "full_name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "department": "Computer Science & Engineering",
    "degree": "B.Tech CSE",
    "year": "4th Year",
    "academic_year": "2025-2026"
  }
  ```
- **Expected Error Responses:**
  - `404 Not Found`: `{"detail": "Student record not found"}`

---

### 5. Create Administrative Request (`POST /api/requests`)
- **Authentication:** `Bearer <access_token>`.
- **Request Body (`application/json`) strictly conforms to project specification:**
  ```json
  {
    "student_id": "STU001",
    "text": "Show my attendance and fee due",
    "document_id": null
  }
  ```
  *(If a supporting file was uploaded via `/api/upload`, `document_id` contains the string ID returned by that endpoint; otherwise `null`).*
- **Expected Success Response (HTTP 201 Created or 200 OK):**
  ```json
  {
    "id": "REQ-2026-001",
    "student_id": "STU001",
    "text": "Show my attendance and fee due",
    "title": "Show my attendance and fee due",
    "status": "IN_PROGRESS",
    "document_id": null,
    "created_at": "2026-09-14T10:00:00Z"
  }
  ```
- **Expected Error Responses:**
  - `400 Bad Request`: Missing `student_id` or `text`.
  - `422 Unprocessable Entity`: Validation failure.
- **Frontend Behavior:** Renders the submission confirmation screen with the exact `id` returned by FastAPI and offers navigation to `/requests/{id}` or `/requests`.

---

### 6. List Requests (`GET /api/requests`)
- **Authentication:** `Bearer <access_token>`.
- **Optional Query Parameters:**
  - `status`: Filter by status string (e.g., `IN_PROGRESS`, `COMPLETED`, `ACTION_REQUIRED`).
- **Expected Success Response (HTTP 200 OK):**
  ```json
  [
    {
      "id": "REQ-2026-001",
      "student_id": "STU001",
      "title": "Attendance & condonation query",
      "text": "Show my attendance and fee due",
      "description": "Show my attendance and fee due",
      "status": "IN_PROGRESS",
      "category": "Academic Administration",
      "assignedAgent": "Coordinator Agent",
      "createdAt": "2026-09-14 10:00 AM",
      "attachments": []
    }
  ]
  ```
  *(If student has no requests, return empty array `[]`).*
- **Frontend Behavior:** If `[]` is returned, displays the legitimate empty state. Dynamic statistics on Dashboard calculate directly from the returned array length and statuses.

---

### 7. Request Details & Multi-Agent Trace (`GET /api/requests/{id}`)
- **Authentication:** `Bearer <access_token>`.
- **Path Parameter:** `id` (e.g. `REQ-2026-001`).
- **Expected Success Response (HTTP 200 OK):**
  ```json
  {
    "id": "REQ-2026-001",
    "student_id": "STU001",
    "title": "Attendance & condonation query",
    "text": "Show my attendance and fee due",
    "description": "Show my attendance and fee due",
    "status": "COMPLETED",
    "category": "Academic Administration",
    "assignedAgent": "Attendance Agent",
    "createdAt": "2026-09-14 10:00 AM",
    "resolvedAt": "2026-09-14 10:02 AM",
    "attachments": [
      { "name": "medical_proof.pdf", "size": "1.2 MB" }
    ],
    "timeline": [
      { "step": "Request Submitted", "time": "10:00 AM", "status": "completed", "note": "Received via student portal" },
      { "step": "Coordinator Agent Analysis", "time": "10:00 AM", "status": "completed", "note": "Routed to Attendance Agent" },
      { "step": "Resolution Generated", "time": "10:02 AM", "status": "completed", "note": "Attendance evaluated at 84%" }
    ],
    "response": {
      "summary": "Your cumulative attendance is 84.2%. Eligible for exam hall ticket.",
      "result": "Eligible"
    }
  }
  ```
- **Expected Error Responses:**
  - `404 Not Found`: `{"detail": "Request with ID 'REQ-2026-001' not found"}`
- **Frontend Behavior:** Displays status badge, metadata strip, attachments, resolution card, and visual timeline stepper. If 404, renders "Request Not Found" empty state.

---

### 8. Update Request Status (`PATCH /api/requests/{id}/status`)
- **Authentication:** `Bearer <access_token>`.
- **Path Parameter:** `id`.
- **Request Body (`application/json`):**
  ```json
  {
    "status": "COMPLETED",
    "remarks": "Verified by administrative coordinator"
  }
  ```
- **Expected Success Response (HTTP 200 OK):**
  Returns the updated request object.

---

### 9. Document Upload (`POST /api/upload`)
- **Authentication:** `Bearer <access_token>`.
- **Request Format:** `multipart/form-data`.
- **Form Fields:**
  - `file`: Binary file upload (PDF, JPG, PNG; max 10MB).
- **Expected Success Response (HTTP 201 Created or 200 OK):**
  ```json
  {
    "document_id": "DOC-2026-9041",
    "filename": "fee_receipt.pdf",
    "file_size": 358400,
    "message": "Document uploaded successfully"
  }
  ```
- **Expected Error Responses:**
  - `400 Bad Request`: `{"detail": "Unsupported file format"}`
  - `413 Payload Too Large`: `{"detail": "File exceeds maximum allowable size of 10MB"}`
- **Frontend Behavior:** Extracts `document_id`, stores it in form state, and includes it when submitting `POST /api/requests`.

---

## 4. Backend Contract Confirmation Items (For Member 2)

The following items are marked for Member 2's explicit confirmation during backend development:

1. **Authentication Token Response Format & Login Payload:**
   - Status: `[BACKEND CONTRACT CONFIRMATION REQUIRED]`
   - Frontend currently sends: `{ "identifier": "<student_id or email>", "password": "<password>" }` as JSON.
   - Frontend expects response: `{ "access_token": "<token>", "token_type": "bearer", "user": { "id": "...", "student_id": "...", "full_name": "...", "email": "..." } }`.
   - *Confirmation required:* Confirm if Member 2's FastAPI auth route uses standard OAuth2 `application/x-www-form-urlencoded` with fields `username` and `password`, or JSON payload.

2. **Multi-Agent Timeline Schema:**
   - Status: `[BACKEND CONTRACT CONFIRMATION REQUIRED]`
   - Frontend supports rendering a timeline array on `GET /api/requests/{id}`:
     `timeline: [{ "step": string, "time": string, "status": "completed" | "active" | "pending" | "failed", "note": string }]`.
   - *Confirmation required:* Confirm if LangGraph agent execution trace logs will be mapped to this array schema by FastAPI.

3. **CORS Configuration on FastAPI:**
   - Status: `[BACKEND CONTRACT CONFIRMATION REQUIRED]`
   - FastAPI must configure `CORSMiddleware` to allow `http://localhost:5173` (Vite dev server) and future production frontend origins:
     ```python
     from fastapi.middleware.cors import CORSMiddleware
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["http://localhost:5173", "http://localhost:3000"],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```

4. **Document Upload Response Format:**
   - Status: `[BACKEND CONTRACT CONFIRMATION REQUIRED]`
   - Frontend expects `POST /api/upload` to return:
     `{ "document_id": string, "filename": string, "message": string }`.
   - *Confirmation required:* Confirm the exact JSON response key (`document_id` vs `file_id`).
