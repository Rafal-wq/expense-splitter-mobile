import { useEffect } from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
    const { loadFromStorage } = useAuthStore();

    useEffect(() => {
        void loadFromStorage();
    }, []);

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
            </Stack>
            <Toast />
        </>
    );
}
