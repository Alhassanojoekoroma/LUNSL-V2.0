# LUSL Notepad - Setup & Development Guide

## Quick Start Guide

### Step 1: Install Dependencies

```bash
# Using pnpm (recommended for this project)
pnpm install

# Or using npm
npm install
```

### Step 2: Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Step 3: Initial Setup

1. Navigate to the home page
2. Click "Get Started"
3. Select your role:
   - **Student**: Enter Student ID (must start with 90500, minimum 9 digits)
   - **Lecturer**: Enter access code
   - **Admin**: Enter access code
4. Fill in personal details
5. Accept terms and conditions
6. You'll be redirected to your role-specific dashboard

## Theme Switching

The app includes full light/dark theme support:

1. **Theme Toggle Location**: Top-right of the header (next to notifications)
2. **Options Available**:
   - Light Mode
   - Dark Mode
   - System (follows OS settings)
3. **Persistence**: Your theme preference is saved to localStorage

### Testing Themes

To verify theme works correctly:
1. Toggle through all three options
2. Check that colors update smoothly
3. Verify text contrast is readable in both themes
4. Scroll page - scrollbar should update colors
5. Refresh page - theme preference should persist

## Project Features by Role

### 👨‍🎓 Student Access
- **Dashboard**: Overview of courses, tasks, schedule
- **Browse Materials**: Filter by faculty, semester, content type
- **Content Detail**: View materials with AI insights
- **AI Assistant**: 10 learning tools for study
- **Tasks**: Create and manage academic tasks
- **Schedule**: View class timetable
- **Messages**: Communicate with peers and lecturers
- **Progress**: Track quiz scores and learning goals
- **Tokens**: Purchase AI credits

### 👨‍🏫 Lecturer Access
- **Dashboard**: Course management overview
- **Upload Content**: Add materials for students
- **Content Management**: Edit and manage uploads
- **Student Analytics**: View content usage
- **Communication**: Message students
- **Grading**: Manage assignments and quizzes

### 👨‍💼 Administrator Access
- **Admin Dashboard**: Complete platform oversight
- **User Management**: Create/edit/delete users
- **Faculty Management**: Manage programs and departments
- **Analytics**: Platform usage statistics
- **Content Management**: Approve/reject materials
- **System Settings**: Configure platform

## Development Workflow

### Folder Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utilities, types, constants, stores
├── hooks/               # Custom React hooks
└── public/              # Static assets
```

### Creating New Components

Use Shadcn component library for consistency:

```bash
# Add a new component from shadcn
npx shadcn-ui@latest add button
```

Then import and use:

```tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <Button>Click me</Button>
}
```

### Adding New Pages

1. Create folder in `app/` directory
2. Add `page.tsx` file
3. Use `AppShell` component for consistent layout

```tsx
'use client'

import { AppShell } from '@/components/layout/app-shell'

export default function MyPage() {
  return (
    <AppShell title="My Page">
      {/* Your content */}
    </AppShell>
  )
}
```

### Using Theme Colors

CSS variables are automatically applied based on theme:

```tsx
// Using Tailwind classes (recommended)
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Muted text</p>
</div>

// Using CSS variables directly
<div style={{ color: 'var(--primary)' }}>
  Primary color
</div>
```

### State Management (Zustand)

```tsx
import { useAuthStore } from '@/lib/store'

export function MyComponent() {
  const { user, setUser, logout } = useAuthStore()
  
  return (
    <div>
      {user && <p>Hello, {user.full_name}</p>}
    </div>
  )
}
```

## Styling Guide

### Tailwind CSS + CSS Variables

This project combines Tailwind with custom CSS variables for theme support.

**Color Classes Available:**
- `bg-background` / `text-background`
- `bg-foreground` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-accent` / `text-accent-foreground`
- `border-border`
- `ring-primary`

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## Testing the Application

### Test Credentials

**Student:**
- ID: 90500123456
- Email: student@lusl.edu.sl
- Faculty: FICT
- Semester: 1

**Lecturer:**
- Email: lecturer@lusl.edu.sl
- Access Code: LECTURER2024

**Admin:**
- Email: admin@lusl.edu.sl
- Access Code: ADMIN2024

### Test Flows

1. **Complete User Registration**
   - Test all three roles
   - Verify profile appears in dashboard
   - Check localStorage keys

2. **Theme Switching**
   - Switch between themes
   - Verify all components update
   - Refresh to check persistence

3. **Content Browsing**
   - Test search functionality
   - Filter by multiple criteria
   - Check grid/list view toggle

4. **Navigation**
   - Test mobile sidebar toggle
   - Verify all navigation links work
   - Check breadcrumbs

## Troubleshooting

### Port Already in Use
```bash
# Use different port
pnpm dev -- -p 3001
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

### Theme Not Changing
1. Check browser console for errors
2. Verify `next-themes` is in dependencies
3. Check that ThemeProvider wraps app in layout
4. Clear browser cache and localStorage

## Performance Optimization

The project includes several optimizations:

- ✅ Dynamic imports for code splitting
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)
- ✅ CSS variables for efficient theming
- ✅ Zustand for minimal re-renders
- ✅ Server components where possible

## Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Analyze bundle
pnpm build -- --analyze
```

## Environment Variables

Create `.env.local`:

```env
# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Endpoints (when backend is ready)
NEXT_PUBLIC_API_URL=https://api.lusl.edu.sl
NEXT_PUBLIC_STORAGE_BUCKET=lusl-content

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_TOKENS=true
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "Add amazing feature"

# Push to remote
git push origin feature/amazing-feature

# Create Pull Request on GitHub
```

## Debugging

### Enable Debug Logging

```tsx
// In components
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info', data)
}
```

### React DevTools

Install [React DevTools Browser Extension](https://react-devtools-tutorial.vercel.app/)

### Next.js Debug Mode

```bash
# Run with debug logging
DEBUG=* pnpm dev
```

## Common Tasks

### Add a New Faculty
Edit `lib/constants.ts`:
```ts
export const FACULTIES: Faculty[] = [
  // Existing faculties...
  {
    code: 'NEWFAC',
    name: 'New Faculty Name',
    programs: [
      { code: 'PROG1', name: 'Program 1' },
    ],
  },
]
```

### Add a New Navigation Item
Edit `lib/constants.ts`:
```ts
export const STUDENT_NAV_ITEMS = [
  // Existing items...
  {
    label: 'New Feature',
    href: '/new-feature',
    icon: 'Icon',
  },
]
```

### Change Primary Color
Edit `app/globals.css`:
```css
:root {
  --primary-500: #YOUR_COLOR;
  /* Update all primary shades */
}
```

## Support & Resources

- **Documentation**: See README.md
- **Shadcn UI Docs**: https://ui.shadcn.com
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/

## Next Steps

1. ✅ Understand the project structure
2. ✅ Test user registration flows
3. ✅ Verify theme switching works
4. ✅ Explore each role's features
5. 🔲 Connect to backend API
6. 🔲 Implement AI features
7. 🔲 Add authentication (Supabase/Auth0)
8. 🔲 Deploy to production

---

**Happy coding! 🚀**
