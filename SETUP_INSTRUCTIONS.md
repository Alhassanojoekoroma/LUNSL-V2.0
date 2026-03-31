# 🔧 QUICK START - Installation & Setup Guide

## 📦 Missing Dependencies

Install the missing package:

```bash
pnpm add @next-auth/prisma-adapter
# OR
npm install @next-auth/prisma-adapter
```

## ⚙️ Environment Setup

### 1. Create `.env.local` file in the root directory:

```env
# ============================================================
# DATABASE
# ============================================================
DATABASE_URL="postgresql://user:password@localhost:5432/lusl_notepad"

# ============================================================
# NEXTAUTH (Authentication)
# ============================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# ============================================================
# OAUTH PROVIDERS (Optional but recommended)
# ============================================================

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# Azure AD (Microsoft)
AZURE_AD_CLIENT_ID=your_azure_client_id
AZURE_AD_CLIENT_SECRET=your_azure_client_secret
AZURE_AD_TENANT_ID=your_azure_tenant_id

# ============================================================
# EMAIL PROVIDER (Magic Link Auth)
# ============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@luslnotepad.com

# ============================================================
# AI SERVICES
# ============================================================

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Google Gemini
GOOGLE_GENERATIVE_AI_KEY=...
GEMINI_MODEL=gemini-pro

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-opus-20240229

# Preferred AI Provider (one of: openai, gemini, claude)
PREFERRED_AI_PROVIDER=openai

# ============================================================
# PUBLIC API URL
# ============================================================
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ============================================================
# DEBUG
# ============================================================
DEBUG=false
```

## 🚀 Getting Started

### 1. Install Dependencies:
```bash
pnpm install
# OR
npm install
```

### 2. Setup Database:
```bash
pnpm prisma migrate dev --name init
# OR
npx prisma migrate dev --name init
```

### 3. Generate Prisma Client:
```bash
pnpm prisma generate
# OR
npx prisma generate
```

### 4. Start Development Server:
```bash
pnpm dev
# OR
npm run dev
```

Visit `http://localhost:3000`

---

## 🔐 Authentication Methods

### Currently Available:
1. **Google Sign-In** ✅
2. **GitHub Sign-In** ✅
3. **Azure AD Sign-In** ✅
4. **Email Magic Link** ✅

### Currently Disabled (by design):
- **Email/Password Credentials** - Database schema doesn't support password storage
  - To enable: Add `password String?` field to User model in `prisma/schema.prisma`

---

## 📝 Important Notes

### NextAuth Setup
- Session strategy: **JWT** (more secure for API-based apps)
- Session max age: **30 days**
- Email link expiry: **24 hours**
- CORS enabled for Prisma operations

### Socket.IO
- Real-time messaging working with proper error handling
- Notification system fixed and production-ready
- All event handlers have error recovery

### AI Services
- All 3 providers (OpenAI, Gemini, Claude) have error handling
- Fallback mechanism: tries next provider if one fails
- Token counting accurate for all providers

---

## ✅ What's Fixed

✓ Socket.IO notification schema mismatch  
✓ NextAuth session type extensions  
✓ Disabled broken credentials provider  
✓ AI service error handling  
✓ Database schema consistency  
✓ All TypeScript type errors (except missing npm package)  

---

## 📚 Project Structure

```
lib/
  ├── auth.ts                    # NextAuth configuration
  ├── next-auth.d.ts            # Type extensions (NEW)
  ├── ai-service.ts             # AI service implementations
  ├── socket-io.ts              # WebSocket real-time features
  ├── api-client.ts             # API client with auth
  ├── store.ts                  # Zustand state management
  └── prisma.ts                 # Database client
  
app/api/
  ├── auth/[...nextauth]/        # NextAuth routes
  ├── users/                     # User management
  ├── courses/                   # Course management
  ├── enrollments/              # Enrollment APIs
  ├── quizzes/                  # Quiz submission
  ├── notifications/            # Notification system
  └── dashboard/                # Dashboard data
```

---

## 🐛 Known Issues & Solutions

### Issue: "Cannot find module '@next-auth/prisma-adapter'"
**Solution**: `pnpm add @next-auth/prisma-adapter`

### Issue: Database connection fails
**Solution**: Check `DATABASE_URL` in `.env.local` and ensure PostgreSQL is running

### Issue: Email authentication not working
**Solution**: Ensure SMTP credentials are correct and less secure apps are enabled (Gmail)

### Issue: OAuth sign-up fails
**Solution**: Verify OAuth app credentials match the domain/callback URLs

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Setup environment variables
3. ✅ Run migrations
4. ✅ Start development server
5. Test authentication flows
6. Configure AI providers
7. Deploy to production

