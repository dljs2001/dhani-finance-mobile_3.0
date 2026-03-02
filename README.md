# Dhani Finance Mobile App - V3.0

Welcome to the **Dhani Finance Mobile App V3.0**. This project is a modern, mobile-first web application designed specifically for Indian banking standards. It serves an administrative backend for user creation, balance management, and secure account viewing.

## Features & Architecture

- **Mobile-First Banking UI/UX:** Built with crisp white cards, trustworthy Navy Blue / Emerald Green color schemes, and seamless mobile touch targets.
- **Dual Neon Postgres Databases:** Supabase has been entirely replaced. The app natively queries two separate Neon databases to prevent regional ISP blocking and ensure data persistence:
  1. `User Interface DB`: Directly queried via `@neondatabase/serverless` using WebSockets for live data.
  2. `Backup Data DB`: Kept in sync using a local/Netlify node backend endpoint (`/api/create-online-user`).
- **Convert Currency to Text:** Automatically parses and translates INR digit entries into Indian English words (e.g., `₹ 5,00,000` -> "Five lakh rupees only").
- **WhatsApp Integration:** Admins can instantly broadcast user login details via prepopulated WhatsApp messages.

## Prerequisites

- **Node.js**: Ensure Node.js (`v18+`) is installed.
- **Neon Database**: If deploying your own instance, prepare two empty Neon PostgreSQL connection strings. Let the backend manage table creations via `schema.sql`.

## Environment Setup

Create a `.env` file in the root directory and ensure the following variables are filled:

```env
# Admin Portal Access Credentials
VITE_ADMIN_USER_ID=your_admin_id
VITE_ADMIN_PASSWORD=your_admin_password

# Primary User Authentication & Storage DB
VITE_NEON_USER_DB_URL=postgresql://user:password@endpoint...

# Secondary Backup Logging DB
VITE_NEON_DATA_DB_URL=postgresql://user:password@endpoint...
```

*Note: Since the Neon db is queried on the frontend using serverless drivers, the `VITE_` prefix exposes the database strings securely to authorized Vite bundle build outputs.*

## Local Development Execution

The application depends on both a Vite frontend server and a local Node API server to operate correctly.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Database Sync Server & Frontend View:**
   ```bash
   npm run dev:all
   ```
   *This command leverages `start node local-api.cjs && vite` to run both services simultaneously.*

3. **Admin Route:** Access `/admin` in the browser by logging in with the `VITE_ADMIN_USER_ID` credentials at the root (`/`) portal.

## Building for Production (Deployments like Netlify)

1. Build the frontend assets:
   ```bash
   npm run build
   ```
2. When deploying to platforms like Netlify, make sure:
   - Your build command is `npm run build`
   - The publish directory is `dist`
   - You **must** manually configure your 4 Environment Variables (`VITE_ADMIN_USER_ID`, etc.) in the dashboard settings before deploying.
