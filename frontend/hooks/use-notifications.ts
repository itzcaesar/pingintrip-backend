import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import { toast } from 'sonner';

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type Notification = {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
};

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    socket: Socket | null;
    isLoading: boolean;
    connect: () => void;
    disconnect: () => void;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotifications = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    socket: null,
    isLoading: false,

    connect: () => {
        const socket = io('http://localhost:3000/notifications', {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            // Connected to notifications namespace
        });

        socket.on('notification', (newNotification: Notification) => {
            set((state) => ({
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            }));

            // Show toast
            toast(newNotification.title, {
                description: newNotification.message,
            });
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/notifications');
            const notifications = res.data;
            const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            set((state) => {
                const updated = state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.isRead).length,
                };
            });
        } catch (error) {
            console.error(`Failed to mark notification ${id} as read:`, error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.patch('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },
}));
