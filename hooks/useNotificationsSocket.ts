import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { notificationsSocket } from '@/services/websocket.service';
import { showInfo } from '@/utils/toast';

export function useNotificationsSocket() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const accessToken = useAuthStore((s) => s.accessToken);
    const userId = useAuthStore((s) => s.user?.id);
    const addIncoming = useNotificationsStore((s) => s.addIncoming);

    useEffect(() => {
        if (!isAuthenticated || !accessToken || !userId) {
            notificationsSocket.disconnect();
            return;
        }

        const removeListener = notificationsSocket.addListener((payload) => {
            addIncoming({
                id: payload.id,
                userId,
                title: payload.title,
                body: payload.body,
                isRead: payload.isRead ?? false,
                createdAt: payload.createdAt,
            });
            showInfo(payload.title, payload.body);
        });

        notificationsSocket.connect(accessToken);

        return () => {
            removeListener();
        };
    }, [isAuthenticated, accessToken, userId, addIncoming]);
}
