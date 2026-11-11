import { create } from 'zustand';

export interface Notification {
    id: string;
    title: string;
    body: string;
    read: boolean;
    data?: any;
    createdAt: number;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],

    addNotification: (notification) => set((state) => ({
        notifications: [
            {
                ...notification,
                id: Math.random().toString(36).substring(7),
                read: false,
                createdAt: Date.now(),
            },
            ...state.notifications
        ]
    })),

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    clearAll: () => set({ notifications: [] }),

    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
    }
}));
