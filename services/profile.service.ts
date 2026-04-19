import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { DetailedUserResponse } from '@/types';

export const profileService = {
    getMe: async (): Promise<DetailedUserResponse> => {
        const response = await api.get<DetailedUserResponse>(API_ENDPOINTS.PROFILE.ME);
        return response.data;
    },
};
