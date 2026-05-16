import { create } from 'zustand';
import { NotificationResponse } from '@/types';

interface NotificationsState {
    items: NotificationResponse[];
    unreadCount: number;
    hydrate: (items: NotificationResponse[]) => void;
    addIncoming: (item: NotificationResponse) => void;
    markAsRead: (id: string) => void;
    reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
    items: [],
    unreadCount: 0,

    hydrate: (items) =>
        set({
            items,
            unreadCount: items.filter((n) => !n.isRead).length,
        }),

    addIncoming: (item) =>
        set((state) => {
            if (state.items.some((n) => n.id === item.id)) {
                return state;
            }
            const items = [item, ...state.items];
            return {
                items,
                unreadCount: items.filter((n) => !n.isRead).length,
            };
        }),

    markAsRead: (id) =>
        set((state) => {
            const items = state.items.filter((n) => n.id !== id);
            return {
                items,
                unreadCount: items.filter((n) => !n.isRead).length,
            };
        }),

    reset: () => set({ items: [], unreadCount: 0 }),
}));
