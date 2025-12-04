# Trung tâm Trung Minh — Web application

A full-stack web application built with React (frontend) and Express + MongoDB (backend). This repo contains a modern Vite + React TypeScript frontend and an Express server using Mongoose and JWT-based authentication.

---

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

### Full Directory Tree

```
cttdt_ttTrungMinh/
├── LICENSE
├── README.md
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── bookController.js
│       │   ├── departmentController.js
│       │   ├── eventController.js
│       │   ├── personalController.js
│       │   ├── songController.js
│       │   ├── templeController.js
│       │   └── userController.js
│       │
│       ├── libs/
│       │   └── db.js
│       │
│       ├── middlewares/
│       │   ├── authMiddleware.js
│       │   └── roleMiddleware.js
│       │
│       ├── models/
│       │   ├── ActivityLog.js
│       │   ├── Book.js
│       │   ├── ChatMessage.js
│       │   ├── ChatSession.js
│       │   ├── Department.js
│       │   ├── Event.js
│       │   ├── EventMedia.js
│       │   ├── EventRegistration.js
│       │   ├── FamilyRelation.js
│       │   ├── MediaFile.js
│       │   ├── Notification.js
│       │   ├── Personal.js
│       │   ├── Session.js
│       │   ├── Song.js
│       │   ├── Temple.js
│       │   └── User.js
│       │
│       └── routes/
│           ├── authRoute.js
│           ├── bookRoute.js
│           ├── departmentRoute.js
│           ├── eventRoute.js
│           ├── personalRoute.js
│           ├── songRoute.js
│           ├── templeRoute.js
│           └── userRoute.js
│
└── frontend/
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── README.md
    ├── tailwind.config.ts
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    │
    ├── src/
    │   ├── App.tsx
    │   ├── index.css
    │   ├── main.tsx
    │   ├── type.ts
    │   │
    │   ├── app/
    │   │   └── dashboard/
    │   │       └── data.json
    │   │
    │   ├── assets/
    │   │
    │   ├── components/
    │   │   ├── app-sidebar.tsx
    │   │   ├── chart-area-interactive.tsx
    │   │   ├── data-table.tsx
    │   │   ├── detail-model.tsx
    │   │   ├── forget-password-form.tsx
    │   │   ├── nav-events.tsx
    │   │   ├── nav-main.tsx
    │   │   ├── nav-personals-organization.tsx
    │   │   ├── nav-secondary.tsx
    │   │   ├── nav-system.tsx
    │   │   ├── nav-user.tsx
    │   │   ├── otp-form.tsx
    │   │   ├── row-action.tsx
    │   │   ├── section-cards.tsx
    │   │   ├── site-header.tsx
    │   │   │
    │   │   ├── auth/
    │   │   │   ├── login-form.tsx
    │   │   │   └── signup-form.tsx
    │   │   │
    │   │   ├── temple/
    │   │   │   ├── temple-form.tsx
    │   │   │   └── temple-view.tsx
    │   │   │
    │   │   └── ui/
    │   │       ├── avatar.tsx
    │   │       ├── badge.tsx
    │   │       ├── breadcrumb.tsx
    │   │       ├── button.tsx
    │   │       ├── card.tsx
    │   │       ├── chart.tsx
    │   │       ├── checkbox.tsx
    │   │       ├── dialog.tsx
    │   │       ├── drawer.tsx
    │   │       ├── dropdown-menu.tsx
    │   │       ├── field.tsx
    │   │       ├── input-otp.tsx
    │   │       ├── input.tsx
    │   │       ├── label.tsx
    │   │       ├── select.tsx
    │   │       ├── separator.tsx
    │   │       ├── sheet.tsx
    │   │       ├── sidebar.tsx
    │   │       ├── skeleton.tsx
    │   │       ├── sonner.tsx
    │   │       ├── table.tsx
    │   │       ├── tabs.tsx
    │   │       ├── toggle-group.tsx
    │   │       ├── toggle.tsx
    │   │       └── tooltip.tsx
    │   │
    │   ├── hooks/
    │   │   └── use-mobile.ts
    │   │
    │   ├── lib/
    │   │   ├── utils.ts
    │   │   └── api/
    │   │       └── templeApi.ts
    │   │
    │   └── pages/
    │       ├── HomePage.tsx
    │       └── admin/
    │           ├── dashboard/
    │           ├── event/
    │           └── ...
    │
```

Inside `backend/src` you will find controllers and routes for auth, users, events, temples, personals, departments, songs, and books.

---

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

---

## 🔐 Authentication & API notes

- Authentication uses JWT for short-lived access tokens and a refresh token stored in a server-side Session collection.
- On successful sign-in the backend sets a secure cookie `refreshToken` and returns an accessToken in the response.
- Protected routes require the Authorization header: `Authorization: Bearer <accessToken>`

Public API route examples (server entry points):

```
/api/auth       # signup, signin, signout
/api/events     # public event routes
/api/temples    # temples
/api/personals  # personals
/api/departments
/api/songs
/api/books
```

After login protected routes are mounted under `/api/users`.

---

## 📁 Database

- MongoDB is required. You can run a local instance or use a hosted Atlas cluster.
- Configure the connection string using `MONGODB_CONNECTION_STRING` in `backend/.env`.

---

## 🧩 Notes for contributors

- Follow existing code style and folder structure. Frontend uses TypeScript; backend is ES Modules.
- Create issues for bugs or feature requests and open PRs for contributions.

---

## 📞 Contact & License

If you need help or want to collaborate, open an issue or contact the repository owner.

This project is available under the repository license.

---

Happy hacking! ⚡