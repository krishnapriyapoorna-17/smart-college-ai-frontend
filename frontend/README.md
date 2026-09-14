# AI-Powered Multi-Agent System for Smart College Administration — Student Portal Frontend

## Project Name
**AI-Powered Multi-Agent System for Smart College Administration** (Frontend / Student Portal)  
*Final-Year B.Tech CSE Project*

---

## Frontend Purpose
The frontend serves as the dedicated student and administrative self-service portal. It provides students with an intuitive interface to:
- Authenticate and manage student profiles.
- Submit administrative requests (bonafide certificate requests, leave applications, fee inquiries, grievances).
- Upload relevant supporting documents.
- Monitor request progress and multi-agent workflow resolutions in real-time.

> **Project Boundary Note:**  
> This repository module contains **only the React frontend**. The Python backend (FastAPI, MySQL, SQLAlchemy, LangGraph Coordinator Agent, OCR, Whisper, ChromaDB, and RAG pipelines) is managed independently and will communicate with this portal via REST APIs in subsequent phases.

---

## Technologies Used
- **React** (v18) — Component-based UI library
- **Vite** (v5) — Next-generation frontend build tooling and fast dev server
- **JavaScript (ES Modules / JSX)** — Core application logic and templating
- **React Router DOM** (v6) — Declarative client-side routing
- **Vanilla CSS** — Custom design tokens, typography, and responsive styling
- **Lucide React** — Lightweight, clean icons for UI navigation and status indicators

---

## Folder Structure

```text
smart-college-ai/
│
├── frontend/
│   ├── public/                 # Static assets (favicons, icons)
│   ├── src/
│   │   ├── assets/             # Images, logos, and graphics
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic primitives (Button, Card, Badge)
│   │   │   ├── forms/          # Form inputs and field wrappers
│   │   │   ├── layout/         # Shell layouts, Navbar, Footer
│   │   │   └── requests/       # Request-specific UI components (Status badges)
│   │   ├── context/            # React context providers (AuthContext)
│   │   ├── hooks/              # Custom React hooks (useRequests)
│   │   ├── pages/              # Route view pages
│   │   │   ├── Dashboard/      # Main student dashboard
│   │   │   ├── Login/          # Student login page
│   │   │   ├── NewRequest/     # New request submission
│   │   │   ├── NotFound/       # 404 Fallback page
│   │   │   ├── Register/       # Student registration
│   │   │   ├── RequestDetails/ # Detailed view for specific request (:id)
│   │   │   └── RequestHistory/ # History of submitted requests
│   │   ├── routes/             # App routing registry and route guards
│   │   │   ├── AppRoutes.jsx   # Route definitions
│   │   │   └── ProtectedRoute.jsx # Authentication route guard
│   │   ├── services/           # API communication layer (Architecture only in Phase 1)
│   │   │   ├── api.js          # Base HTTP client configuration
│   │   │   ├── authService.js  # Authentication endpoints
│   │   │   ├── requestService.js # Request CRUD endpoints
│   │   │   └── uploadService.js # Document upload endpoints
│   │   ├── utils/              # Helper utilities and formatters
│   │   ├── App.jsx             # Root application component
│   │   ├── index.css           # Global design tokens and styles
│   │   └── main.jsx            # React DOM mounting entry
│   ├── .env.example            # Environment configuration template
│   ├── package.json            # Project dependencies and npm scripts
│   ├── vite.config.js          # Vite build configuration
│   └── README.md               # Frontend documentation
│
└── (other project modules will be created by other team members later)
```

---

## Environment Variables Configuration

Copy the example environment file to create a local `.env`:

```bash
cd frontend
cp .env.example .env
```

The file contains:
```env
# URL for the FastAPI backend (to be provided later by the backend developer)
VITE_API_BASE_URL=
```

> **Important:** Do not hardcode backend URLs or commit secrets to git. The live FastAPI backend URL will be integrated during Phase 2.

---

## How to Install Dependencies

From the `frontend/` directory:

```bash
cd frontend
npm install
```

*(Alternatively, from the repository root, you can run `npm run install:frontend`.)*

---

## How to Run the Frontend

### 1. Start Development Server
From the `frontend/` directory:

```bash
npm run dev
```

*(Or from the repository root: `npm run dev`)*

The development server will launch locally at:
**`http://localhost:5173`**

### 2. Build for Production
To test the production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Configured Routes

| Path | Page | Description |
|---|---|---|
| `/login` | `LoginPage` | Student login screen placeholder |
| `/register` | `RegisterPage` | Student registration screen placeholder |
| `/dashboard` | `DashboardPage` | Main student dashboard overview |
| `/request/new` | `NewRequestPage` | Administrative request submission |
| `/requests` | `RequestHistoryPage` | List of past student requests |
| `/requests/:id` | `RequestDetailsPage` | Specific request details & status trace |
| `/` | Redirect | Automatically redirects to `/dashboard` |
