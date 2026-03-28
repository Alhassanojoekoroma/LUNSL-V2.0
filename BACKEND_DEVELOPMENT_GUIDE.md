# Backend Development Guide

## Overview

The LUSL (Learning University Smart Learning) backend is a comprehensive education platform built with Next.js, Prisma, and PostgreSQL. This guide covers all available features and how to use them.

## Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma v6.19.2
- **Authentication**: NextAuth.js with OAuth2
- **Real-time**: Socket.io
- **AI Integration**: OpenAI, Google Gemini, Anthropic Claude
- **API Style**: RESTful with WebSocket support

### Database Models (20+)
```
User → Course, CourseEnrollment, Message, Notification, ChatHistory
Course → Content, Quiz, Enrollment, Forum, StudyGroup
Quiz → QuizQuestion, QuizAttempt
Forum → ForumPost → ForumComment
StudyGroup → Members
ChatHistory → ChatMessage
Progress → ProgressRecord, Certificate, Badge
Token → TokenTransaction
```

### Project Structure
```
app/
  api/
    auth/          # NextAuth handlers
    users/         # User management
    courses/       # Course management
    enrollments/   # Course enrollments
    quizzes/       # Quiz submission
    ai/            # AI chat
    notifications/ # Notifications
    study-groups/  # Study groups
    notes/         # User notes
    badges/        # Achievements
    progress/      # Learning progress
    tokens/        # Reward tokens
    dashboard/     # Role-based dashboards

lib/
  auth.ts        # NextAuth configuration
  prisma.ts      # Prisma client
  ai-service.ts  # AI provider management
  socket-io.ts   # WebSocket setup
  api-utils.ts   # API response utilities

prisma/
  schema.prisma  # Database schema
  migrations/    # Database migrations
```

---

## Core Features

### 1. Authentication

**Supported Providers:**
- Google OAuth
- GitHub OAuth
- Azure AD
- Email (Magic Links)
- Local Credentials

