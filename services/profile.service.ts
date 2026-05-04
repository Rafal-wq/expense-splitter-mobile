import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
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
};
