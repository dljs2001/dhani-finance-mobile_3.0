# App Recreation Instructions: Modern Indian Banking Style

This guide provides exhaustive, step-by-step instructions on how to rebuild the finance application (dhani-finance-mobile_3.0) from scratch. The app contains two distinct interfaces: **Admin Dashboard** and **User Dashboard**. 

> [!IMPORTANT]
> **Mobile-First Focus**: This application is designed to run almost 90% on mobile screens. All UI components, layouts, and interactions must be optimized for mobile responsiveness and a seamless handheld experience.

## 1. Core Architecture & Database Shift

**Important:** We are migrating away from Supabase for user storage due to network access issues in India. The application will use **two** Neon PostgreSQL databases. 

1. **User Authentication & Storage DB (Replaces Supabase):**
   - **URL:** `postgresql://neondb_owner:npg_GY1wdlRUJ4ux@ep-proud-dew-a17a9rx0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - Use this to store all user credentials, balances, and profiles.

2. **Data Backup/Sending DB (Existing Neon DB):**
   - **URL:** `postgresql://neondb_owner:npg_VjQUeDagK0O9@ep-steep-fire-ae637xly-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - Use this to strictly push data for backups/logs via local API calls (e.g. `/api/create-online-user`).

### Environment Variables
Store all sensitive data in a `.env` file to be utilized in your deployment platform (e.g., Netlify).
```env
VITE_ADMIN_USER_ID=9899654695
VITE_ADMIN_PASSWORD=7838203264
VITE_NEON_DATA_DB_URL=postgresql://neondb_owner:npg_VjQUeDagK0O9@ep-steep-fire-ae637xly-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_NEON_USER_DB_URL=postgresql://neondb_owner:npg_GY1wdlRUJ4ux@ep-proud-dew-a17a9rx0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 2. UI / UX Styling Guidelines (Bank App Theme)

The UI must depart from the dark red gradient and take on a professional, secure Indian banking aesthetic (resembling RBL, Kotak Mahindra, or HDFC). 

- **Color Palette:**
  - **Primary Base:** Deep Navy Blue or Trustworthy Royal Blue.
  - **Accents:** Bright Red/Orange (for CTAs or highlights) and Emerald Green (for positive balances).
  - **Backgrounds:** Clean White or Off-White (`#f8f9fa`) with subtle shadows, keeping cards crisp.
- **Typography:** Professional sans-serif (e.g., Inter or Roboto). No cursive/Lobster fonts.
- **Layout:** Standard bottom navigation or hamburger menu. Information must be displayed in clear, distinct white cards with soft rounded corners.
- **Animations:** Subtle fade-ins; avoid large bouncing/floating elements.

---

## 3. Application Workflows & Exact Text

### A. Login Page (`/`)
- **Logo:** Display `dmi_dhani_logo.png`.
- **Title:** "Welcome Back"
- **Inputs:** 
  - `User ID` (Icon: User)
  - `Password` (Icon: Lock)
- **Buttons:** 
  - **Primary:** "Login" (Changes to "Logging in..." when clicked).
  - **Secondary:** "Sign Up"
- **Logic:** 
  - If credentials match the `.env` Admin credentials -> route to `/admin`.
  - Otherwise, query the **User Storage Neon DB**. If valid, route to `/user`.
- **Pop-ups & Errors:**
  - Clicking "Sign Up" -> Pop-up: *"Sign-up feature will be available soon!"*
  - Invalid Login -> Pop-up: *"Wrong User ID or Password. Please try again."*

### B. Admin Dashboard (`/admin`)
- **Header:** "Admin Dashboard" with a "Logout" button.
- **Section 1: Create New User**
  - **Inputs:** User ID, Password (with eye toggle), Account Name, Account Number (Default: `82855296984261`), Account Type (Default: `Loan Account`), Bank Name (Dropdown + Custom input if 'Others'), Withdraw Account Number (Default: `1234`), Available Balance Amount, Withdrawal Fee Amount.
  - **Special Feature:** Under numeric fields (balance, fee), display the number converted to Indian English words (e.g., *"Five lakh rupees only"*).
  - **Button:** "Create User" (Primary CTA, Green or Blue).
  - **Logic:** Saves user to the **User Storage Neon DB** and also pushes a POST request to the **Data Backup DB**. 
  - **Pop-ups/Toasts:**
    - Error: *"Please fill in all required fields."*
    - Error: *"A user with this User ID already exists."*
    - Success: *"User created successfully."*
- **Section 2: Existing Users**
  - Table displaying User ID, Account Name, Balance (Format: `₹ X,XXX`), and Actions.
  - **Action 1: Share** -> Opens WhatsApp. Text format:
    ```
    https://dhani-web-app.netlify.app
    
    *Login Details:*
    *User ID:* [User ID]
    *Password:* [Password]
    
    _Sent via Dhani Finance App by KoS_
    ```
    - Toast: *"WhatsApp has been opened in a new tab."*
  - **Action 2: Edit** -> Opens an edit modal with all user fields to update data in the User Storage DB.
  - **Action 3: Delete** -> Deletes user from the DB. Success Toast: *"User deleted successfully."*

### C. User Dashboard (`/user`)
- **Header:** Logo + "Logout" button.
- **Welcome Banner:** A marquee or distinct banner: *"Welcome, [Account Name]"*
- **Section 1: Account Details (Card)**
  - Account Name
  - Dhani Account Number
  - Account Type
  - Available Balance (Displayed large in green, e.g., `₹ 5,00,000`, with text underneath, e.g., *"Five lakh rupees only"*).
- **Section 2: Withdrawal CTA**
  - **Button:** Large button stating: *"Withdraw to your Account of : [Bank Name] : XXXX XXXX XXXX [Withdraw Account Number]"*
  - **Logic:** Clicking opens the Withdrawal Confirmation Modal.
- **Withdrawal Confirmation Modal:**
  - Icon: Shield Alert / Security Icon
  - **Title:** *"Withdrawal Confirmation"*
  - **Text Box:** 
    - *"A refundable fee is required"*
    - Displays Fee Amount (e.g., `₹ 1,400`)
    - Display Fee in words (e.g., *"One thousand four hundred rupees only"*)
  - **Disclaimer:** *"This payment will be fully refunded to your account within 20 minutes via the same payment method used."*
  - **Buttons:** "Cancel" and "Pay Now & Withdraw" (Primary).
- **Section 3: Transaction History**
  - Display lists of past transactions (Credit/Debit) with date and description. If none exist, show: *"No transaction history found."*
- **Error Modals:**
  - If an unauthenticated user reaches `/user` -> Pop-up: *"Access Denied. Please login to access your account."* -> Button: *"Go to Login"*.

---

## 4. Summary of Improvements over V2
- **Network Reliability:** Replaced Supabase with a dedicated Neon DB to prevent ISP blocking in India.
- **Security:** Moved admin credentials from hardcoded source files into `.env` file variables.
- **Aesthetics:** Removed the red/black gradient scheme and replaced it with a professional, white/blue banking aesthetic for better user trust.
- **Mobile optimization:** Shifted layout logic to prioritize 100% width cards and touch-friendly buttons for the mobile-majority user base.