**Implementation:**
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  // Not authenticated
}
```

**User Roles:**
- `STUDENT`: Can enroll in courses, take quizzes, send messages
- `LECTURER`: Can create courses, upload content, grade quizzes
- `ADMIN`: Full system access, user management, analytics

---

### 2. Course Management

**Creating a Course (Lecturer/Admin):**
```
POST /api/courses
{
  "title": "Introduction to JavaScript",
  "description": "Learn JS from basics",
  "category": "Programming",
  "instructor": "John Doe",
  "thumbnail": "https://..."
}
```

**Course Structure:**
- Course → Content items (videos, PDFs, quizzes)
- Content → Sequential learning path
- Quiz → Auto-grading with feedback
- Forum → Student discussions

**Key Fields:**
- `title`: Course name
- `description`: Full description
- `category`: For filtering
- `status`: Published/Draft
- `thumbnail`: Cover image

---

### 3. Course Content

**Uploading Content (Lecturer):**
```
POST /api/courses/{courseId}/content
{
  "title": "Module 1: Variables",
  "description": "Learn about variables",
  "type": "VIDEO",
  "contentUrl": "https://youtube.com/...",
  "duration": 1200,
  "sequenceNumber": 1
}
```

**Content Types:**
- `VIDEO`: Embedded video lessons
- `PDF`: PDF documents
- `DOCUMENT`: Tutorial documents
- `QUIZ`: Assessment quizzes
- `ASSIGNMENT`: Submission assignments
- `RESOURCE`: Reference materials

**Key Features:**
- Sequential learning path
- Progress tracking per item
- Automatic ordering

---

### 4. Quizzes & Assessment

**Quiz Submission:**
```
POST /api/quizzes/{quizId}/submit
{
  "answers": [
    { "questionId": "q1", "answer": "correct_answer" },
    { "questionId": "q2", "answer": "C" }
  ]
}
```

**Response:**
```json
{
  "score": 8,
  "maxScore": 10,
  "percentage": 80,
  "passing": true,
  "feedback": "Great job! You scored 80%",
  "tokensEarned": 50
}
```

**Quiz Features:**
- Auto-grading (multiple choice, short answer)
- Attempt limiting (customizable max attempts)
- Passing score calculation
- Token rewards for completion
- Detailed feedback

**Question Types:**
- `MULTIPLE_CHOICE`: A-D options
- `SHORT_ANSWER`: Text comparison
- `ESSAY`: Manual grading needed

---

### 5. User Progress Tracking

**Getting User Progress:**
```
GET /api/progress?userId=user123
```

**Response Includes:**
- Current enrollment status
- Progress percentage per course
- Completed content items
- Certificates earned
- Badges achieved
- Overall stats

**Progress Status:**
- `NOT_STARTED`: Enrolled, haven't started
- `IN_PROGRESS`: Currently learning
- `COMPLETED`: Finished course or module
- `ABANDONED`: Dropped course

---

### 6. Certificates & Achievements

**Awarding Certificate (Lecturer/Admin):**
```
POST /api/progress
{
  "userId": "user123",
  "courseId": "course456",
  "action": "complete_course"
}
```

**Certificate Details:**
- Unique certificate number
- Course title
- Completion date
- User name
- Issuer (certified by)

**Badges System:**
- Custom badge names
- Icon/emoji support
- Earned date tracking
- Display on user profile

---

### 7. AI Chat & Tutoring

**Sending Message to AI:**
```
POST /api/ai/chat
{
  "message": "How do I use map() in JavaScript?",
  "systemPrompt": "CODE_ASSISTANT"
}
```

**System Prompts Available:**
- `TUTOR`: General learning assistant
- `CODE_ASSISTANT`: Programming help
- `CONTENT_CREATOR`: Content generation
- `QUIZ_GENERATOR`: Quiz creation

**Providers & Fallback:**
1. OpenAI GPT-4 (primary)
2. Google Gemini (fallback)
3. Anthropic Claude (fallback)

**Features:**
- Conversation history stored
- Token usage tracking
- Automatic provider fallback
- Custom system instructions

---

### 8. Forums & Discussions

**Creating Forum Post:**
```
POST /api/courses/{courseId}/forum
{
  "title": "How to solve recursion problems?",
  "content": "I'm struggling with recursive functions..."
}
```

**Adding Comments:**
```
POST /api/courses/{courseId}/forum/{postId}/comments
{
  "content": "Try breaking it down step by step..."
}
```

**Forum Features:**
- Discussion per course
- Nested comments
- Author tracking
- Creation date
- Comment count

---

### 9. Study Groups

**Creating a Study Group:**
```
POST /api/study-groups
{
  "name": "JavaScript Masters",
  "description": "Advanced JS study group",
  "courseId": "course123",
  "maxMembers": 10
}
```

**Joining/Leaving:**
```
POST /api/study-groups/{groupId}
{
  "action": "join"
}
```

**Features:**
- Member capacity limits
- Group messaging (via Socket.io)
- Associated with specific course
- Creator tracking

---

### 10. Messaging

**Direct Messages:**
```typescript
socket.emit('send_message', {
  senderId: 'user1',
  recipientId: 'user2',
  content: 'Hello!'
});

