// User Types
export type UserRole = 'student' | 'lecturer' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  user_type: UserRole
  faculty?: string
  semester?: number
  program?: string
  student_id?: string
  avatar_url?: string
  terms_accepted: boolean
  referral_code: string
  free_queries_suspended_until?: string
  created_at: string
}

// Faculty and Program Types
export interface Faculty {
  code: string
  name: string
  programs: Program[]
}

export interface Program {
  code: string
  name: string
}

// Content Types
export type ContentType = 'lecture_notes' | 'assignment' | 'timetable' | 'tutorial' | 'project' | 'lab' | 'other'
export type FileType = 'pdf' | 'pptx' | 'docx' | 'image'
export type ContentStatus = 'active' | 'draft' | 'archived'

export interface Content {
  id: string
  title: string
  description?: string
  file_url: string
  file_type: FileType
  faculty: string
  semester: number
  program: string
  module: string
  module_id: string // Now required - maps to course ID
  module_code?: string
  content_type: ContentType
  lecturer_name: string
  lecturer_id: string
  view_count: number
  download_count: number
  is_active: boolean
  status: ContentStatus
  tutorial_link?: string
  created_at: string
  updated_at: string
}

export interface ContentAccess {
  id: string
  user_id: string
  content_id: string
  access_type: 'view' | 'download'
  created_at: string
}

// Task Types
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  deadline?: string
  priority: TaskPriority
  status: TaskStatus
  tags: string[]
  collaborators: string[]
  created_at: string
  updated_at: string
}

export interface TaskInvitation {
  id: string
  task_id: string
  inviter_id: string
  invitee_email: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

// Schedule Types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type ScheduleType = 'lecture' | 'lab' | 'tutorial' | 'exam' | 'other'

export interface ScheduleEntry {
  id: string
  user_id: string
  day: DayOfWeek
  start_time: string
  end_time: string
  subject: string
  location?: string
  type: ScheduleType
  created_at: string
}

// Message Types
export interface Message {
  id: string
  sender_id: string
  sender_name: string
  recipient_id: string
  recipient_email: string
  subject: string
  body: string
  is_read: boolean
  created_at: string
}

// AI Types
export type AIQueryType = 'chat' | 'study_guide' | 'practice_quiz' | 'fill_blanks' | 'matching_quiz' | 'true_false' | 'concept_explainer' | 'study_plan' | 'audio_overview' | 'exam_prep' | 'note_summary'
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced'
export type ConversationStyle = 'default' | 'learning_guide' | 'custom'
export type ResponseLength = 'default' | 'shorter' | 'longer'

export interface AIInteraction {
  id: string
  user_id: string
  query: string
  response: string
  source_content_ids: string[]
  query_type: AIQueryType
  satisfaction_rating?: number
  response_time?: number
  created_at: string
}

export interface AIConfig {
  learningLevel: LearningLevel
  conversationStyle: ConversationStyle
  responseLength: ResponseLength
  customInstructions?: string
}

// Token Types
export interface TokenBalance {
  id: string
  user_id: string
  available: number
  used: number
  total: number
  bonus: number
}

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'bonus' | 'referral'
  payment_method?: string
  payment_status?: string
  order_number?: string
  created_at: string
}

export interface TokenPackage {
  id: string
  tokens: number
  price_sle: number
  price_usd: number
  popular?: boolean
}

// Referral Types
export interface Referral {
  id: string
  referrer_id: string
  referee_id: string
  referee_email: string
  status: 'pending' | 'completed'
  tokens_awarded: number
  created_at: string
}

// Progress Types
export interface QuizScore {
  id: string
  user_id: string
  module: string
  quiz_type: AIQueryType
  score: number
  total_questions: number
  percentage: number
  created_at: string
}

export type GoalStatus = 'active' | 'completed' | 'paused'

export interface LearningGoal {
  id: string
  user_id: string
  title: string
  description?: string
  target_date?: string
  status: GoalStatus
  progress: number
  created_at: string
  updated_at: string
}

// Content Rating
export interface ContentRating {
  id: string
  user_id: string
  content_id: string
  rating: number
  feedback?: string
  created_at: string
}

// Analytics Types
export interface LecturerAnalytics {
  total_content: number
  total_views: number
  total_downloads: number
  most_viewed: Content[]
  recent_downloads: ContentAccess[]
}

export interface AdminAnalytics {
  total_users: number
  total_students: number
  total_lecturers: number
  total_admins: number
  total_content: number
  total_ai_interactions: number
  recent_users: User[]
  recent_ai_interactions: AIInteraction[]
}
