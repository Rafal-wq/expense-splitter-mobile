import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserResponse } from '@/types';

interface AuthState {
    user: UserResponse | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
    setUser: (user: UserResponse) => void;
    logout: () => Promise<void>;
    loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    setTokens: async (accessToken, refreshToken) => {
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
    },

    setUser: (user) => set({ user }),

    logout: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },

    loadFromStorage: async () => {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (accessToken && refreshToken) {
            set({ accessToken, refreshToken, isAuthenticated: true });
        }
    },
}));
