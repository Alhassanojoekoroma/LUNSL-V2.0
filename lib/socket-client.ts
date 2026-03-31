import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socket: ReturnType<typeof io> | null = null;

export const initSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✓ Connected to WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected from WebSocket');
  });

  socket.on('error', (error) => {
    console.error('Socket.io error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event listeners
export const onNotification = (callback: (notification: any) => void) => {
  const socket = getSocket();
  socket.on('notification_received', callback);
  
  return () => {
    socket.off('notification_received', callback);
  };
};

export const onMessage = (callback: (message: any) => void) => {
  const socket = getSocket();
  socket.on('receive_message', callback);
  
  return () => {
    socket.off('receive_message', callback);
  };
};

export const onUserTyping = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket.on('user_typing', callback);
  
  return () => {
    socket.off('user_typing', callback);
  };
};

export const onGroupMessage = (callback: (message: any) => void) => {
  const socket = getSocket();
  socket.on('group_message_received', callback);
  
  return () => {
    socket.off('group_message_received', callback);
  };
};

// Socket event emitters
export const joinUser = (userId: string) => {
  const socket = getSocket();
  socket.emit('join_user', userId);
};

export const joinCourse = (courseId: string) => {
  const socket = getSocket();
  socket.emit('join_course', courseId);
};

export const joinStudyGroup = (groupId: string) => {
  const socket = getSocket();
  socket.emit('join_study_group', groupId);
};

export const sendMessage = (data: {
  senderId: string;
  recipientId: string;
  content: string;
}) => {
  const socket = getSocket();
  socket.emit('send_message', data);
};

export const sendGroupMessage = (data: {
  groupId: string;
  userId: string;
  message: string;
}) => {
  const socket = getSocket();
  socket.emit('group_message', data);
};

export const emitTyping = (data: {
  recipientId: string;
  userId: string;
  isTyping: boolean;
}) => {
  const socket = getSocket();
  socket.emit('typing', data);
};

export const submitQuiz = (data: {
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
}) => {
  const socket = getSocket();
  socket.emit('quiz_submitted', data);
};
