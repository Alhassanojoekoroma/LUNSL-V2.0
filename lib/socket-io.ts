import { Server as HTTPServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from './prisma';

let io: SocketIOServer | null = null;

const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join_user', (userId: string) => {
      socket.join(`user:${userId}`);
      
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)?.add(socket.id);
      
      console.log(`[Socket.io] User ${userId} joined with socket ${socket.id}`);
      io?.emit('user_online', { userId, timestamp: new Date() });
    });

    // Chat message events
    socket.on('send_message', async (data: {
      senderId: string;
      recipientId: string;
      content: string;
      conversationId?: string;
    }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            recipientId: data.recipientId,
          },
          include: {
            sender: { select: { id: true, name: true, email: true } },
            recipient: { select: { id: true, name: true, email: true } },
          },
        });

        // Send to recipient
        io?.to(`user:${data.recipientId}`).emit('receive_message', message);
        
        // Confirm to sender
        socket.emit('message_sent', message);

        console.log(`[Socket.io] Message sent from ${data.senderId} to ${data.recipientId}`);
      } catch (error) {
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { recipientId: string; userId: string; isTyping: boolean }) => {
      io?.to(`user:${data.recipientId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    // Quiz events - real-time score updates
    socket.on('quiz_submitted', async (data: {
      quizId: string;
      userId: string;
      score: number;
      maxScore: number;
    }) => {
      const percentage = Math.round((data.score / data.maxScore) * 100);
      
      io?.emit('quiz_completed', {
        userId: data.userId,
        quizId: data.quizId,
        score: data.score,
        percentage,
        timestamp: new Date(),
      });

      console.log(`[Socket.io] Quiz ${data.quizId} submitted by ${data.userId}: ${percentage}%`);
    });

    // Notification events
    socket.on('send_notification', async (data: {
      userId: string;
      title: string;
      message: string;
      type: string;
      link?: string;
      additionalData?: Record<string, any>;
    }) => {
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: data.userId,
            title: data.title || 'Notification',
            message: data.message,
            type: data.type as any,
            link: data.link,
            data: data.additionalData || {},
          },
        });

        io?.to(`user:${data.userId}`).emit('notification_received', notification);
      } catch (error) {
        console.error('[Socket.io] Notification error:', error);
        socket.emit('notification_error', { error: 'Failed to send notification' });
      }
    });

    // Live course update
    socket.on('join_course', (courseId: string) => {
      socket.join(`course:${courseId}`);
      console.log(`[Socket.io] User joined course ${courseId}`);
    });

    socket.on('course_update', (data: { courseId: string; update: any }) => {
      io?.to(`course:${data.courseId}`).emit('course_updated', data.update);
    });

    // Study group events
    socket.on('join_study_group', (groupId: string) => {
      socket.join(`study_group:${groupId}`);
    });

    socket.on('group_message', async (data: {
      groupId: string;
      userId: string;
      message: string;
    }) => {
      io?.to(`study_group:${data.groupId}`).emit('group_message_received', {
        groupId: data.groupId,
        userId: data.userId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Remove user from socket list
      for (const [userId, socketIds] of userSockets.entries()) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          userSockets.delete(userId);
          io?.emit('user_offline', { userId, timestamp: new Date() });
        }
      }
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => io;

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToRoom = (room: string, event: string, data: any) => {
  if (!io) return;
  io.to(room).emit(event, data);
};

export const broadcastNotification = async (notification: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  additionalData?: Record<string, any>;
}) => {
  if (!io) return;
  const notificationData = {
    userId: notification.userId,
    title: notification.title || 'Notification',
    message: notification.message,
    type: notification.type,
    link: notification.link,
    data: notification.additionalData || {},
  };
  io.to(`user:${notification.userId}`).emit('notification_received', notificationData);
};