socket.on('receive_message', (message) => {
  // Message received
});
```

**Group Study Chat:**
```typescript
socket.emit('group_message', {
  groupId: 'group123',
  userId: 'user1',
  message: 'Let's study chapter 5'
});
```

**Features:**
- Direct one-on-one messaging
- Group study conversations
- Real-time delivery via Socket.io
- Message persistence in DB

---

### 11. Notifications

**Notification Types:**
- `COURSE_UPDATE`: New content added
- `NEW_MESSAGE`: Direct message received
- `QUIZ_RESULT`: Quiz graded
- `ACHIEVEMENT`: Badge earned
- `ENROLLMENT`: Accepted into course
- `SYSTEM`: Admin announcements

**Getting Notifications:**
```
GET /api/notifications
```

**Subscribe to Real-time:**
```typescript
socket.on('notification_received', (notification) => {
  console.log('You earned a badge:', notification.message);
});
```

---

### 12. Gamification System

**Token Rewards:**
- Awards earned by completing quizzes
- Awarded for participation
- Tracked per user
- Redeemable (future feature)

**Token Types:**
- `QUIZ_COMPLETION`: For passing quizzes
- `ASSIGNMENT_SUBMISSION`: For assignments
- `PARTICIPATION`: For forum/group activity
- `REWARD`: Admin awards
- `REFUND`: Correction/reversal

**Getting Token Balance:**
```
GET /api/tokens
```

---

### 13. Notes & Study Materials

**Creating Notes:**
```
POST /api/notes
{
  "content": "Key points about closures...",
  "contentId": "content_item_123",
  "tag": "closures"
}
```

**Features:**
- Note association with content
- Tagging system
- Creation date
- User-specific notes

---

### 14. Dashboard Analytics

**Student Dashboard:**
- Enrolled courses count
- Completion percentage
- Badges earned
- Token balance
- Recent enrollments
- Certificates

**Lecturer Dashboard:**
- Total students taught
- Courses created
- Average student performance
- Forum moderation queue
- Course analytics

**Admin Dashboard:**
- Platform-wide statistics
- User distribution by role
- Top courses
- Enrollment trends
- Revenue (if enabled)

---

### 15. Enrollments

**Enrolling in Course:**
```
POST /api/enrollments
{
  "courseId": "course123"
}
```

**Enrollment Statuses:**
- `ACTIVE`: Currently taking course
- `COMPLETED`: Finished successfully
- `DROPPED`: User withdrew
- `SUSPENDED`: Admin action

**Enrollment Features:**
- Progress percentage tracking
- Enrollment date
- Completion date
- Status history

---

## API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "timestamp": "2026-03-28T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Course not found",
  "code": "NOT_FOUND",
  "timestamp": "2026-03-28T10:30:00.000Z"
}
```

---

## WebSocket Events Reference

### Connection Management
```typescript
socket.emit('join_user', userId);
socket.on('user_online', ...);
socket.on('user_offline', ...);
```

### Messaging
```typescript
socket.emit('send_message', messageData);
socket.on('receive_message', ...);
socket.emit('typing', { recipientId, isTyping });
socket.on('user_typing', ...);
```

### Notifications
```typescript
socket.emit('send_notification', notificationData);
socket.on('notification_received', ...);
```

### Study Groups
```typescript
socket.emit('join_study_group', groupId);
socket.emit('group_message', { groupId, message });
socket.on('group_message_received', ...);
```

### Quizzes
```typescript
socket.emit('quiz_submitted', { quizId, score, maxScore });
socket.on('quiz_completed', ...);
```

---

## Common Use Cases

### Use Case 1: Student Takes a Course

1. User enrolls: `POST /api/enrollments`
2. System creates CourseEnrollment, sends notification
3. Student views content: `GET /api/courses/{id}/content`
4. Student completes content item
5. Student takes quiz: `POST /api/quizzes/{id}/submit`
6. System auto-grades, awards tokens
7. When all content done: `POST /api/progress` → Creates certificate
8. Notification sent via Socket.io

### Use Case 2: Lecturer Creates Course

1. Lecturer creates course: `POST /api/courses`
2. Adds content: `POST /api/courses/{id}/content`
3. Adds quizzes: `POST /api/quizzes`
4. Students enroll
5. Lecturer views dashboard: `GET /api/dashboard`
6. Can award badges: `POST /api/badges`
7. Can moderate forum: `GET /api/courses/{id}/forum`

### Use Case 3: Real-time Study Session

1. Study group created: `POST /api/study-groups`
2. Members join: `POST /api/study-groups/{id}`
3. Connect with Socket.io: `socket.emit('join_study_group')`
4. Send messages: `socket.emit('group_message')`
5. All members receive in real-time
6. Session history stored for future reference

---

