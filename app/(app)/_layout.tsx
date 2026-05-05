import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '@/store/auth.store';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { OfflineBanner } from '@/components/OfflineBanner';
import { cacheService, CACHE_KEYS } from '@/services/cache.service';
import { profileService } from '@/services/profile.service';
import { expensesService } from '@/services/expenses.service';
import { friendsService } from '@/services/friends.service';
import { offlineQueueService } from '@/services/offlineQueue.service';
import { useSyncStore } from '@/store/sync.store';

export default function AppLayout() {
    const { isAuthenticated } = useAuthStore();
    const { bumpSyncVersion } = useSyncStore();
    const wasOnlineRef = useRef<boolean | null>(null);
    useSessionTimeout();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/(auth)/login');
            return;
        }

        // Prefetch danych w tle zaraz po zalogowaniu
        const prefetch = async () => {
            try {
                const [profile, expenses, friends] = await Promise.all([
                    profileService.getMe(),
                    expensesService.getExpenses(),
                    friendsService.getFriendships('ACCEPTED'),
                ]);
                await Promise.all([
                    cacheService.set(CACHE_KEYS.PROFILE, profile),
                    cacheService.set(CACHE_KEYS.EXPENSES, expenses),
                    cacheService.set(CACHE_KEYS.FRIENDS, friends),
                ]);
            } catch {
                // prefetch jest niekrytyczny — brak sieci przy starcie jest ok
            }
        };

        void prefetch();
    }, [isAuthenticated]);

    // Auto-sync kolejki gdy wraca internet
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubscribe = NetInfo.addEventListener(async (state) => {
            const isOnline = state.isConnected ?? false;

            if (wasOnlineRef.current === false && isOnline) {
                try {
                    const { synced } = await offlineQueueService.processQueue();
                    if (synced > 0) {
                        bumpSyncVersion();
                    }
                } catch {
                    // sync failure — spróbujemy przy następnym połączeniu
                }
            }

            wasOnlineRef.current = isOnline;
        });

        return () => unsubscribe();
    }, [isAuthenticated, bumpSyncVersion]);

    return (
        <View style={{ flex: 1 }}>
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
            </Stack>
        </View>
    );
}
