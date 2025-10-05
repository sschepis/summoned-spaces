# Vercel Deployment Setup Guide

## Required Environment Variables

Your Vercel deployment requires the following environment variables to be configured in your Vercel project settings:

### Database Configuration (REQUIRED)

You must set up a Neon PostgreSQL database and configure the connection string:

1. **Create a Neon Database:**
   - Go to https://neon.tech
   - Create a new project
   - Copy the connection string

2. **Add to Vercel:**
   - Go to your Vercel project settings
   - Navigate to Settings → Environment Variables
   - Add the following variable:

   ```
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
   
   OR
   
   ```
   NEON_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

### Setting Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (summoned-spaces)
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each required variable:
   - **Variable Name:** `DATABASE_URL`
   - **Value:** Your Neon connection string
   - **Environment:** Production, Preview, Development (check all)
6. Click "Save"

### Initialize Database Schema

After setting the environment variables, you need to initialize the database schema:

1. Run the migration script locally with your Neon URL:
   ```bash
   DATABASE_URL="your-neon-connection-string" npm run migrate:neon
   ```

2. Or manually execute the schema from `lib/database/neon-schema.sql` in your Neon SQL editor

### Redeploy

After adding the environment variables:

1. Go to the "Deployments" tab in Vercel
2. Click the "..." menu on your latest deployment
3. Select "Redeploy"
4. Or simply push a new commit to trigger automatic deployment

### Troubleshooting

**Login fails with 500 error:**
- Check Vercel logs: Settings → Functions → Select your function → View logs
- Ensure `DATABASE_URL` or `NEON_DATABASE_URL` is set
- Ensure the database schema has been initialized
- Check that the Neon database is accessible (not paused)

**404 on routes like /login:**
- Ensure `vercel.json` is committed and deployed
- Check that the deployment built successfully

**SSE connection errors:**
- These should be fixed by the recent updates to `vite.config.ts` and `vercel.json`
- Check browser console for specific error messages

### Verify Environment Variables

You can verify your environment variables are set correctly by:

1. Going to Settings → Environment Variables in Vercel
2. You should see `DATABASE_URL` listed
3. The value should start with `postgresql://`

### Local Development

For local development with Neon:

1. Copy `.env.production.example` to `.env.local`
2. Update `DATABASE_URL` with your Neon connection string
3. Run `npm run dev`