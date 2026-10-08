# 🎥 Zoom Clone — Video Conferencing Platform

A full-stack video conferencing web app that replicates Zoom's UI, UX, and core meeting workflows. Built as an SDE Fullstack Assignment.

![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)

---

## ✨ Features

### Core Features (All Implemented)

- **Landing Dashboard** — Clean, professional Zoom-style homepage with live clock, quick action buttons (New Meeting, Join, Schedule, Share Screen), upcoming meetings list, and recent meetings list.
- **Instant Meeting Creation** — One-click meeting creation that generates a unique Meeting ID (format: `123-456-7890`), a shareable invite link, and a 6-digit passcode. Redirects you straight into the meeting room.
- **Join Meeting** — Enter a Meeting ID or paste an invite link, type your display name, and you're in. Validates the meeting exists before joining.
- **Schedule Meetings** — Create future meetings with a title, description, date/time picker, and duration selector (15 min to 2 hours). Auto-generates a meeting link you can share right away.
- **Meeting Room** — Full-screen Zoom-style meeting interface with participant video grid, real-time controls, and a top bar showing meeting info and live clock.

### Bonus Features (Also Implemented)

- **Responsive Design** — Works on desktop, tablet, and mobile. Sidebar collapses to a bottom navigation bar on smaller screens.
- **Host Controls** — "Mute All" button and ability to remove individual participants from the meeting.
- **Real-time Chat** — In-meeting chat panel powered by WebSockets. Messages appear instantly for all participants.
- **Participant Panel** — Slide-in panel showing all participants with their mute/video status, searchable, with host controls.
- **WebSocket Integration** — Real-time participant join/leave notifications, chat messages, and mute/unmute events.

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript |
| Styling    | Tailwind CSS 3, Lucide React Icons  |
| Backend    | Python, FastAPI                     |
| Database   | SQLite (via SQLAlchemy ORM)         |
| Real-time  | WebSockets (FastAPI native)         |

---

## 📁 Project Structure

```
zoom-clone/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # App entry point, WebSocket handler, CORS
│   ├── database.py             # SQLite engine & session setup
│   ├── models.py               # SQLAlchemy ORM models (User, Meeting, Participant)
│   ├── schemas.py              # Pydantic v2 request/response schemas
│   ├── utils.py                # Meeting code, invite link & passcode generators
│   ├── seed.py                 # Database seeding with sample data
│   ├── requirements.txt        # Python dependencies
│   └── routers/
│       ├── meetings.py         # Meeting CRUD endpoints
│       └── participants.py     # Participant management endpoints
│
├── frontend/                   # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing Dashboard
│   │   │   ├── join/page.tsx   # Join Meeting page
│   │   │   ├── schedule/page.tsx # Schedule Meeting page
│   │   │   └── meeting/[code]/page.tsx # Meeting Room
│   │   ├── components/
│   │   │   ├── Sidebar.tsx     # Navigation sidebar + mobile bottom nav
│   │   │   ├── Navbar.tsx      # Top navigation bar
│   │   │   ├── HomeContent.tsx # Dashboard content with API integration
│   │   │   ├── MeetingCard.tsx # Meeting display card
│   │   │   ├── NewMeetingModal.tsx  # Instant meeting creation modal
│   │   │   ├── MeetingRoom.tsx     # Full meeting room with video grid
│   │   │   ├── MeetingControls.tsx # Bottom control bar (mic, video, etc.)
│   │   │   ├── ParticipantPanel.tsx # Participant list with host controls
│   │   │   └── ChatPanel.tsx       # In-meeting chat panel
│   │   ├── lib/api.ts          # API client (fetch wrapper)
│   │   └── types/index.ts      # TypeScript interfaces
│   ├── public/zoom-logo.svg
│   ├── package.json
│   └── tailwind.config.ts
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

I designed the schema with three tables and proper foreign key relationships:

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users      │       │    meetings       │       │  participants    │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)      │◄──┐   │ id (PK)          │◄──┐   │ id (PK)          │
│ name         │   │   │ meeting_code (UQ) │   │   │ meeting_id (FK)──┤──►meetings.id
│ email (UQ)   │   │   │ title            │   │   │ user_id (FK)─────┤──►users.id
│ avatar_url   │   └───│ host_id (FK)     │   │   │ display_name     │
│ created_at   │       │ description      │   │   │ role             │
└──────────────┘       │ start_time       │   │   │ is_muted         │
                       │ duration         │   │   │ is_video_on      │
                       │ status           │   │   │ joined_at        │
                       │ meeting_type     │   │   │ left_at          │
                       │ invite_link (UQ) │   │   └──────────────────┘
                       │ passcode         │   │
                       │ created_at       │   │
                       │ updated_at       │   │
                       └──────────────────┘   │
                              │               │
                              └───────────────┘
```

