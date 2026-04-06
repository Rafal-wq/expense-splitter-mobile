import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
    const { loadFromStorage } = useAuthStore();

    useEffect(() => {
        loadFromStorage();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
        </Stack>
    );
}
