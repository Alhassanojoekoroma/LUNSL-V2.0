# Quick Start Guide - Backend Testing & Development

## Prerequisites

- Node.js 18+ installed
- PostgreSQL via Supabase (already set up)
- Environment variables configured (.env.local)
- Git repository initialized

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

Expected: 179+ packages installed

### 2. Verify Database Connection

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to view your database:
- ✅ Should see 15+ tables
- ✅ No connection errors
- ✅ Can browse data

### 3. Start Development Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 14.x
  - Local: http://localhost:3000
  - ready - started server on 0.0.0.0:3000
```

### 4. Test Authentication

**Option A: Browser**
1. Go to `http://localhost:3000`
2. Click login
3. Choose a provider (Google/GitHub/Email)
4. Authenticate

**Option B: cURL**
```bash
curl -X GET http://localhost:3000/api/users/me
# Will return 401 without valid session
```

---

## Testing API Endpoints

### Setup: Get Auth Token (Browser Console)

```javascript
// In browser dev console after logging in
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### 1. Test User Endpoints

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "enrollments": [],
    "badges": [],
    "certificates": []
  }
}
```

### 2. Test Course Endpoints

**List Courses:**
```bash
curl http://localhost:3000/api/courses
```

Expected: `{ "success": true, "data": [] }` (empty if no courses yet)

**Create Course (as Lecturer):**
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "description": "Learn JavaScript fundamentals",
    "category": "Programming",
    "instructor": "John Doe",
    "thumbnail": "https://example.com/image.jpg"
  }'
```

### 3. Test Enrollment

**Enroll in Course:**
```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"courseId": "course_id_here"}'
```

### 4. Test AI Chat

**Send Message to AI:**
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is JavaScript?",
    "systemPrompt": "TUTOR"
  }'
```

Expected: AI response + tokens used

### 5. Test Dashboard

**Get Dashboard:**
```bash
curl http://localhost:3000/api/dashboard \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

Response differs based on user role (Student/Lecturer/Admin)

---

## Testing Real-time Features (Socket.io)

### Using Socket.io Client Library

1. Install client:
```bash
npm install socket.io-client
```

2. Test script (`test-socket.js`):
```javascript
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  reconnection: true,
});

socket.on('connect', () => {
  console.log('✓ Connected to Socket.io');
  
  // Join as user
  socket.emit('join_user', 'user_id_123');
  
  // Send test message
  socket.emit('send_message', {
    senderId: 'user_1',
    recipientId: 'user_2',
    content: 'Hello from socket test!'
  });
});

socket.on('message_sent', (msg) => {
  console.log('✓ Message sent:', msg);
});

socket.on('receive_message', (msg) => {
  console.log('✓ Message received:', msg);
});

socket.on('disconnect', () => {
  console.log('✗ Disconnected from Socket.io');
});
```

3. Run test:
```bash
node test-socket.js
```

---

## Automated Test Suite

Create `test/api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('API Endpoints', () => {
  const BASE_URL = 'http://localhost:3000/api';

  it('GET /courses should return 200', async () => {
    const response = await fetch(`${BASE_URL}/courses`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('POST /enrollments should require auth', async () => {
    const response = await fetch(`${BASE_URL}/enrollments`, {
      method: 'POST',
      body: JSON.stringify({ courseId: 'test' }),
    });
    expect(response.status).toBe(401);
  });
});
```

Run tests:
```bash
npm run test
```

---

## Database Inspection

### View All Tables

```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Query Data Directly

```bash
npx prisma client execute

// In REPL:
const users = await prisma.user.findMany();
console.log(users);
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
# ⚠️ Deletes all data and reapplies migrations
```

---

## Common Development Tasks

### Add New API Endpoint

1. Create file: `app/api/feature/route.ts`
2. Add handler:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Your logic here
  return NextResponse.json({ success: true });
}
```
3. Test endpoint

### Update Database Schema

1. Modify `prisma/schema.prisma`
2. Create migration:
```bash
npx prisma migrate dev --name describe_change
```
3. Schema is applied to database automatically

### Debug Mode

Enable debug logging:
```bash
DEBUG=prisma:* npm run dev
```

---

## Performance Monitoring

### Check Build Size

```bash
npm run build
# Next.js will show bundle analysis
```

### Monitor API Response Times

Add timing middleware:
```typescript
// Global middleware timing
const start = Date.now();
// ... API logic
console.log(`API responded in ${Date.now() - start}ms`);
```

### Database Query Performance

```bash
npx prisma studio
# View slowest queries in UI
```

---

## Troubleshooting

### Database Connection Error

```
Error: P1000: Authentication failed
```

**Fix:**
1. Check DATABASE_URL in `.env.local`
2. Verify Supabase credentials
3. Test connection: `npx prisma db push`

### NextAuth Not Working

```
Error: NEXTAUTH_SECRET is not set
```

**Fix:**
1. Generate secret: `openssl rand -base64 32`
2. Add to `.env.local`: `NEXTAUTH_SECRET=...`
3. Restart dev server

### Socket.io Not Connecting

```
WebSocket connection failed
```

**Fix:**
1. Check CORS settings in `lib/socket-io.ts`
2. Verify NEXTAUTH_URL is set
3. Check firewall/network

### AI Chat Returns 403

```
Error: OPENAI_API_KEY is invalid
```

**Fix:**
1. Verify API keys in `.env.local`
2. Check API key permissions
3. Check rate limits

---

## Performance Tips

1. **Use Pagination**
   - Always add `?page=1&limit=20` to list endpoints
   - Prevents loading thousands of records

2. **Select Specific Fields**
   ```typescript
   select: { id: true, name: true } // Only get need fields
   ```

3. **Cache Frequently Accessed Data**
   - Course list
   - User badges
   - Dashboard stats

4. **Use Database Indexes**
   - Already added for common fields
   - Check `@@index` in schema.prisma

---

## Next Steps

1. ✅ Database initialized
2. ✅ All API endpoints created
3. ✅ Real-time features set up
4. 🔄 **Frontend development** (next phase)
5. 🔄 Integration testing
6. 🔄 Production deployment

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npx prisma studio      # Open database GUI
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Create + apply migration
npx prisma db push     # Sync schema without migration

# Testing
npm run test            # Run tests
npm run test:watch     # Watch mode

# Code Quality
npm run lint            # Check code
npm run format          # Format code

# Git
git status              # Check changes
git add .               # Stage changes
git commit -m "msg"     # Commit changes
git push                # Push to GitHub
```

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth Docs](https://next-auth.js.org/getting-started/introduction)
- [Socket.io Docs](https://socket.io/docs/)
- [Supabase Docs](https://supabase.com/docs)

---

## Support

For issues or questions:
1. Check logs: `npm run dev` output
2. Check database: `npx prisma studio`
3. Check API responses: Browser DevTools > Network
4. Check Socket.io: Browser Console

---

**Status:** Ready for Testing ✅
**Last Updated:** March 28, 2026
