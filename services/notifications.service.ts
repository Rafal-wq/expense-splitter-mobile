import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
import {
    NotificationResponse,
    NotificationPreferenceResponse,
    UpdateNotificationPreferenceRequest,
    PagedResponse,
} from '@/types';

export const notificationsService = {
    list: async (page = 0, size = 50): Promise<PagedResponse<NotificationResponse>> => {
        const response = await api.get<PagedResponse<NotificationResponse>>(
            API_ENDPOINTS.NOTIFICATIONS.LIST,
            { params: { page, size, sort: 'createdAt,desc' } }
        );
        return response.data;
    },

    markAsRead: async (id: string): Promise<NotificationResponse> => {
        const response = await api.patch<NotificationResponse>(
            API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
        );
        return response.data;
    },

    getPreferences: async (): Promise<NotificationPreferenceResponse> => {
        const response = await api.get<NotificationPreferenceResponse>(
            API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
        );
        return response.data;
    },

    updatePreferences: async (
        data: UpdateNotificationPreferenceRequest
    ): Promise<NotificationPreferenceResponse> => {
        const response = await api.patch<NotificationPreferenceResponse>(
            API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
            data
        );
        return response.data;
    },
};
