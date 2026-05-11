# Supabase Integration Guide (Phase 8)

## Overview

This guide provides step-by-step instructions to integrate your EduNova backend with Supabase PostgreSQL database. Supabase replaces or complements MongoDB with a managed PostgreSQL service, offering better scalability, compliance, and built-in authentication.

**Target Completion Time**: 30 minutes (schema setup + verification)

---

## Prerequisites

1. **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
2. **Project Access**: Your project link: `https://niguemzjxpzzcouhhvep.supabase.co`
3. **Environment**: Node.js backend with @supabase/supabase-js library (already installed)

---

## Step 1: Access Your Supabase Dashboard

### 1.1 Project URL
Navigate to your Supabase project:
```
https://supabase.com/dashboard/project/niguemzjxpzzcouhhvep
```

### 1.2 Retrieve API Credentials
Go to **Settings → API** and note down:
- **Project URL**: `https://niguemzjxpzzcouhhvep.supabase.co`
- **Anon (public) Key**: Used in frontend (already in `.env.example`)
- **Service Role Key**: Used in backend (already in `.env.example`)

These credentials are already in your `.env` file (development mode).

---

## Step 2: Create Database Schema

### 2.1 Open SQL Editor
In your Supabase Dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire content from `backend/scripts/supabaseSchema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press `Ctrl+Enter`)

### 2.2 What This Creates
The schema script creates 10 tables:
- **users**: Student/teacher accounts with JWT authentication
- **courses**: Course catalog with instructor metadata
- **enrollments**: Student course registrations with progress tracking
- **certificates**: Generated certificates upon completion
- **books**: Library catalog items
- **borrowing**: Book lending and return records
- **meetings**: Live classes/sessions with attendees
- **meeting_attendees**: Participation tracking
- **transactions**: Payment history (Razorpay integration)
- **audit_logs**: Admin action audit trail for compliance

Plus:
- **Indexes** for optimal query performance
- **RLS Policies** for row-level data isolation
- **Triggers** for automatic `updated_at` timestamps
- **Sample data** (optional: 3 example users - admin, teacher, student)

### 2.3 Verify Tables Created
Go to **Table Editor** → Confirm all 10 tables appear in the left sidebar.

---

## Step 3: Configure Backend

### 3.1 Environment Variables
Your `.env` file already contains:
```bash
SUPABASE_URL=https://niguemzjxpzzcouhhvep.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_KEY=eyJhbGciOi...
```

**No action needed** — credentials are pre-configured for development.

### 3.2 Production Setup
For production deployment, update `.env.production.example`:
1. Replace `https://your-project-id.supabase.co` with your actual project URL
2. Replace placeholder keys with real keys from Supabase Settings → API
3. Deploy with `NODE_ENV=production`

---

## Step 4: Test Connection

### 4.1 Start Backend Server
```bash
cd backend
npm start
```

**Expected Output**:
```
✓ Supabase client initialized
🚀 EduNova Backend running on http://localhost:5000
```

### 4.2 Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-05-11T14:27:31.000Z",
  "uptime": 3.5,
  "database": {
    "mongodb": "disconnected",
    "supabase": "configured"
  }
}
```

### 4.3 Verify in Supabase Dashboard
1. Go to **SQL Editor**
2. Run: `SELECT COUNT(*) FROM users;`
3. Should return **3** (sample users from schema setup)

---

## Step 5: Migrate API Routes (Phase 8 - In Progress)

### 5.1 Available Repository Classes
The backend now includes a **UserRepository** for Supabase operations:

**File**: `backend/repositories/UserRepository.js`

**Available Methods**:
```javascript
// Single user queries
UserRepository.findByEmail(email)      // Get user by email
UserRepository.findById(id)            // Get user by UUID
UserRepository.emailExists(email)      // Boolean check

// User management
UserRepository.create(userData)        // Insert new user
UserRepository.update(id, updates)     // Update user fields
UserRepository.delete(id)              // Remove user

// Batch operations
UserRepository.listUsers(page, pageSize, filters)  // Paginated list
```

**Example Usage**:
```javascript
const UserRepository = require('../repositories/UserRepository');

// In your auth route:
const user = await UserRepository.findByEmail(req.body.email);
if (user) {
  return res.status(409).json({ error: 'Email already registered' });
}

