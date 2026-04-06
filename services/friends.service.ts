import api from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { FriendshipResponse, FriendshipRequest } from '@/types';

export const friendsService = {
    getFriendships: async (status: 'PENDING' | 'ACCEPTED' | 'REJECTED'): Promise<FriendshipResponse[]> => {
        const response = await api.get(API_ENDPOINTS.FRIENDSHIPS.LIST, {
            params: { status },
        });
        return response.data.content;
    },

    sendFriendRequest: async (recipientId: string): Promise<FriendshipResponse> => {
        const response = await api.post<FriendshipResponse>(API_ENDPOINTS.FRIENDSHIPS.SEND, {
            recipientId,
        } as FriendshipRequest);
        return response.data;
    },

    acceptFriendRequest: async (id: string): Promise<FriendshipResponse> => {
        const response = await api.patch<FriendshipResponse>(API_ENDPOINTS.FRIENDSHIPS.ACCEPT(id));
        return response.data;
    },

    rejectFriendRequest: async (id: string): Promise<FriendshipResponse> => {
        const response = await api.patch<FriendshipResponse>(API_ENDPOINTS.FRIENDSHIPS.REJECT(id));
        return response.data;
    },

    deleteFriendship: async (id: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.FRIENDSHIPS.DELETE(id));
    },
};
