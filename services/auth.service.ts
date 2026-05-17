import axios from 'axios';
import api from './api';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '@/types';

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    verify2FA: async (code: string, challengeToken: string): Promise<LoginResponse> => {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.TWO_FACTOR_VERIFY}`,
            { code },
            { headers: { Authorization: `Bearer ${challengeToken}` } }
        );
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<UserResponse> => {
        const response = await api.post<UserResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    resetPassword: async (email: string): Promise<void> => {
        await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    },

    confirmResetPassword: async (token: string, newPassword: string, repeatNewPassword: string): Promise<void> => {
        await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, { token, newPassword, repeatNewPassword });
    },
};