**Design decisions:**
- `meeting_code` is a human-readable ID (like `123-456-7890`) — separate from the auto-increment `id`, because users share codes, not database IDs.
- `participants` has a nullable `user_id` — this way guests without accounts can still join with just a display name.
- `role` field distinguishes hosts from regular participants, enabling host-only controls.
- `left_at` is nullable — when a participant is removed or leaves, we set this timestamp instead of deleting the row (soft delete pattern), so we keep meeting history.
- `status` tracks the meeting lifecycle: `scheduled` → `active` → `ended`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (for the frontend)
- **Python** 3.10+ and **pip** (for the backend)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/zoom-clone.git
cd zoom-clone
```

### 2. Start the Backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The backend will start at `http://localhost:8000`. On first run, it automatically creates the SQLite database and seeds it with sample data (1 default user, 3 upcoming meetings, 2 past meetings with participants).

You can check the API docs at `http://localhost:8000/docs`.

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The frontend will start at `http://localhost:3000`.

### 4. Open the App

Visit [http://localhost:3000](http://localhost:3000) in your browser. You should see the Zoom-style dashboard with your seeded meetings already showing up.

---

## 📡 API Endpoints

### Meetings (`/api/meetings`)

| Method   | Endpoint                        | Description                         |
|----------|---------------------------------|-------------------------------------|
| `POST`   | `/api/meetings/?host_id=1`      | Create instant meeting              |
| `POST`   | `/api/meetings/schedule`        | Schedule a future meeting           |
| `GET`    | `/api/meetings/`                | List all meetings (filterable)      |
| `GET`    | `/api/meetings/upcoming`        | Get upcoming scheduled meetings     |
| `GET`    | `/api/meetings/recent`          | Get recent/ended meetings           |
| `GET`    | `/api/meetings/{code}`          | Get meeting by code                 |
| `PUT`    | `/api/meetings/{code}`          | Update meeting details              |
| `PUT`    | `/api/meetings/{code}/status`   | Update meeting status               |
| `DELETE` | `/api/meetings/{code}`          | Delete a meeting                    |

### Participants (`/api/meetings/{code}/participants`)

| Method   | Endpoint                                    | Description                |
|----------|---------------------------------------------|----------------------------|
| `POST`   | `/api/meetings/{code}/participants/join`     | Join a meeting             |
| `GET`    | `/api/meetings/{code}/participants/`         | List active participants   |
| `PUT`    | `.../{participant_id}/toggle-mute`           | Toggle mute status         |
| `PUT`    | `.../{participant_id}/toggle-video`          | Toggle video status        |
| `PUT`    | `.../mute-all`                               | Mute all (host control)    |
| `DELETE` | `.../{participant_id}`                       | Remove participant         |
| `POST`   | `.../leave`                                  | Leave meeting              |

### WebSocket

| Endpoint              | Description                                          |
|-----------------------|------------------------------------------------------|
| `ws://localhost:8000/ws/{meeting_code}` | Real-time chat, join/leave, mute events |

---

## 🧠 Assumptions Made

1. **No login required** — A default user (John Doe, `john@example.com`) is pre-seeded and assumed to be logged in. The focus is on meeting functionality, not authentication.
2. **Video/audio are simulated** — The app shows avatar placeholders instead of actual camera feeds. The controls (mute, video toggle) update state in the database and broadcast via WebSocket, but don't capture real media streams.
3. **Single-server architecture** — Both frontend and backend run locally. In production, you'd deploy them separately and use proper WebSocket scaling (Redis pub/sub, etc.).
4. **SQLite for simplicity** — Perfect for a demo/assignment. For production, you'd swap to PostgreSQL without changing much code (just the connection string).

---

## 🖼️ Screenshots

Once the app is running, you'll see:

- **Dashboard** — Zoom-style homepage with action buttons and meeting lists
- **New Meeting Modal** — Instant meeting creation with generated code
- **Join Page** — Meeting ID + display name form with validation
- **Schedule Page** — Full scheduling form with date/time/duration pickers
- **Meeting Room** — Dark-themed room with video grid, controls bar, participant panel, and chat

---

## 🧰 Built With

- [Next.js 14](https://nextjs.org/) — React framework with App Router
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Lucide React](https://lucide.dev/) — Beautiful icon library
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) — Python ORM
- [SQLite](https://www.sqlite.org/) — Lightweight relational database

---

*Built from scratch as an original project for the Magicpin SDE Fullstack Assignment.*
