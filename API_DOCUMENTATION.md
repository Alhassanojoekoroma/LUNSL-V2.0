# Backend API Documentation

## Authentication

All endpoints require an active session with NextAuth. OAuth providers supported:
- Google
- GitHub
- Azure AD
- Email (magic links)

### Base URL
```
http://localhost:3000/api
```

---

## Endpoints

### Users

#### Get Current User Profile
```
GET /users/me
Response: User profile with enrollments, badges, certificates
```

#### Update User Profile
```
PUT /users/me
Body: { bio, preferences, personalInfo... }
```

#### Delete User Account
```
DELETE /users/me
Soft deletes the user account
```

---

### Courses

#### List Courses
```
GET /courses
Query: ?page=1&limit=20&category=id&search=term
Response: Paginated list of published courses
```

#### Create Course (Lecturer/Admin only)
```
POST /courses
Body: {
  title: string,
  description: string,
  category: string,
  instructor: string,
  thumbnail: string
}
Response: Created course object
```

#### Get Course Content
```
GET /courses/{courseId}/content
Response: List of content items in sequence order
```

#### Upload Course Content (Lecturer/Admin)
```
POST /courses/{courseId}/content
Body: {
  title: string,
  description: string,
  type: "VIDEO|PDF|DOCUMENT|QUIZ|ASSIGNMENT|RESOURCE",
  contentUrl: string,
  duration: number (seconds),
  sequenceNumber: number
}
Response: Created content object
```

#### Get Course Forum
```
GET /courses/{courseId}/forum?page=1&limit=20
Response: Paginated forum posts
```

#### Create Forum Post
```
POST /courses/{courseId}/forum
Body: { title: string, content: string }
Response: Created post
```

#### Get Forum Post Comments
```
GET /courses/{courseId}/forum/{postId}/comments
Response: List of comments
```

#### Create Forum Comment
```
POST /courses/{courseId}/forum/{postId}/comments
Body: { content: string }
Response: Created comment
```

---

### Enrollments

#### Get User Enrollments
```
GET /enrollments
Response: List of user's course enrollments with progress
```

#### Enroll in Course
```
POST /enrollments
Body: { courseId: string }
Response: Created enrollment, sends notification
```

---

### Quizzes

#### Submit Quiz
```
POST /quizzes/{quizId}/submit
Body: {
  answers: [
    { questionId: string, answer: string }
  ]
}
Response: {
  score: number,
  maxScore: number,
  passing: boolean,
  feedback: string,
  tokensEarned: number
}
```

---

### AI Chat

#### Get Chat History
```
GET /ai/chat
Response: List of chat messages in conversation
```

#### Send Message to AI
```
POST /ai/chat
Body: {
  message: string,
  systemPrompt: "TUTOR|CODE_ASSISTANT|CONTENT_CREATOR|QUIZ_GENERATOR"
}
Response: {
  message: ChatMessage,
  tokensUsed: number,
  provider: "openai|gemini|claude"
}
```

---

### Notifications

#### Get User Notifications
```
GET /notifications
Response: List of notifications (recent 50)
```

#### Send Notification (Admin only)
```
POST /notifications
Body: {
  userId: string,
  message: string,
  type: "COURSE_UPDATE|NEW_MESSAGE|QUIZ_RESULT|ACHIEVEMENT|ENROLLMENT|SYSTEM",
  relatedId: string (optional)
}
Response: Created notification
```

#### Mark Notification as Read
```
PATCH /notifications
Body: { notificationId: string, read: boolean }
Response: Updated notification
```

---

### Study Groups

#### List User's Study Groups
```
GET /study-groups?page=1&limit=20&courseId=id (optional)
Response: Paginated list of joined groups
```

#### Create Study Group
```
POST /study-groups
Body: {
  name: string,
  description: string,
  courseId: string,
  maxMembers: number (default 10)
}
Response: Created group
```

#### Get Group Details
```
GET /study-groups/{groupId}
Response: Group info with members and metadata
```

#### Join/Leave Study Group
```
POST /study-groups/{groupId}
Body: { action: "join" | "leave" }
Response: Updated group
```

---

### Notes

#### Get User Notes
```
GET /notes?page=1&limit=20&contentId=id (optional)
Response: Paginated notes
```

#### Create Note
```
POST /notes
Body: {
  content: string,
  contentId: string (optional),
  tag: string (optional)
}
Response: Created note
```

---

### Badges & Achievements

#### Get User Badges
```
GET /badges?userId=id (optional, defaults to self)
Response: List of earned badges
```

