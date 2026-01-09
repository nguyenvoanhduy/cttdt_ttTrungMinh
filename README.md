# Trung tâm Trung Minh — Web application

A full-stack web application built with React (frontend) and Express + MongoDB (backend). This repo contains a modern Vite + React TypeScript frontend and an Express server using Mongoose and JWT-based authentication.

---

Tiếng Việt: Xem hướng dẫn chi tiết tại [docs/HuongDanSuDung.md](docs/HuongDanSuDung.md).

## 🚀 Quick overview

- Frontend: React + Vite (TypeScript-ready), multiple reusable UI components and pages.
- Backend: Node.js + Express, JWT auth with refresh tokens, MongoDB via Mongoose.
- Features: Authentication (signup/signin/signout), users, events, temples, departments, songs, books, and more.

---

## 🧭 Repository structure

Top-level folders:

```
frontend/   # React + Vite app (UI, components, pages)
backend/    # Express server (API, controllers, models, middlewares)
```

## ✅ Prerequisites

- Node.js (>=18 recommended)
- npm (or yarn)
- MongoDB instance (local or Atlas)

---

## 🛠 Setup & run locally (both frontend & backend)

1) Clone repository

```powershell
git clone https://github.com/nguyenvoanhduy/cttdt_ttTrungMinh.git
cd cttdt_ttTrungMinh
```

2) Install dependencies for backend and frontend

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

3) Configure environment variables (backend)

Create a `.env` file inside `backend/` with the variables required below:

```env
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=some_strong_random_secret
# Optional: PORT=4000
```

Important notes:
- The backend uses JWT for access tokens. Set `ACCESS_TOKEN_SECRET` to a secure random value.
- The server expects a MongoDB connection string in `MONGODB_CONNECTION_STRING`.

4) Start both services

Run backend development server (nodemon):

```powershell
cd backend
npm run dev
```

Run frontend dev server (Vite):

```powershell
cd frontend
npm run dev
```

You should now have:
- Backend: http://localhost:3000 (or your PORT), example endpoints under `/api/*`
- Frontend: Vite dev server (port printed in console)

---

## 📦 Useful scripts

Frontend (located in `frontend/package.json`):

- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle (also runs TypeScript build)
- `npm run lint` — run ESLint
- `npm run preview` — preview production build

Backend (located in `backend/package.json`):

- `npm run dev` — start server in development using nodemon
- `npm start` — start server with Node for production
