# 🏆 Olympiad Attendance Tracker

A production-ready web app for tracking attendance of students in school olympiad preparation programs. Built for real use — not a demo.

## Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + Fastify  
- **Database + Auth**: Supabase (PostgreSQL)
- **Hosting**: Vercel (frontend) + Render (backend) — both free tiers

---

## 🚀 Setup Guide (step by step)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**, give it a name like `olympiad-tracker`
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** and paste the entire contents of `supabase/schema.sql` and click **Run**
5. This creates all your tables, security rules, and seeds the 5 default subjects

### Step 2 — Get your Supabase keys

In your Supabase project go to **Settings → API**. You need:
- **Project URL** → goes into both `.env` files as `SUPABASE_URL` / `VITE_SUPABASE_URL`
- **anon public key** → goes into frontend `.env` as `VITE_SUPABASE_ANON_KEY`
- **service_role secret key** → goes into backend `.env` as `SUPABASE_SERVICE_ROLE_KEY`
- **JWT Secret** (Settings → API → JWT Settings) → goes into backend `.env` as `SUPABASE_JWT_SECRET`

### Step 3 — Create your first teacher account

In Supabase go to **Authentication → Users → Add user**. Create an email + password for each teacher.

### Step 4 — Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase keys
npm install
npm run dev
```

The backend runs on `http://localhost:3001`. Test it: open `http://localhost:3001/health` in your browser — you should see `{"status":"ok"}`.

### Step 5 — Set up the frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase keys and backend URL
npm install
npm run dev
```

Open `http://localhost:5173`. Log in with the teacher account you created in Step 3.

---

## 📁 Project Structure

```
olympiad-tracker/
├── frontend/                  # React app
│   ├── src/
│   │   ├── api/               # API calls (Supabase client + backend)
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, TopBar
│   │   │   └── ui/            # Shared UI components
│   │   ├── pages/             # Dashboard, Attendance, Sessions, Students
│   │   ├── store/             # Zustand global state
│   │   └── types/             # TypeScript types (shared with backend)
│   └── ...config files
│
├── backend/                   # Fastify API
│   ├── src/
│   │   ├── plugins/           # Supabase client, auth middleware
│   │   ├── routes/            # students, sessions, attendance, subjects
│   │   └── index.ts           # Entry point
│   └── ...config files
│
├── supabase/
│   └── schema.sql             # Run this in Supabase SQL Editor
│
└── README.md
```

---

## 🌐 Deploying for free

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com), connect your repo
3. Set the **Root Directory** to `frontend`
4. Add environment variables (your `.env` contents)
5. Deploy — done

### Backend → Render

1. Go to [render.com](https://render.com), create a free account
2. New **Web Service** → connect your GitHub repo
3. Set **Root Directory** to `backend`
4. **Build command**: `npm install && npm run build`
5. **Start command**: `node dist/index.js`
6. Add environment variables
7. Deploy

After deploying the backend, update your frontend's `VITE_API_URL` env variable on Vercel to point to your Render URL.

---

## 🔒 Security notes

- Teachers log in with Supabase Auth — passwords are hashed, never stored in plain text
- The backend uses the service role key (kept secret, never in the frontend)
- Row Level Security (RLS) on all tables ensures only authenticated teachers can access data
- Never commit `.env` files to GitHub — they're in `.gitignore`

---

## ✨ Features

- **Dashboard** — overall stats, attendance chart by subject, top students, at-risk alerts
- **Attendance** — mark present/late/absent per session with one click (cycles through statuses)
- **Sessions** — create and manage training sessions with topic, time, and notes
- **Students** — add, edit, delete students; filter by subject; see attendance rates

## 🔜 What to add next

- Student profiles with full attendance history
- Notifications system (teacher → director)
- Medals / streak tracking
- Export to Excel
- Parent-facing view (read-only)
