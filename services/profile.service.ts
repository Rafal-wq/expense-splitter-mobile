import * as SecureStore from 'expo-secure-store';
import api from './api';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { DetailedUserResponse, UpdateProfileRequest, PasswordChangeRequest } from '@/types';

export const profileService = {
    getMe: async (): Promise<DetailedUserResponse> => {
        const response = await api.get<DetailedUserResponse>(API_ENDPOINTS.PROFILE.ME);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<DetailedUserResponse> => {
        const response = await api.patch<DetailedUserResponse>(API_ENDPOINTS.PROFILE.UPDATE, data);
        return response.data;
    },

    changePassword: async (data: PasswordChangeRequest): Promise<void> => {
        await api.patch(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
    },

    enable2FA: async (): Promise<string> => {
        const tryEnable = async (): Promise<Response> => {
            const token = await SecureStore.getItemAsync('accessToken');
            const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILE.TWO_FACTOR_ENABLE}`;
            return fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token ?? ''}` },
            });
        };

        let response = await tryEnable();
        if (response.status === 409) {
            await profileService.disable2FA().catch(() => undefined);
            response = await tryEnable();
        }
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.warn('enable2FA failed:', response.status, text);
            throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (err) => {
                console.warn('enable2FA FileReader error:', err);
                reject(err);
            };
            reader.readAsDataURL(blob);
        });
    },

    confirm2FA: async (code: string): Promise<void> => {
        await api.post(API_ENDPOINTS.PROFILE.TWO_FACTOR_CONFIRM, { code });
    },

    disable2FA: async (): Promise<void> => {
        await api.post(API_ENDPOINTS.PROFILE.TWO_FACTOR_DISABLE);
    },
};
