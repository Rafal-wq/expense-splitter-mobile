import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

export default function TabsLayout() {
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } finally {
            await logout();
            router.replace('/(auth)/login');
        }
    };

    return (
        <Tabs
            screenOptions={{
                headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
                        <Text style={{ color: '#0a7ea4', fontSize: 14 }}>Logout</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen name="expenses" options={{ title: 'Expenses' }} />
            <Tabs.Screen name="friends" options={{ title: 'Friends' }} />
        </Tabs>
    );
}