## Testing the API

### Using cURL

```bash
# Get all courses
curl http://localhost:3000/api/courses

# Create enrollment
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"courseId":"course123"}'

# Submit quiz
curl -X POST http://localhost:3000/api/quizzes/quiz123/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q1","answer":"A"}]}'
```

### Using Postman

1. Create environment with `BASE_URL=http://localhost:3000/api`
2. Add auth headers from NextAuth cookies
3. Import API collection (TODO: create collection)

### Using JavaScript/TypeScript

```typescript
const response = await fetch('/api/courses', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();
```

---

## Error Handling

**Common Error Codes:**

| Code | Status | Meaning |
|------|--------|---------|
| UNAUTHORIZED | 401 | User not authenticated |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource doesn't exist |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_ERROR | 500 | Server error |

**Example Error:**
```json
{
  "success": false,
  "error": "User must be enrolled in this course",
  "code": "FORBIDDEN",
  "timestamp": "2026-03-28T10:30:00.000Z"
}
```

---

## Environment Variables

Required for backend operation:

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...

# AI Services
OPENAI_API_KEY=...
GEMINI_API_KEY=...
CLAUDE_API_KEY=...

# Other
NODE_ENV=development
```

---

## Database Schema Summary

**Key Tables:**
- `User`: 50+ fields including profile, stats
- `Course`: Title, description, category, lecturer
- `Content`: Learning materials, videos, documents
- `Quiz`: Assessment with questions and attempts
- `CourseEnrollment`: User progress in courses
- `Message`: Direct messaging between users
- `ChatHistory`: AI conversation storage
- `StudyGroup`: Group learning spaces
- `ForumPost`: Discussion threads
- `Notification`: User alerts
- Plus 10+ more supporting tables

---

## Development Workflow

### Adding a New Endpoint

1. **Update Prisma Schema** (`prisma/schema.prisma`)
   - Add model if needed
   - Add relationships

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name describe_change
   ```

3. **Create API Route** (`app/api/...`)
   - Follow existing patterns
   - Add authentication
   - Use error utilities

4. **Test Endpoint**
   ```bash
   npm run dev
   curl http://localhost:3000/api/...
   ```

5. **Update Documentation**
   - Add to `API_DOCUMENTATION.md`
   - Document request/response

6. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: Add new endpoint"
   git push
   ```

---

## Performance Considerations

1. **Database Queries**
   - Use `.select()` to limit fields
   - Use `.include()` for relations
   - Add pagination for large results

2. **Caching**
   - Course list (changes infrequently)
   - User badges (rarely changes)
   - Dashboard stats (cache for 5 min)

3. **Real-time Updates**
   - Use Socket.io for low-latency updates
   - Combine with REST for reliability

---

## Security Best Practices

1. **Authentication**
   - Always check `getServerSession()`
   - Validate user has authority

2. **Authorization**
   - Check user role before mutations
   - Verify user owns/can access resource

3. **Input Validation**
   - Validate all POST/PUT body data
   - Use type checking with TypeScript

4. **Database**
   - Use Prisma to prevent SQL injection
   - Never expose raw queries

---

## Troubleshooting

**Issue: Database connection fails**
```
Check: DATABASE_URL format, Supabase credentials, firewall
```

**Issue: NextAuth not working**
```
Check: NEXTAUTH_SECRET is set, NEXTAUTH_URL is correct
```

**Issue: AI chat returns error**
```
Check: API keys are valid, provider is accessible
```

**Issue: Socket.io not connecting**
```
Check: NEXTAUTH_URL is set, CORS origin is correct
```

---

## Future Enhancements

- [ ] File upload to cloud storage (S3/GCS)
- [ ] Advanced analytics & leaderboards
- [ ] Payment integration (Stripe)
- [ ] Live video classrooms
- [ ] Mobile app backend sync
- [ ] Rate limiting & API keys
- [ ] Detailed audit logs
- [ ] Advanced search with Elasticsearch

---

**Last Updated:** March 28, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
