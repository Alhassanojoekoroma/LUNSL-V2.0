# LUSL Notepad Backend Setup Guide

## Overview

This document outlines the backend infrastructure for LUSL Notepad V2.0, including database setup, authentication, API endpoints, and AI integration.

## Technology Stack

- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI, Google Gemini, Claude
- **Real-time**: Socket.io
- **Validation**: Zod (optional)

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- API keys for:
  - OpenAI (optional)
  - Google Generative AI (optional)
  - Anthropic Claude (optional)
  - OAuth providers (Google, GitHub, Azure AD)

## Installation & Setup

### 1. Environment Variables

Copy the `.env.local` template and fill in your credentials:

```bash
cp .env.local.example .env.local
```

**Required variables to set:**

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# AI Provider (choose at least one)
OPENAI_API_KEY="sk-..."
GOOGLE_GENERATIVE_AI_KEY="..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 2. Database Setup

Initialize Prisma and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 3. Database Seeding (Optional)

Create a `prisma/seed.ts` file for seeding initial data:

```typescript
import { prisma } from "@/lib/prisma";

async function main() {
  // Create test users
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      role: "STUDENT",
    },
  });

  console.log("Seed data created:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run with:
```bash
npx prisma db seed
```

## Core Systems

### Authentication (NextAuth)

Located in `/lib/auth.ts`

**Supported providers:**
- Email/Password
- Google OAuth
- GitHub OAuth
- Azure AD
- Magic links (Email provider)

**Session configuration:**
- Strategy: JWT
- Max age: 30 days
- Auto-refresh: Every 24 hours

**Key files:**
- `/lib/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth API route

### Database Schema

The Prisma schema includes models for:

#### 1. **Users & Authentication**
- `User` - User accounts with role-based access
- `Account` - OAuth account linking
- `Session` - Session tracking
- `Profile` - Extended user profiles
- `Certificate` - User certificates
- `UserBadge` - Achievement badges

#### 2. **Content & Learning**
- `Course` - Course information
- `Content` - Course modules (video, PDF, quiz, etc.)
- `Quiz` - Quiz definitions
- `QuizQuestion` - Individual questions
- `QuizAttempt` - Quiz attempt tracking
- `QuizAttemptAnswer` - Student answers

#### 3. **Progress & Enrollment**
- `CourseEnrollment` - Student enrollments
- `ProgressRecord` - Learning progress tracking
- `Badge` - Achievement/badge definitions

#### 4. **Communication**
- `Message` - Direct messaging
- `Notification` - Push notifications
- `ChatHistory` - AI chat sessions
- `ChatMessage` - Individual chat messages

#### 5. **Community**
- `StudyGroup` - Study group management
- `StudyGroupMember` - Group membership
- `ForumPost` - Discussion forum posts
- `ForumComment` - Forum comments
- `Note` - Student notes

#### 6. **Tokenomics**
- `TokenTransaction` - Token tracking

## API Endpoints

### Authentication

```
POST /api/auth/signin       - Sign in
POST /api/auth/signup       - Sign up (to be created)
POST /api/auth/signout      - Sign out
GET  /api/auth/session      - Get session
POST /api/auth/callback     - OAuth callback
```

### Users

```
GET  /api/users/me          - Get current user profile
PUT  /api/users/me          - Update profile
DELETE /api/users/me        - Delete account
```

### Courses

```
GET  /api/courses                    - List courses (paginated)
POST /api/courses                    - Create course (Lecturer/Admin)
GET  /api/courses/[id]              - Get course details
PUT  /api/courses/[id]              - Update course
DELETE /api/courses/[id]            - Delete course
GET  /api/courses/[id]/contents     - Get course contents
```

### Enrollments

```
GET  /api/enrollments               - Get user enrollments
POST /api/enrollments               - Enroll in course
DELETE /api/enrollments/[id]        - Drop course
```

### Quizzes

```
GET  /api/quizzes/[id]              - Get quiz details
POST /api/quizzes/[id]/submit       - Submit quiz answers
GET  /api/quizzes/[id]/results/[attemptId] - Get results
GET  /api/quizzes/[id]/attempts     - Get all attempts
```

### AI Assistant

