# Deployment Verification Checklist

## Pre-Deployment Checks

### 1. Environment Variables (Vercel)
- [ ] `DATABASE_URL` or `NEON_DATABASE_URL` is set in Vercel project settings
- [ ] Environment variable is set for all environments (Production, Preview, Development)
- [ ] Connection string uses format: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`
- [ ] Test connection string locally before deploying

### 2. Database Schema
- [ ] Neon database is created and active
- [ ] Schema from `lib/database/neon-schema.sql` has been executed
- [ ] All required tables exist: users, spaces, beacons, likes, comments, follows, notifications, quaternionic_messages
- [ ] Database functions are created (calculate_quantum_resonance, etc.)

### 3. Files to Commit
- [ ] `vercel.json` (routing configuration)
- [ ] `vite.config.ts` (dev server SSE endpoint)
- [ ] `api/messages.ts` (login/register handlers)
- [ ] `api/auth/login.ts` (updated imports)
- [ ] `server/auth.ts` (updated imports)
- [ ] `src/services/communication-manager.ts` (reconnection limits)
- [ ] `src/contexts/AuthContext.tsx` (session timeouts)

## Deployment Steps

### 1. Commit and Push
```bash
git add .
git commit -m "Fix SSE, login flow, and session restoration"
git push origin main
```

### 2. Verify Vercel Build
- [ ] Build completes without TypeScript errors
- [ ] No chunk size warnings (or acceptable)
- [ ] All API routes are deployed correctly

### 3. Check Vercel Function Logs
- [ ] Navigate to Vercel Dashboard → Your Project → Functions
- [ ] Monitor `/api/events` for SSE connections
- [ ] Monitor `/api/messages` for login/register requests
- [ ] Check for any error messages

## Post-Deployment Testing

### 1. Basic Functionality
- [ ] Visit https://summoned-spaces.vercel.app
- [ ] Page loads within 10 seconds (no infinite spinner)
- [ ] Login page is accessible at `/login`
- [ ] No 404 errors on routes

### 2. SSE Connection
- [ ] Open browser console (F12)
- [ ] Check for SSE connection messages:
  - `[SSE] Attempting to establish SSE connection`
  - `[SSE] ✅ Connected to Server-Sent Events` (success)
  - OR `[SSE] Max reconnection attempts reached` (expected after 5 failures)
- [ ] Verify no MIME type errors
- [ ] Check that browser doesn't crash

### 3. Authentication Flow

#### Login Test
- [ ] Click "Login" or navigate to `/login`
- [ ] Enter credentials
- [ ] Check browser console for:
  - `[API] Received message: login`
  - `[AUTH] Received loginSuccess message`
- [ ] Verify successful login or clear error message
- [ ] Check that dashboard loads after login

#### Registration Test
- [ ] Navigate to `/register`
- [ ] Fill registration form
- [ ] Check for:
  - `[API] Received message: register`
  - `[API] Received message: login` (auto-login after register)
- [ ] Verify account creation

### 4. Session Restoration
- [ ] Log in successfully
- [ ] Refresh the page (F5)
- [ ] Verify:
  - Page shows "Restoring quantum connection..." briefly
  - Session restores within 10 seconds
  - User remains logged in
  - OR timeout occurs and shows login page (acceptable if SSE fails)

### 5. Error Handling

#### Database Not Configured
Expected behavior if `DATABASE_URL` is missing:
- [ ] Error in Vercel function logs
- [ ] Login returns error message
- [ ] Clear error shown to user (not silent failure)

#### SSE Connection Fails
Expected behavior:
- [ ] Max 5 reconnection attempts
- [ ] Exponential backoff (5s, 10s, 20s, 40s, 80s)
- [ ] Falls back to REST-only mode
- [ ] App continues to function without real-time updates
- [ ] No browser crash

## Known Issues and Limitations

### Vercel Free Tier Limitations
- [ ] SSE connections timeout after 60 seconds (Vercel limitation)
- [ ] Functions have 10-second execution timeout
- [ ] Consider upgrade for production use

### Expected Warnings
- [ ] "Some chunks are larger than 500 kB" - acceptable for now
- [ ] SSE reconnection attempts - normal behavior

## Troubleshooting

### Infinite Loading Spinner
**Symptoms:** Page stuck on "Entering the quantum realm..."
**Check:**
1. Browser console for errors
2. Vercel function logs for `/api/messages`
3. Database connection in Vercel logs
**Solution:** Session timeout (10s) should resolve automatically

### Login Fails with 500 Error
**Check:**
1. Vercel logs for actual error message
2. `DATABASE_URL` environment variable is set
3. Database schema is initialized
4. Database is not paused (Neon auto-pauses after inactivity)

### SSE MIME Type Error
**Check:**
1. `vercel.json` headers are properly configured
2. `api/events.ts` sets correct Content-Type
3. Browser console shows exact error
**Note:** Should be fixed by current implementation

### Routes Return 404
**Check:**
1. `vercel.json` rewrites are configured
2. File is committed and deployed
3. Vercel build logs show successful deployment

## Success Criteria

✅ All items in this checklist are checked
✅ Can login with valid credentials
✅ Can register new account
✅ Session persists across page refresh
✅ No browser crashes
✅ Error messages are clear and actionable
✅ SSE reconnection attempts are limited
✅ App loads within reasonable time (<10s)

## Rollback Plan

If deployment fails:
1. Check Vercel deployment history
2. Revert to previous working deployment
3. Or fix issues and redeploy

## Monitoring

Post-deployment monitoring:
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor Vercel function execution times
- [ ] Track SSE connection stability
- [ ] Monitor database query performance
- [ ] Check for memory leaks in SSE connections

## Documentation

- [ ] Update README with deployment instructions
- [ ] Document environment variables required
- [ ] Note any manual database setup steps
- [ ] Add troubleshooting guide for common issues