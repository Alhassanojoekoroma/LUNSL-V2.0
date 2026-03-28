import type { Faculty, TokenPackage } from './types'

// Faculties and Programs
export const FACULTIES: Faculty[] = [
  {
    code: 'FICT',
    name: 'Faculty of Information & Communication Technology',
    programs: [
      { code: 'BIT', name: 'Bachelor of Information Technology' },
      { code: 'BBIT', name: 'Bachelor of Business Information Technology' },
      { code: 'BPC', name: 'Bachelor of Professional Communication' },
      { code: 'BCS', name: 'Bachelor of Computer Science' },
      { code: 'MIT', name: 'Master of Information Technology' },
      { code: 'DIT', name: 'Diploma in Information Technology' },
    ],
  },
  {
    code: 'FCMB',
    name: 'Faculty of Communication, Media & Broadcasting',
    programs: [
      { code: 'BMC', name: 'Bachelor of Mass Communication' },
      { code: 'BMMC', name: 'Bachelor of Multimedia Communication' },
      { code: 'BPR', name: 'Bachelor of Public Relations' },
      { code: 'BJOUR', name: 'Bachelor of Journalism' },
      { code: 'BFA', name: 'Bachelor of Film Arts' },
      { code: 'MCC', name: 'Master of Corporate Communication' },
    ],
  },
  {
    code: 'FBMG',
    name: 'Faculty of Business Management & Globalization',
    programs: [
      { code: 'BBA', name: 'Bachelor of Business Administration' },
      { code: 'BBF', name: 'Bachelor of Banking & Finance' },
      { code: 'BHM', name: 'Bachelor of Hospitality Management' },
      { code: 'BHRM', name: 'Bachelor of Human Resource Management' },
      { code: 'MBA', name: 'Master of Business Administration' },
      { code: 'BBAF', name: 'Bachelor of Business Accounting & Finance' },
    ],
  },
  {
    code: 'FABE',
    name: 'Faculty of Architecture & Built Environment',
    programs: [
      { code: 'BARCH', name: 'Bachelor of Architecture' },
      { code: 'BCIVL', name: 'Bachelor of Civil Engineering' },
      { code: 'BINT', name: 'Bachelor of Interior Architecture' },
      { code: 'BQSUR', name: 'Bachelor of Quantity Surveying' },
      { code: 'MURP', name: 'Master of Urban & Regional Planning' },
    ],
  },
  {
    code: 'FDI',
    name: 'Faculty of Design & Innovation',
    programs: [
      { code: 'BGRD', name: 'Bachelor of Graphic Design' },
      { code: 'BFASH', name: 'Bachelor of Fashion Design' },
      { code: 'BPROD', name: 'Bachelor of Product Design' },
      { code: 'BPHOT', name: 'Bachelor of Photography' },
    ],
  },
  {
    code: 'FCTH',
    name: 'Faculty of Culture, Tourism & Hospitality',
    programs: [
      { code: 'BTOUR', name: 'Bachelor of Tourism Management' },
      { code: 'BHGT', name: 'Bachelor of Hotel Management' },
      { code: 'BEVT', name: 'Bachelor of Event Management' },
      { code: 'BFNB', name: 'Bachelor of Food & Beverage Management' },
    ],
  },
]

// Semesters
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

// Student ID validation
export const STUDENT_ID_PREFIX = '90500'
export const STUDENT_ID_MIN_LENGTH = 9

// Content Types
export const CONTENT_TYPES = [
  { value: 'lecture_notes', label: 'Lecture Notes' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'timetable', label: 'Timetable' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'project', label: 'Project' },
  { value: 'lab', label: 'Lab Work' },
  { value: 'other', label: 'Other' },
] as const