```
POST /api/ai/chat                   - Send message to AI
GET  /api/ai/chat/[chatId]         - Get chat history
DELETE /api/ai/chat/[chatId]        - Delete chat
GET  /api/ai/chat/history           - List all chats
```

### Content Management

```
GET  /api/content                   - List content
POST /api/content                   - Create content (Lecturer/Admin)
PUT  /api/content/[id]              - Update content
DELETE /api/content/[id]            - Delete content
```

### Forums

```
GET  /api/forums/posts              - List forum posts
POST /api/forums/posts              - Create post
GET  /api/forums/posts/[id]        - Get post details
PUT  /api/forums/posts/[id]        - Update post
DELETE /api/forums/posts/[id]      - Delete post
POST /api/forums/posts/[id]/comments - Post comment
```

## AI Service Usage

The `AIService` class (`/lib/ai-service.ts`) provides a unified interface for three AI providers.

### Basic Usage

```typescript
import { aiService, SYSTEM_PROMPTS } from "@/lib/ai-service";

// Single message
const response = await aiService.chat(
  [{ role: "user", content: "What is machine learning?" }],
  SYSTEM_PROMPTS.TUTOR,
  "openai"
);

console.log(response.content); // AI response
console.log(response.tokens);  // Token usage

// With fallback
const response = await aiService.chatWithFallback(
  messages,
  systemPrompt
);
```

### System Prompts

Available system prompts:
- `SYSTEM_PROMPTS.TUTOR` - Educational tutoring
- `SYSTEM_PROMPTS.CODE_ASSISTANT` - Programming help
- `SYSTEM_PROMPTS.CONTENT_CREATOR` - Content writing
- `SYSTEM_PROMPTS.QUIZ_GENERATOR` - Quiz creation

### Switching Providers

```typescript
// Use specific provider
await aiService.chat(messages, systemPrompt, "gemini");

// Use preferred provider (from .env)
await aiService.chat(messages, systemPrompt);

// Fallback to any available
await aiService.chatWithFallback(messages, systemPrompt);

// Check available providers
const providers = aiService.getAvailableProviders();
```

## Database Migrations

### Create a new migration

```bash
npx prisma migrate dev --name migration_name
```

### Reset database (dev only)

```bash
npx prisma migrate reset
```

### Deploy migrations (production)

```bash
npx prisma migrate deploy
```

## Security Considerations

1. **Authentication**
   - All API endpoints require `getServerSession()` verification
   - NextAuth handles session management
   - Credentials never exposed in frontend code

2. **Database**
   - Use environment variables for connection strings
   - Enable SSL/TLS in production
   - Regular backups (Supabase handles this)

3. **API Keys**
   - Store in `.env.local` (never commit)
   - Use different keys for dev/staging/production
   - Rotate keys regularly

4. **Rate Limiting**
   - Implement rate limiting on public endpoints
   - Protect AI endpoints from abuse

5. **CORS**
   - Configure allowed origins in NextAuth
   - Restrict API access as needed

## Debugging

### View database changes

```bash
npx prisma studio
```

### Check migrations status

```bash
npx prisma migrate status
```

### Enable debug logging

Add to `.env.local`:
```env
DEBUG="prisma:*"
```

## Common Issues

### "Connection timeout" error

- Check `DATABASE_URL` format
- Verify IP whitelist in Supabase
- Ensure PostgreSQL is running

### "NEXTAUTH_SECRET missing" error

- Generate with: `openssl rand -base64 32`
- Add to `.env.local`

### "AI Provider not configured" error

- Ensure API keys are set in `.env.local`
- Check provider name matches configuration

## Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Configure environment variables
3. ✅ Initialize Prisma
4. ✅ Create API endpoints
5. ⏳ Implement file uploads (S3/Vercel Blob)
6. ⏳ Set up real-time features (Socket.io)
7. ⏳ Add rate limiting middleware
8. ⏳ Implement email notifications
9. ⏳ Set up payment processing (Stripe)
10. ⏳ Deploy to production

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Generative AI](https://ai.google.dev/)
- [Anthropic Claude](https://www.anthropic.com/)

## Support

For backend-related questions or issues, create an issue in the repository with:
- Error message and stack trace
- Environment details (Node version, OS)
- Steps to reproduce
- Screenshots if applicable
