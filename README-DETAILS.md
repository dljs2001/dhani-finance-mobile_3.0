# Dhani Finance Mobile 2.0 - Application Details

This document contains explicit functional details, credentials, and database configurations for the Dhani Finance Mobile 2.0 application.

## Application Overview
This application is a financial tracking app that works as a mockup or management system containing both an Admin interface and a User interface. 

### Core Functionality
- **Admin Interface (`/src/pages/Admin.tsx`)**: Allows administrators to create, manage, and monitor user accounts. Admins can set user IDs, passwords, real names, withdrawal account numbers, available balances, and withdrawal fees. 
- **User Interface (`/src/pages/Index.tsx` & User Dashboard)**: Users can log in with their assigned credentials to view their financial details (balance, account info, etc.).
- **WhatsApp Integration**: The admin panel has built-in functionality to generate a summary message containing a user's login details (User ID and Password) and send them out via a WhatsApp link.
- **Dual Database Architecture**: The app connects to both Supabase and Neon PostgreSQL for data storage, retrieval, and synchronization.

## Hardcoded Administrator Credentials
The global administration interface (`AuthContext.tsx`) is protected by these hardcoded credentials:
- **Admin User ID**: 9899654695
- **Admin Password**: 7838203264

## Database Configurations

### 1. Neon PostgreSQL Database
The app utilizes a Neon Postgres DB primarily for managing the `online_app` table, which stores detailed user transaction balances and login credentials.
- **Neon DB Connection URL**: postgresql://neondb_owner:npg_VjQUeDagK0O9@ep-steep-fire-ae637xly-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
- **API Server / Netlify Functions (`local-api.cjs`)**: The app uses a local node server during development, running on port `3001`. It receives frontend requests at `/api/create-online-user` and `/api/get-online-users`, executing SQL queries to insert or fetch user rows into the Neon DB.
- **Data Schema (`online_app` table)**:
  - `user_id`
  - `password`
  - `account_name`
  - `bank_amount`
  - `withdraw_account_number`
  - `available_balance`
  - `withdrawal_fee`

### 2. Supabase Database
The app also uses Supabase (`supabase.ts`) as a database layer to query the `users` table for authentication and tracking.
- **Supabase URL**: https://ltcerychivrdkqssqjfg.supabase.co
- **Supabase Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (found in `env.download`)
