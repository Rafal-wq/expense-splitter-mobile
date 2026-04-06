export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    FRIENDSHIPS: {
        LIST: '/friendships',
        SEND: '/friendships',
        DETAILS: (id: string) => `/friendships/${id}`,
        ACCEPT: (id: string) => `/friendships/${id}/accept`,
        REJECT: (id: string) => `/friendships/${id}/reject`,
        DELETE: (id: string) => `/friendships/${id}`,
    },
    EXPENSES: {
        LIST: '/expenses',
        CREATE: '/expenses',
        DETAILS: (id: string) => `/expenses/${id}`,
        UPDATE: (id: string) => `/expenses/${id}`,
        DELETE: (id: string) => `/expenses/${id}`,
        PARTICIPANTS: (id: string) => `/expenses/${id}/participants`,
    },
} as const;
