export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        RESET_PASSWORD: '/auth/reset-password',
        RESET_PASSWORD_CONFIRM: '/auth/reset-password/confirm',
        TWO_FACTOR_VERIFY: '/auth/2fa/verify',
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
        DELETE_PARTICIPANT: (id: string, participantId: string) => `/expenses/${id}/participants/${participantId}`,
        PAYMENTS: (id: string) => `/expenses/${id}/payments`,
    },
    PAYMENTS: {
        CREATE: '/payments',
        DETAILS: (id: string) => `/payments/${id}`,
        DELETE: (id: string) => `/payments/${id}`,
    },
    USERS: {
        SEARCH: '/users',
    },
    PROFILE: {
        ME: '/profile',
        UPDATE: '/profile',
        CHANGE_PASSWORD: '/profile/password',
        TWO_FACTOR_ENABLE: '/profile/2fa/enable',
        TWO_FACTOR_CONFIRM: '/profile/2fa/confirm',
        TWO_FACTOR_DISABLE: '/profile/2fa/disable',
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        PREFERENCES: '/notifications/preferences',
    },
} as const;
