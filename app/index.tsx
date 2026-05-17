import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? (
        <Redirect href="/(app)/(tabs)/expenses" />
    ) : (
        <Redirect href={'/(auth)/welcome' as Href} />
    );
}
