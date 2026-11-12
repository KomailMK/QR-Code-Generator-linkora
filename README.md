# Linkora QR Studio

Linkora is a sleek, serverless web application for creating customizable, branded QR codes and link cards. It features a modern vanilla HTML/JS frontend hosted on Vercel and a secure, scalable backend powered by Supabase, complete with passwordless Email OTPs, WebAuthn Passkeys, and Row Level Security (RLS).

## Features
- **No-Account Generation:** Anyone can generate and download high-res PNG cards instantly.
- **Passwordless Auth:** Secure login using 6-digit Email OTPs or biometric Passkeys.
- **Auto-Login Links:** Magic links that automatically parse URL parameters to sign users in.
- **Cloud Library:** Registered users can save, manage, and edit their QR history.
- **Serverless Architecture:** 100% static frontend relying entirely on Supabase's client-side JS SDK.

---

## Deployment & Setup Guide

### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone https://github.com/your-username/linkora-studio.git
cd linkora-studio
```

### 2. Set up the Supabase Database
1. Create a new project in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** in the left sidebar.
3. Paste and run the following schema to create your tables, triggers, and RLS policies:

```sql
-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.qr_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    accent_color TEXT NOT NULL DEFAULT '#CAFA69',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create QR History Table
CREATE TABLE IF NOT EXISTS public.qr_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Scan to connect',
    target_url TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Website',
    design JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Optimization Indices
CREATE INDEX IF NOT EXISTS idx_qr_history_user_created ON public.qr_history(user_id, created_at DESC);

-- 4. Automatic 'updated_at' Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_qr_profiles_timestamp
    BEFORE UPDATE ON public.qr_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Auto-create Profile Row When User Signs Up via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.qr_profiles (user_id, display_name, bio, website, accent_color)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), '', '', '#CAFA69')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.qr_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_history ENABLE ROW LEVEL SECURITY;

-- 7. Policies for qr_profiles
CREATE POLICY "Users can view their own profile" ON public.qr_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.qr_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.qr_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.qr_profiles FOR DELETE USING (auth.uid() = user_id);

-- 8. Policies for qr_history
CREATE POLICY "Users can view their own QR codes" ON public.qr_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own QR codes" ON public.qr_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own QR codes" ON public.qr_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own QR codes" ON public.qr_history FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configure Supabase Authentication
Navigate to **Authentication** in the Supabase sidebar and configure the following:

*   **URL Configuration:**
    *   **Site URL:** Set to your exact production URL (e.g., `https://your-domain.com`). *Do not include a trailing slash.*
    *   **Redirect URLs:** Add your production URL and local testing URLs (e.g., `http://localhost:8000`).
*   **Providers > Email:**
    *   Enable Email provider: **ON**
    *   Confirm email: **ON**
    *   Enable Magic Link log in: **OFF** *(Forces 6-digit OTPs instead of tokens)*
    *   OTP Length: **6**
*   **Passkeys:**
    *   Enable Passkey authentication: **ON**
    *   Relying Party Display Name: `Linkora`
    *   Relying Party ID: Your exact bare domain (e.g., `your-domain.com`).
    *   Relying Party Origins: Your full URL (e.g., `https://your-domain.com`).

### 4. Custom Email Template
Go to **Authentication > Email Templates**. You must apply this template to BOTH the **Confirm Signup** and **Magic Link** tabs so new and returning users receive the same experience.