const newUser = await UserRepository.create({
  email: req.body.email,
  password_hash: hashedPassword,
  first_name: req.body.firstName,
  role: 'student'
});
```

### 5.2 Next Steps
Migrate other routes by:
1. Creating **CourseRepository**, **EnrollmentRepository**, etc.
2. Updating route handlers to use repository methods
3. Keeping MongoDB as optional fallback (non-breaking)

---

## Step 6: Row-Level Security (RLS)

### 6.1 RLS Policies (Auto-Created)
The schema includes policies for:
- **Users**: Admins see all; users see themselves
- **Courses**: Public read; instructors edit own; admins edit all
- **Enrollments**: Students see own; admins see all
- **Books**: Public read
- **Borrowing**: Students see own; admins see all
- **Audit Logs**: Admins only

### 6.2 Enable RLS for API Access
In Supabase Dashboard → **SQL Editor**:
```sql
-- Enable RLS on all tables (already done by schema script)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

---

## Step 7: Real-Time Subscriptions (Optional)

Supabase supports real-time updates for features like:
- Live notification of new enrollments
- Real-time course progress updates
- Meeting attendance notifications

**Example** (not yet implemented):
```javascript
const { supabase } = require('../config/supabase');

// Subscribe to new enrollments
const subscription = supabase
  .from('enrollments')
  .on('*', payload => {
    console.log('Enrollment update:', payload);
  })
  .subscribe();
```

---

## Step 8: Supabase Storage (Optional File Uploads)

Replace local Multer with Supabase Storage for:
- Course thumbnails
- Student certificates
- Meeting recordings
- User avatars

**Future Enhancement**: Planned for Phase 9.

---

## Troubleshooting

### Error: "Unable to connect to Supabase"
**Cause**: Invalid credentials or network issue  
**Fix**: Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in `.env`

### Error: "Relation 'users' does not exist"
**Cause**: Schema not created yet  
**Fix**: Run the SQL schema from `backend/scripts/supabaseSchema.sql` in Supabase SQL Editor

### Error: "Connection timeout"
**Cause**: Supabase project is sleeping (free tier)  
**Fix**: Wake project by visiting Supabase Dashboard; free tier projects auto-sleep after 1 week inactivity

### Error: "Permission denied (RLS policy)"
**Cause**: Row-Level Security policy violation  
**Fix**: Verify user JWT claims match RLS policy rules; use SERVICE_KEY for admin operations

---

## Security Best Practices

### 1. **Protect Credentials**
- Never commit `.env` with real keys to Git
- Use `.env.production.example` as template (keys remain placeholder)
- Rotate keys quarterly: **Settings → API → Regenerate**

### 2. **Use SERVICE_KEY Carefully**
- SERVICE_KEY bypasses RLS policies (unrestricted access)
- Only use on server-side operations
- Never expose to frontend or logs

### 3. **RLS Policies**
- Always enable RLS on production tables
- Define restrictive default policies (deny by default)
- Test policies with sample JWT tokens

### 4. **API Rate Limiting**
- Supabase free tier: 3,000 requests/day
- Backend rate limiter (`express-rate-limit`) adds protection
- Consider upgrade for production traffic >1000 req/min

---

## Migration Checklist

- [ ] Created Supabase project and schema
- [ ] Verified tables in Table Editor
- [ ] Updated environment variables (`.env`)
- [ ] Started backend server (`npm start`)
- [ ] Tested `/api/health` endpoint
- [ ] Verified sample data in SQL Editor
- [ ] Created UserRepository (✓ done)
- [ ] Reviewed RLS policies
- [ ] [ ] Migrated auth routes to UserRepository (next phase)
- [ ] [ ] Migrated course routes to CourseRepository
- [ ] [ ] Migrated enrollment routes
- [ ] [ ] Tested end-to-end with frontend
- [ ] [ ] Updated `.env.production.example` with real credentials
- [ ] [ ] Deployed to production

---

## Next Steps

### Phase 8 Continuation
1. **Create remaining repositories**: CourseRepository, EnrollmentRepository, etc.
2. **Migrate routes**: /api/auth, /api/courses, /api/enrollments, etc.
3. **Test end-to-end**: Register → Enroll → Payment → Certificate

### Phase 9 (Future)
1. **Supabase Storage**: Replace Multer with cloud uploads
2. **Real-time subscriptions**: Live notifications
3. **Supabase Auth**: Optional, can replace bcryptjs + JWT

### Production Hardening (Post-Migration)
1. **Disable MongoDB** when all routes migrated
2. **Enable full RLS enforcement** in production
3. **Set up Supabase webhooks** for event-driven workflows
4. **Enable automated backups** (Business tier)

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **PostgreSQL Best Practices**: https://www.postgresql.org/docs/current/plpgsql.html
- **RLS Examples**: https://supabase.com/docs/guides/auth/row-level-security

---

## Support

**Issues or Questions?**
1. Check Supabase status: https://status.supabase.com
2. Review backend logs: `backend/logs/error.log`
3. Verify environment: `npm run test:ci`

---

**Last Updated**: May 11, 2026 (Phase 8)  
**Status**: Schema created, client integrated, repositories ready
