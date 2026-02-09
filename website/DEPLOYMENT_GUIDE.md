# Academathon Deployment Guide

This guide walks you through deploying the Academathon application to:
- **Supabase** - PostgreSQL database
- **Render** - Java Spring Boot backend
- **Vercel** - React frontend (already deployed)

---

## 1. Supabase Setup (Database)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `academathon`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for setup

### Step 2: Get Your Database Credentials

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy the **URI** connection string (it looks like):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

**Important**: Use the **"Transaction Pooler"** (port 6543) for better connection handling with Spring Boot.

### Step 3: Note Your Credentials

You'll need these for Render:
- **DATABASE_URL**: `jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres?user=postgres.[project-ref]&password=[YOUR-PASSWORD]`
- **DATABASE_USERNAME**: `postgres.[project-ref]`
- **DATABASE_PASSWORD**: Your database password

---

## 2. Render Setup (Backend)

### Step 1: Create a Render Account

1. Go to [render.com](https://render.com) and sign up/log in
2. Connect your GitHub account

### Step 2: Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `academathon-backend`
   - **Region**: Same as your Supabase region for best performance
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `website/Backend`
   - **Runtime**: `Docker`
   - **Instance Type**: Free (or Starter for production)

### Step 3: Set Environment Variables

Go to **Environment** tab and add these variables:

| Key | Value |
|-----|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | `jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres` |
| `DATABASE_USERNAME` | `postgres.[project-ref]` |
| `DATABASE_PASSWORD` | Your Supabase password |
| `JWT_SECRET_KEY` | Generate: `openssl rand -base64 64` (must be 256+ bits) |
| `MAIL_USERNAME` | `ryant012015@gmail.com` |
| `MAIL_PASSWORD` | Your Gmail app password |
| `AWS_S3_BUCKET_NAME` | `academathon-user-uploads` |
| `AWS_S3_REGION` | `ca-central-1` |
| `AWS_S3_ACCESS_KEY` | Your AWS access key |
| `AWS_S3_SECRET_KEY` | Your AWS secret key |
| `STRIPE_API_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your application
3. Once deployed, note your URL: `https://academathon-backend.onrender.com` (or use your custom domain `https://api.academathon.com`)

### Step 5: Update CORS (if needed)

If your domain is different from `academathon.com`, update the CORS configuration in:
- `website/Backend/src/main/java/com/academathon/security/SecurityConfig.java`

---

## 3. Vercel Frontend Configuration

### Update Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://api.academathon.com` (or your Render URL `https://academathon-backend.onrender.com`)
4. Redeploy your frontend

---

## 4. Post-Deployment Checklist

### Verify Database Connection
```bash
# Check Render logs for successful startup
# Look for: "Started AcademathonApplication in X seconds"
```

### Test API Endpoints
```bash
# Health check
curl https://api.academathon.com/actuator/health

# Should return: {"status":"UP"}
```

### Update Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.academathon.com/api/payments/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` in Render with the new signing secret

---

## 5. Environment Variables Summary

### Render (Backend)

```env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=postgres.xxxxx
DATABASE_PASSWORD=your-password
JWT_SECRET_KEY=your-256-bit-secret-key
MAIL_USERNAME=ryant012015@gmail.com
MAIL_PASSWORD=your-app-password
AWS_S3_BUCKET_NAME=academathon-user-uploads
AWS_S3_REGION=ca-central-1
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_KEY=your-secret-key
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Vercel (Frontend)

```env
VITE_API_URL=https://api.academathon.com
```

---

## 6. Troubleshooting

### Database Connection Issues
- Ensure you're using the Transaction Pooler connection (port 6543)
- Check that the password doesn't contain special characters that need URL encoding
- Verify the database is in the same region as Render for best performance

### CORS Errors
- Update `SecurityConfig.java` with your exact production domain
- Ensure the domain doesn't have a trailing slash

### Flyway Migration Issues
- If migrations fail, you may need to run `flyway baseline` first
- Check Supabase SQL editor for table creation status

### Cold Starts (Free Tier)
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Consider upgrading to Starter tier for always-on

---

## 7. Security Reminders

⚠️ **Before Going Live**:

1. **Rotate all secrets** - Generate new values for production
2. **Use environment variables** - Never commit secrets to Git
3. **Enable HTTPS only** - Both Render and Vercel enforce this
4. **Set up monitoring** - Use Render's built-in logs and alerts
5. **Configure backup** - Enable Supabase's Point-in-Time Recovery

---

## Quick Start Commands

```bash
# Generate a secure JWT secret
openssl rand -base64 64

# Test your deployed API
curl -X GET https://api.academathon.com/actuator/health

# View Render logs
# Go to Render Dashboard → Your Service → Logs
```

---

**Need Help?**
- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