*   **Subject:** `Your Linkora sign-in code: {{ .Token }}`
*   **Source Code (HTML):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Linkora Sign-in Code</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F7F8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171A17; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #F7F8F3; padding: 40px 16px; }
    .card { max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E9DF; border-radius: 24px; padding: 40px 36px; box-shadow: 0 16px 45px rgba(23, 27, 23, 0.05); }
    .brand-mark { display: inline-block; width: 38px; height: 38px; background-color: #CAFA69; border-radius: 12px; text-align: center; line-height: 38px; font-weight: 800; font-size: 18px; color: #171B17; }
    .brand-title { font-size: 22px; font-weight: 700; letter-spacing: -0.04em; color: #171A17; vertical-align: middle; margin-left: 10px; }
    .headline { font-size: 26px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.25; margin: 28px 0 10px; color: #171B17; }
    .paragraph { font-size: 14px; line-height: 1.65; color: #6D736B; margin: 0 0 24px; }
    .code-box { background-color: #171B17; border-radius: 16px; padding: 22px; text-align: center; margin: 28px 0; }
    .code-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #CAFA69; margin-bottom: 8px; }
    .code-value { font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 800; letter-spacing: 0.22em; color: #FFFFFF; padding-left: 0.22em; }
    .btn { display: block; width: 100%; box-sizing: border-box; background-color: #CAFA69; color: #171B17 !important; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px; margin: 20px 0 0; }
    .divider { height: 1px; background-color: #EDF0E9; margin: 32px 0 24px; }
    .footer-note { font-size: 12px; line-height: 1.6; color: #899084; text-align: center; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div style="margin-bottom: 24px;">
        <span class="brand-mark">&#x2756;</span>
        <span class="brand-title">linkora<span style="color:#CAFA69">.</span></span>
      </div>
      <div class="headline">Sign in to your QR Studio</div>
      <p class="paragraph">Enter the verification code below on the sign-in screen to access your saved QR designs, custom presets, and library.</p>
      <div class="code-box">
        <div class="code-label">Verification Code</div>
        <div class="code-value">{{ .Token }}</div>
      </div>
      <p class="paragraph" style="font-size: 13px; text-align: center; margin-bottom: 12px;">Or click the button below to sign in instantly without typing the code:</p>
      
      <!-- IMPORTANT: Hardcode your actual domain here to prevent Vercel 404s -->
      <a href="https://your-domain.com/login?code={{ .Token }}&email={{ .Email }}" class="btn" target="_blank" rel="noopener noreferrer">
        Sign in to Linkora &rarr;
      </a>

      <div class="divider"></div>
      <p class="footer-note">This code expires in 10 minutes. If you did not request this sign-in link, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
```

### 5. Connect Frontend to Supabase
1. Go to **Project Settings > API** in Supabase.
2. Copy your **Project URL** and your **Publishable API Key** (`sb_publishable_...` or `anon public`).
3. Open `public/supabase-client.js` in your codebase and replace the placeholder variables at the top of the file:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // No trailing slash, no /rest/v1/
const SUPABASE_ANON_KEY = 'YOUR_PUBLISHABLE_KEY';
```

### 6. Deploy to Vercel
Linkora uses `vercel.json` to handle clean URLs and secure headers. Because this is a static project, you deploy the `public` directory directly using the Vercel CLI.

1. Install the Vercel CLI:
```bash
npm install -g vercel
```
2. Authenticate and deploy directly to production:
```bash
vercel login
vercel --prod
```
3. *(Optional)* If you are adding a custom domain, configure it in your Vercel Project Settings > Domains, and update your registrar's nameservers to point to Vercel (`ns1.vercel-dns.com` and `ns2.vercel-dns.com`).

---

## 🛠 Troubleshooting

*   **"Identifier 'supabase' has already been declared"**: Ensure your `supabase-client.js` uses `const supabaseClient = window.supabase.createClient(...)` to avoid clashing with the global `window.supabase` variable created by the CDN script.
*   **Auto-login link throws 404 Not Found**: Verify that your `vercel.json` does not contain aggressive regex `rewrites`. Ensure the email template button `href` is hardcoded to your exact live Vercel domain.
*   **Emails aren't sending**: If using a custom SMTP provider (like Resend), ensure your domain is fully verified in their dashboard. Alternatively, you can use a Gmail App Password as a free custom SMTP fallback in Supabase.
*   **Passkey Registration fails with "RP ID invalid"**: Double-check that your **Relying Party ID** in Supabase matches your live domain exactly, without the `https://` (e.g., `linkora.vercel.app` or `your-domain.com`).