# LUSL Notepad - Limkokwing University Student Learning Platform

A modern, professional digital learning platform built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Features

### Core Features
- **Dark & Light Theme** - Seamless theme switching with next-themes
- **Role-Based Access** - Students, Lecturers, and Administrators
- **Course Materials** - Browse and download lecture notes, assignments, tutorials
- **AI Study Assistant** - 10 AI-powered learning tools
- **Task Management** - Create, organize, and track academic tasks
- **Schedule Management** - Organize classes and important dates
- **Real-time Messaging** - Communicate with peers and instructors
- **Progress Tracking** - Monitor quiz scores and learning goals
- **Token System** - Purchase AI credits via mobile money

### User Roles

#### Students
- Browse faculty-specific course materials
- Use AI Study Assistant with daily free queries
- Manage personal tasks and schedule
- Purchase AI tokens for additional queries
- Track quiz scores and learning progress
- Refer friends for bonus tokens

#### Lecturers
- Upload and manage course materials
- View content usage analytics
- Communicate with students
- Access faculty dashboard

#### Administrators
- Manage users and permissions
- Monitor platform usage
- Access comprehensive analytics
- Manage content and faculties

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lusl-notepad

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

Visit `http://localhost:3000` to see your app.

## 🏗️ Project Structure

```
lusl-notepad/
├── app/                          # Next.js app directory
│   ├── ai-assistant/            # AI Study Assistant pages
│   ├── browse/                  # Content browsing
│   ├── content/[id]/            # Content detail pages
│   ├── dashboard/               # Student dashboard
│   ├── lecturer/                # Lecturer portal
│   ├── setup/                   # User registration
│   ├── layout.tsx               # Root layout with theme provider
│   ├── globals.css              # Global styles and theme variables
│   └── page.tsx                 # Home page
│
├── components/
│   ├── layout/
│   │   ├── app-header.tsx       # Header with theme toggle
│   │   ├── app-sidebar.tsx      # Navigation sidebar
│   │   └── app-shell.tsx        # Main layout wrapper
│   ├── ui/                      # Shadcn/ui components
│   ├── theme-provider.tsx       # next-themes provider
│   └── theme-toggle.tsx         # Theme switcher component
│
├── lib/
│   ├── store.ts                 # Zustand stores (auth, tasks, etc.)
│   ├── types.ts                 # TypeScript type definitions
│   ├── constants.ts             # App constants and faculties
│   ├── mock-data.ts             # Mock data for development
│   └── utils.ts                 # Utility functions
│
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
├── styles/                       # Additional styles
├── next.config.mjs              # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── components.json              # Shadcn components config
```

## 🎨 Design System

### Color Palette

**Light Theme:**
- Background: `#ffffff`
- Foreground: `#0a0a0a`
- Primary: `#6c5ce7` (Purple)
- Secondary: `#f3f3f3`
- Muted: `#f1f5f9`
- Border: `#e2e8f0`

**Dark Theme:**
- Background: `#0a0a0a`
- Foreground: `#fafafa`
- Primary: `#6c5ce7` (Purple)
- Secondary: `#1a1a1a`
- Muted: `#171717`
- Border: `#262626`

### Semantic Colors
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Amber)
- **Danger:** `#ef4444` (Red)
- **Info:** `#3b82f6` (Blue)

### Typography
- **Display Font:** Plus Jakarta Sans
- **Body Font:** DM Sans
- **Monospace:** Geist Mono

## 📦 Dependencies

### Core
- `next@16.2.0` - React framework
- `react@19` - UI library
- `typescript` - Type safety

### UI & Styling
- `tailwindcss` - Utility CSS
- `shadcn/ui` - Component library
- `@radix-ui/*` - Accessible components
- `lucide-react` - Icons
- `next-themes` - Theme management

### State Management
- `zustand@4.5.2` - State management

### Utilities
- `date-fns` - Date manipulation
- `clsx` - Class name utility
- `sonner` - Toast notifications

## 🔐 Authentication Flow

1. User lands on `/setup` page
2. Selects role (student/lecturer/admin)
3. Enters personal details
   - Students: ID, Faculty, Semester, Program
   - Lecturers/Admins: Access code
4. Accepts terms and conditions
5. Zustand store saves to localStorage
6. Redirected to role-specific dashboard

## 💾 State Management (Zustand Stores)

- **AuthStore** - User authentication and profile
- **TasksStore** - User tasks and assignments
- **ScheduleStore** - Class schedule and events
- **MessagesStore** - Messages and notifications
- **TokenStore** - AI token balance
- **ProgressStore** - Quiz scores and learning goals
- **ContentStore** - Content filtering and management
- **AIChatStore** - AI assistant chat history

## 🎯 Content Types

- **Lecture Notes** - Course materials and resources
- **Assignments** - Homework and projects
- **Timetable** - Class schedules
- **Tutorial** - Step-by-step guides
- **Project** - Project specifications
- **Lab** - Lab sessions
- **Other** - Miscellaneous content

## 📋 AI Learning Tools (10 Tools)

1. Study Guides
2. Practice Quizzes
3. Concept Explanations
4. Study Plans
5. Topic Summary
6. Q&A Session
7. Essay Helper
8. Exam Prep
9. Flashcards
10. Audio Overview

## 🔄 Theme Toggle

The project includes a professional theme toggle component that:
- Allows users to switch between light, dark, and system themes
- Persists theme preference in localStorage
- Uses `next-themes` for seamless integration
- Provides smooth transitions between themes
- Includes animated icons for visual feedback

**Theme Toggle Location:** Top-right corner of the header (next to notifications)

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy with a single command
vercel

# Or connect your GitHub repo for automatic deployments
```

### Docker

```bash
# Build Docker image
docker build -t lusl-notepad .

# Run container
docker run -p 3000:3000 lusl-notepad
```

### Environment Variables

```env
# Add your environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Responsive Design

- **Mobile First** approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface
- Optimized navigation for all screen sizes

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast colors in both themes
- Focus indicators on interactive elements

## 🧪 Testing

```bash
# Run tests (when added)
pnpm test

# Watch mode
pnpm test:watch
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [next-themes](https://github.com/pacocoursey/next-themes)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Developed for Limkokwing University Sierra Leone

## 📧 Support

For support, email support@lusl.edu.sl or visit our help center.

---

**Current Status:** Production Ready with Light/Dark Theme Support ✅