#### Award Badge (Admin only)
```
POST /badges
Body: {
  userId: string,
  badgeName: string,
  description: string,
  icon: string (emoji)
}
Response: Awarded badge
```

---

### Progress & Certificates

#### Get User Progress
```
GET /progress?userId=id (optional, defaults to self)
Response: {
  certificates: Certificate[],
  progress: ProgressRecord[],
  enrollments: CourseEnrollment[],
  stats: {
    totalCourses: number,
    completedCourses: number,
    totalContentCompleted: number,
    averageProgressPercentage: number
  }
}
```

#### Complete Course (Award Certificate)
```
POST /progress
Body: {
  userId: string,
  courseId: string,
  action: "complete_course"
}
Response: Created certificate
```

#### Update Course Progress
```
POST /progress
Body: {
  userId: string,
  courseId: string,
  action: "update_progress",
  progressPercentage: number,
  status: "ACTIVE|COMPLETED|DROPPED|SUSPENDED"
}
Response: Updated enrollment
```

#### Mark Content as Completed
```
POST /progress
Body: {
  userId: string,
  courseId: string,
  action: "mark_content",
  contentId: string
}
Response: Created progress record
```

---

### Tokens & Rewards

#### Get Token Balance
```
GET /tokens
Response: {
  userId: string,
  balance: number,
  totalTransactions: number,
  recentTransactions: TokenTransaction[]
}
```

#### Award Tokens (Lecturer/Admin)
```
POST /tokens
Body: {
  userId: string,
  amount: number,
  type: "QUIZ_COMPLETION|ASSIGNMENT_SUBMISSION|PARTICIPATION|REWARD|REFUND",
  description: string,
  relatedId: string (optional)
}
Response: {
  transaction: TokenTransaction,
  newBalance: number
}
```

---

### Dashboard

#### Get Personalized Dashboard
```
GET /dashboard
Response varies by user role:

Student: {
  enrolledCourses: number,
  completedCourses: number,
  averageProgress: number,
  badges: number,
  tokenBalance: number,
  completedContent: number,
  recentEnrollments: CourseEnrollment[],
  recentCertificates: Certificate[]
}

Lecturer: {
  totalCourses: number,
  totalStudents: number,
  totalContent: number,
  totalQuizzes: number,
  forumPostsPending: number,
  courses: Course[]
}

Admin: {
  totalUsers: number,
  totalCourses: number,
  totalEnrollments: number,
  totalQuizzes: number,
  roleDistribution: { [role]: count },
  topCourses: Course[]
}
```

---

## WebSocket Events (Socket.io)

### Connection
```javascript
socket.emit('join_user', userId);
```

### Real-time Messaging
```javascript
socket.emit('send_message', {
  senderId: string,
  recipientId: string,
  content: string
});

socket.on('receive_message', (message) => {});
socket.on('user_typing', (data) => {});
```

### Quiz Events
```javascript
socket.on('quiz_completed', (data) => {});
```

### Notifications
```javascript
socket.emit('send_notification', {
  userId: string,
  message: string,
  type: string,
  relatedId: string
});

socket.on('notification_received', (notification) => {});
```

### Course Updates
```javascript
socket.emit('join_course', courseId);
socket.emit('course_update', { courseId, update });
socket.on('course_updated', (update) => {});
```

### Study Group Messaging
```javascript
socket.emit('join_study_group', groupId);
socket.emit('group_message', {
  groupId: string,
  userId: string,
  message: string
});

socket.on('group_message_received', (message) => {});
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Request conflicts with existing data |
| INTERNAL_ERROR | 500 | Server error |

---

## Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-03-28T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-28T10:30:00.000Z"
}
```

---

## Rate Limiting

No rate limiting currently implemented. Consider adding:
- 100 requests per minute per user for general endpoints
- 10 requests per minute for resource creation
- 50 requests per minute for read operations

---

## Testing

To test endpoints locally:

```bash
# Start dev server
npm run dev

# Test endpoint with curl
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer {session_token}"
```

---

## TODO: Implementation Status

✅ Completed:
- User authentication & profiles
- Course management
- Quiz system with auto-grading
- AI chat with 3 providers
- Enrollments with progress tracking
- Forums with posts & comments
- Study groups
- Notifications
- Notes
- Badges & certificates
- Token rewards
- Dashboard analytics
- Socket.io real-time events

🔄 In Progress:
- File upload integration
- Advanced analytics
- Leaderboards
- Payment integration

---

Last Updated: March 28, 2026
Version: 1.0.0