// File Types
export const ALLOWED_FILE_TYPES = {
  pdf: { mime: 'application/pdf', extension: '.pdf', color: 'file-badge-pdf' },
  pptx: { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extension: '.pptx', color: 'file-badge-pptx' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: '.docx', color: 'file-badge-docx' },
  image: { mime: 'image/*', extension: '.jpg,.jpeg,.png', color: 'file-badge-image' },
} as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// AI Learning Tools
export const AI_LEARNING_TOOLS = [
  { id: 'study_guide', name: 'Study Guide', description: 'Comprehensive topic guide with key concepts and examples', icon: 'BookOpen' },
  { id: 'practice_quiz', name: 'Practice Quiz (MCQ)', description: '10 multiple choice questions with explanations', icon: 'HelpCircle' },
  { id: 'fill_blanks', name: 'Fill in the Blanks', description: '10 exercises with answers', icon: 'Edit' },
  { id: 'matching_quiz', name: 'Matching Quiz', description: 'Column A/B matching exercise with answer key', icon: 'Link' },
  { id: 'true_false', name: 'True/False Quiz', description: '12 true/false questions with explanations', icon: 'CheckCircle' },
  { id: 'concept_explainer', name: 'Concept Explainer', description: 'Structured 6-part explanation of a concept', icon: 'Lightbulb' },
  { id: 'study_plan', name: 'Study Plan', description: '2-3 week personalised study plan', icon: 'Calendar' },
  { id: 'audio_overview', name: 'Audio Overview', description: 'AI podcast script generation + TTS audio', icon: 'Headphones' },
  { id: 'exam_prep', name: 'Exam Prep', description: 'Exam-style questions, study tips, priority topics', icon: 'GraduationCap' },
  { id: 'note_summary', name: 'Note Summary', description: 'Structured bullet-point notes with bold key terms', icon: 'FileText' },
] as const

// Learning Levels
export const LEARNING_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Simple language, analogies, all terms explained' },
  { value: 'intermediate', label: 'Intermediate', description: 'Balanced technical accuracy with clarity' },
  { value: 'advanced', label: 'Advanced', description: 'Deep technical detail, precise terminology' },
] as const

// Token Packages
export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'pkg_10', tokens: 10, price_sle: 50000, price_usd: 2.50 },
  { id: 'pkg_25', tokens: 25, price_sle: 100000, price_usd: 5.00 },
  { id: 'pkg_50', tokens: 50, price_sle: 175000, price_usd: 8.75, popular: true },
  { id: 'pkg_100', tokens: 100, price_sle: 300000, price_usd: 15.00 },
]

// Free Tier Limits
export const FREE_QUERIES_PER_DAY = 20
export const SUSPENSION_HOURS = 7

// Referral Bonus
export const REFERRAL_BONUS_TOKENS = 5

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const

// Schedule Types
export const SCHEDULE_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'exam', label: 'Exam' },
  { value: 'other', label: 'Other' },
] as const

// Priority Colors
export const PRIORITY_COLORS = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
} as const

// Status Colors
export const STATUS_COLORS = {
  pending: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-400' },
  active: { bg: 'bg-green-500/10', text: 'text-green-400' },
  draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  archived: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
} as const

// Navigation Items
export const STUDENT_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/browse', label: 'Browse Content', icon: 'Search' },
  { href: '/ai-assistant', label: 'AI Study Assistant', icon: 'Bot' },
  { href: '/schedule', label: 'Schedule', icon: 'Calendar' },
  { href: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { href: '/messages', label: 'Messages', icon: 'MessageSquare' },
  { href: '/progress', label: 'My Progress', icon: 'TrendingUp' },
  { href: '/tokens', label: 'Purchase Tokens', icon: 'Coins' },
  { href: '/referrals', label: 'Referral Program', icon: 'Users' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
]

export const LECTURER_NAV_ITEMS = [
  { href: '/lecturer/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/lecturer/upload', label: 'Upload Content', icon: 'Upload' },
  { href: '/lecturer/content', label: 'Manage Content', icon: 'FolderOpen' },
  { href: '/lecturer/analytics', label: 'Analytics', icon: 'BarChart' },
  { href: '/messages', label: 'Messages', icon: 'MessageSquare' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
]

export const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/users', label: 'User Management', icon: 'Users' },
  { href: '/admin/content', label: 'Content Overview', icon: 'FileText' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'BarChart' },
  { href: '/admin/messages', label: 'Bulk Messages', icon: 'Send' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
]

// Content Type Icons
export const CONTENT_TYPE_ICONS = {
  lecture_notes: 'BookOpen',
  assignment: 'CheckSquare',
  timetable: 'Calendar',
  tutorial: 'Play',
  project: 'Briefcase',
  lab: 'Beaker',
  other: 'FileText',
} as const
