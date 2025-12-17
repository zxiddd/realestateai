# BhoomiAI - Land Verification Platform

Government-grade AI platform for real estate verification in India.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

**Create PostgreSQL database:**
```sql
CREATE DATABASE bhoomiai;
```

**Run the schema:**
- Open pgAdmin 4
- Connect to `bhoomiai` database
- Open Query Tool (right-click database → Query Tool)
- Load `backend/schema.sql`
- Execute (F5)

**Verify tables created:**
```bash
npm run check-db
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open http://localhost:5173

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend |
| `npm run build` | Build for production |
| `npm run backend` | Start backend |
| `npm run check-db` | Verify database |
| `npm run test-register` | Test API |

## Features

✅ Landing page
✅ User registration & login
✅ JWT authentication
✅ PostgreSQL database

## Project Structure

```
realestate/
├── src/                    # Frontend (React + Tailwind)
│   ├── components/
│   │   ├── auth/          # Login/Register
│   │   ├── sections/      # Landing page
│   │   └── ui/            # UI components
│   └── App.jsx
│
├── backend/               # Backend (Express + PostgreSQL)
│   ├── server.js         # Main server
│   ├── auth.js           # Authentication logic
│   ├── database.js       # DB connection
│   └── schema.sql        # Database schema
│
├── .env                  # Config
└── package.json          # Dependencies
```

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user
- `POST /api/auth/logout` - Logout

## License

Proprietary - BhoomiAI Platform
