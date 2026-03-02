import { neon } from '@neondatabase/serverless';

// User Authentication & Storage Database (Replaces Supabase)
export const userDb = neon(import.meta.env.VITE_NEON_USER_DB_URL, { disableWarningInBrowsers: true });

// Data Backup / Sending Database
export const dataDb = neon(import.meta.env.VITE_NEON_DATA_DB_URL, { disableWarningInBrowsers: true });
