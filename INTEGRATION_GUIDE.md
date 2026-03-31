# Frontend-Backend Integration Guide

## Overview
This guide covers the integration of the existing frontend with the newly created backend API and explains how to use the API client layer to replace mock data.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Pages                   │
│          (app/dashboard, app/browse, etc)           │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Uses
                 ▼
        ┌────────────────────┐
        │   Zustand Stores   │
        │  (lib/store.ts)    │
        └────────┬───────────┘
                 │
                 │ Uses
                 ▼
    ┌────────────────────────────────┐
    │    API Client Layer            │
    │  (lib/api-client.ts)           │
    │                                │
    │ - userAPI (profile, auth)      │
    │ - courseAPI (courses, content) │
    │ - quizAPI (quizzes, submit)    │
    │ - aiAPI (chat)                 │
    │ - and 9 more modules           │
    └────────────┬────────────────────┘
                 │
                 │ HTTP + Axios
                 ▼
    ┌────────────────────────────────┐
    │    Backend API                 │
    │  (http://localhost:3000/api)   │
    │                                │
    │ - 20+ endpoints                │
    │ - PostgreSQL database          │
    │ - NextAuth authentication      │
    └────────────────────────────────┘
```

## Quick Start

### 1. Start the Backend
```bash
cd backend
npm run dev
# Backend starts on http://localhost:3000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:3001
```

### 3. Environment Variables
The `.env.local` file is configured with:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret
```

## Using the API Client

### Import in Components
```typescript
import { courseAPI, quizAPI, userAPI } from '@/lib/api-client'

// Use directly in async functions
const courses = await courseAPI.getCourses(1, 20)
```

### Using with Zustand Stores
```typescript
import { useAuthStore } from '@/lib/store'

export default function MyComponent() {
  const { user, isLoading, loadUser } = useAuthStore()

  useEffect(() => {
    // Load user profile from backend
    loadUser()
  }, [])

  if (isLoading) return <Spinner />
  if (!user) return <LoginPrompt />

  return <div>Welcome, {user.full_name}!</div>
}
```

## Available API Modules

### userAPI
```typescript
await userAPI.getProfile()           // Get current user
await userAPI.updateProfile(data)    // Update user info
await userAPI.uploadAvatar(file)     // Upload profile picture
```

### courseAPI
```typescript
await courseAPI.getCourses(page, limit, filters)  // Get courses
await courseAPI.getCourseById(id)                  // Get single course
await courseAPI.createCourse(data)                 // Create (lecturer only)
await courseAPI.enrollCourse(courseId)            // Enroll in course
```

### quizAPI
```typescript
await quizAPI.getQuizzes()           // Get all quizzes
await quizAPI.getQuizById(id)        // Get quiz details
await quizAPI.submitQuiz(id, answers) // Submit quiz answers
await quizAPI.getScore(quizId)       // Get user's score
```

### aiAPI
```typescript
await aiAPI.chat(message, provider)  // Send message to AI
await aiAPI.getHistory()             // Get chat history
await aiAPI.clearHistory()           // Clear chat
```

### notificationAPI
```typescript
await notificationAPI.getNotifications()        // Get notifications
await notificationAPI.markAsRead(id)            // Mark as read
await notificationAPI.deleteNotification(id)    // Delete
```

### And more...
- `enrollmentAPI` - Course enrollment management
- `forumAPI` - Discussion forums
- `studyGroupAPI` - Study groups
- `notesAPI` - User notes
- `badgesAPI` - Achievements
- `progressAPI` - Learning progress
- `tokensAPI` - Token balance
- `dashboardAPI` - Role-based dashboards

## Error Handling

### In Components
```typescript
import { useToast } from '@/components/ui/use-toast'
import { getErrorMessage } from '@/lib/api-utils'

export default function MyComponent() {
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await courseAPI.getCourses()
      // Use data...
    } catch (error) {
      const message = getErrorMessage(error)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    }
  }
}
```

### Retry Logic
```typescript
import { retryWithBackoff } from '@/lib/api-utils'

const courses = await retryWithBackoff(
  () => courseAPI.getCourses(),
  3,  // max retries
  1000 // initial delay ms
)
```

## Common Integration Patterns

### Pattern 1: Load Data on Component Mount
```typescript
'use client'

import { useEffect, useState } from 'react'
import { courseAPI } from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await courseAPI.getCourses(1, 20)
        setCourses(data)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  if (isLoading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
```

### Pattern 2: Use Store with Effects
```typescript
import { useAuthStore, useTasksStore } from '@/lib/store'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { tasks, isLoading, loadTasks } = useTasksStore()

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  // Component JSX...
}
```

### Pattern 3: Form Submission
```typescript
import { courseAPI } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

export default function EnrollForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (courseId: string) => {
    try {
      setIsLoading(true)
      await courseAPI.enrollCourse(courseId)
      toast({
        title: 'Success',
        description: 'Enrolled successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return <button onClick={() => onSubmit(id)}>Enroll</button>
}
```

## Socket.io Integration

### Connecting to Real-Time Events
```typescript
import { initSocket, onMessage, onNotification } from '@/lib/socket-client'

useEffect(() => {
  // Initialize socket connection
  initSocket()

  // Listen for new messages
  const unsubscribe = onMessage((message) => {
    console.log('New message:', message)
    // Update UI
  })

  return () => unsubscribe()
}, [])
```

### Sending Messages
```typescript
import { sendMessage } from '@/lib/socket-client'

const handleSendMessage = (content: string) => {
  sendMessage({
    senderId: user.id,
    recipientId: selectedUser.id,
    content,
  })
}
```

## Testing the Integration

### 1. Check Backend is Running
```bash
curl http://localhost:3000/api/health
# Should return 200 OK
```

### 2. Test API Client
Open browser console:
```typescript
import { courseAPI } from '@/lib/api-client'
courseAPI.getCourses().then(console.log)
```

### 3. Test Store Methods
```typescript
import { useAuthStore } from '@/lib/store'
const store = useAuthStore.getState()
store.loadUser().then(() => console.log(store.getState().user))
```

## Remaining Integration Tasks

### Pages to Update
- [ ] `app/dashboard/page.tsx` - Use courseAPI + TasksStore
- [ ] `app/browse/page.tsx` - Use courseAPI with filters
- [ ] `app/content/[id]/page.tsx` - Use courseAPI.getCourseById
- [ ] `app/quizzes/page.tsx` - Use quizAPI
- [ ] `app/messages/page.tsx` - Use Socket.io + messagesAPI
- [ ] `app/ai-assistant/page.tsx` - Use aiAPI
- [ ] `app/progress/page.tsx` - Use progressAPI
- [ ] `app/tasks/page.tsx` - Use tasksAPI
- [ ] `app/schedule/page.tsx` - Use scheduleAPI
- [ ] Student/Lecturer/Admin dashboard pages

### Features to Add
- [ ] Loading skeletons for all pages
- [ ] Error boundaries for crash prevention
- [ ] Toast notifications for errors
- [ ] Retry buttons on error states
- [ ] Empty states when no data
- [ ] Pagination where applicable
- [ ] Search and filtering on pages
- [ ] Real-time updates via Socket.io

## Troubleshooting

### "Cannot connect to server"
- Check backend is running: `npm run dev` in backend folder
- Check API URL in `.env.local`: `NEXT_PUBLIC_API_URL`
- Check CORS settings in backend
- Check firewall/network access

### "Unauthorized" Errors
- Ensure NextAuth is configured correctly
- Check authentication cookies in DevTools
- Verify OAuth providers are setup
- Check `NEXTAUTH_SECRET` environment variable

### "Type errors with module_id"
- Already fixed in v1.1 (Content interface updated)
- Run `npm run lint` to check for remaining issues
- Update imports if needed

### Store not loading data
- Check if `loadUser()` was called
- Check network tab in DevTools for API calls
- Verify API responses match expected shape
- Check console for errors

## Performance Tips

1. **Use SWR for Data Fetching**
   - Already configured in project
   - Provides caching and revalidation

2. **Implement Pagination**
   - API supports page/limit parameters
   - Reduce payload size for large datasets

3. **Error Boundaries**
   - Wrap pages with error boundaries
   - Prevent full app crashes

4. **Code Splitting**
   - Use dynamic imports for large components
   - Reduce initial bundle size

5. **Caching Strategy**
   - Store auth data in localStorage
   - Cache course list for session
   - Revalidate on focus

## Security Notes

- ✅ API uses HTTPS in production
- ✅ Authentication via NextAuth + JWT
- ✅ CORS configured for frontend origin
- ✅ Rate limiting on backend
- ✅ Input validation on all endpoints
- ✅ SQL injection protection via Prisma ORM

## Next Steps

1. Start with one page (e.g., Dashboard)
2. Replace mock data with API calls
3. Add loading states and error handling
4. Test thoroughly before moving to next page
5. Use this guide as reference for patterns
6. Commit changes incrementally

---

**Last Updated**: March 28, 2026
**Status**: Foundation Complete, Integration In Progress
**Coverage**: Backend API ✅, Frontend Pages 🔄, Testing ❌
