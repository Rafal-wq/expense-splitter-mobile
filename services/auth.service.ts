import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '@/types';

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<UserResponse> => {
        const response = await api.post<UserResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
};
