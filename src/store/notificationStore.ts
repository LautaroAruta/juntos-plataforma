import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order_status' | 'deal_alert' | 'system';
  read: boolean;
  link?: string;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: Math.random().toString(36).substring(7),
          read: false,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
        // Opcional: Llamada a API para marcar en DB
        fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
        fetch(`/api/notifications/read-all`, { method: 'POST' }).catch(() => {});
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.notifications.find(n => n.id === id)?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1)
        }));
      },

      async fetchNotifications() {
        try {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const data = await res.json();
            set({ 
              notifications: data,
              unreadCount: data.filter((n: Notification) => !n.read).length
            });
          }
        } catch (e) {
          console.error("Error fetching notifications:", e);
        }
      },
    }),
    {
      name: 'bandha-notifications-storage',
    }
  )
);
