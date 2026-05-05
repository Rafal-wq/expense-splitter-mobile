import AsyncStorage from '@react-native-async-storage/async-storage';

export const CACHE_KEYS = {
    EXPENSES: 'cache_expenses',
    PROFILE: 'cache_profile',
    FRIENDS: 'cache_friends',
};

export const cacheService = {
    async set<T>(key: string, data: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch {
            // zapis cache jest niekrytyczny — ignorujemy błąd
        }
    },

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await AsyncStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : null;
        } catch {
            return null;
        }
    },

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch {
            // ignorujemy
        }
    },
};
