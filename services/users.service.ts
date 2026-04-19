import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { SimpleUserResponse } from '@/types';

export const usersService = {
    searchUsers: async (query: string): Promise<SimpleUserResponse[]> => {
        const response = await api.get(API_ENDPOINTS.USERS.SEARCH, {
            params: { query, size: 10 },
        });
        return response.data.content;
    },
};
