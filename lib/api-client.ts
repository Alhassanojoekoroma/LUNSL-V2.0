import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests (required for NextAuth)
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user) {
    // Auth is handled via cookies with NextAuth
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: Record<string, any>) => {
    const response = await apiClient.put('/users/me', data);
    return response.data.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/users/me');
    return response.data;
  },
};

// Course API
export const courseAPI = {
  getCourses: async (page = 1, limit = 20, filters?: Record<string, any>) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...filters,
    });
    const response = await apiClient.get(`/courses?${query}`);
    return response.data.data;
  },

  getCourseById: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data.data;
  },

  createCourse: async (data: Record<string, any>) => {
    const response = await apiClient.post('/courses', data);
    return response.data.data;
  },

  getContent: async (courseId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/content`);
    return response.data.data;
  },

  uploadContent: async (courseId: string, data: FormData) => {
    const response = await apiClient.post(`/courses/${courseId}/content`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

// Enrollment API
export const enrollmentAPI = {
  getEnrollments: async () => {
    const response = await apiClient.get('/enrollments');
    return response.data.data;
  },

  enrollCourse: async (courseId: string) => {
    const response = await apiClient.post('/enrollments', { courseId });
    return response.data.data;
  },

  updateProgress: async (courseId: string, progressPercentage: number) => {
    const response = await apiClient.post('/progress', {
      courseId,
      action: 'update_progress',
      progressPercentage,
    });
    return response.data.data;
  },
};

// Quiz API
export const quizAPI = {
  submitQuiz: async (quizId: string, answers: any[]) => {
    const response = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data.data;
  },
};

// AI Chat API
export const aiAPI = {
  sendMessage: async (message: string, systemPrompt: string = 'TUTOR') => {
    const response = await apiClient.post('/ai/chat', { message, systemPrompt });
    return response.data.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/ai/chat');
    return response.data.data;
  },
};

// Forum API
export const forumAPI = {
  getPosts: async (courseId: string, page = 1) => {
    const response = await apiClient.get(`/courses/${courseId}/forum?page=${page}`);
    return response.data.data;
  },

  createPost: async (courseId: string, data: Record<string, any>) => {
    const response = await apiClient.post(`/courses/${courseId}/forum`, data);
    return response.data.data;
  },

  getComments: async (courseId: string, postId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/forum/${postId}/comments`);
    return response.data.data;
  },

  createComment: async (courseId: string, postId: string, data: { content: string }) => {
    const response = await apiClient.post(`/courses/${courseId}/forum/${postId}/comments`, data);
    return response.data.data;
  },
};

// Notifications API
export const notificationAPI = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch('/notifications', {
      notificationId,
      read: true,
    });
    return response.data.data;
  },
};

// Study Groups API
export const studyGroupAPI = {
  getGroups: async (page = 1, courseId?: string) => {
    const query = new URLSearchParams({ page: String(page) });
    if (courseId) query.append('courseId', courseId);
    const response = await apiClient.get(`/study-groups?${query}`);
    return response.data.data;
  },

  createGroup: async (data: Record<string, any>) => {
    const response = await apiClient.post('/study-groups', data);
    return response.data.data;
  },

  getGroup: async (groupId: string) => {
    const response = await apiClient.get(`/study-groups/${groupId}`);
    return response.data.data;
  },

  joinGroup: async (groupId: string) => {
    const response = await apiClient.post(`/study-groups/${groupId}`, { action: 'join' });
    return response.data.data;
  },

  leaveGroup: async (groupId: string) => {
    const response = await apiClient.post(`/study-groups/${groupId}`, { action: 'leave' });
    return response.data.data;
  },
};

// Notes API
export const notesAPI = {
  getNotes: async (page = 1, contentId?: string) => {
    const query = new URLSearchParams({ page: String(page) });
    if (contentId) query.append('contentId', contentId);
    const response = await apiClient.get(`/notes?${query}`);
    return response.data.data;
  },

  createNote: async (data: Record<string, any>) => {
    const response = await apiClient.post('/notes', data);
    return response.data.data;
  },
};

// Badges API
export const badgesAPI = {
  getBadges: async (userId?: string) => {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    const response = await apiClient.get(`/badges?${query}`);
    return response.data.data;
  },
};

// Progress API
export const progressAPI = {
  getProgress: async (userId?: string) => {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    const response = await apiClient.get(`/progress?${query}`);
    return response.data.data;
  },

  completeCourse: async (userId: string, courseId: string) => {
    const response = await apiClient.post('/progress', {
      userId,
      courseId,
      action: 'complete_course',
    });
    return response.data.data;
  },

  markContentComplete: async (userId: string, courseId: string, contentId: string) => {
    const response = await apiClient.post('/progress', {
      userId,
      courseId,
      contentId,
      action: 'mark_content',
    });
    return response.data.data;
  },
};

// Tokens API
export const tokensAPI = {
  getBalance: async () => {
    const response = await apiClient.get('/tokens');
    return response.data.data;
  },

  awardTokens: async (userId: string, amount: number, type: string, description?: string) => {
    const response = await apiClient.post('/tokens', {
      userId,
      amount,
      type,
      description,
    });
    return response.data.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },
};

export default apiClient;
