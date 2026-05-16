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
import { notificationsService } from '@/services/notifications.service';
import { offlineQueueService } from '@/services/offlineQueue.service';
import { useSyncStore } from '@/store/sync.store';
import { useNotificationsStore } from '@/store/notifications.store';

export default function AppLayout() {
    const { isAuthenticated } = useAuthStore();
    const { bumpSyncVersion } = useSyncStore();
    const { hydrate: hydrateNotifications, reset: resetNotifications } = useNotificationsStore();
    const wasOnlineRef = useRef<boolean | null>(null);
    useSessionTimeout();

    useEffect(() => {
        if (!isAuthenticated) {
            resetNotifications();
            router.replace('/(auth)/login');
            return;
        }

        const initialize = async () => {
            try {
                const netState = await NetInfo.fetch();
                if (netState.isConnected) {
                    const { synced } = await offlineQueueService.processQueue();
                    if (synced > 0) {
                        bumpSyncVersion();
                    }
                }
            } catch {
                // sync niekrytyczny
            }

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
                // prefetch niekrytyczny
            }

            try {
                const page = await notificationsService.list();
                hydrateNotifications(page.content);
            } catch {
                // powiadomienia niekrytyczne
            }
        };

        void initialize();
    }, [isAuthenticated, bumpSyncVersion, hydrateNotifications, resetNotifications]);

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
                    // sync failure
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
                <Stack.Screen
                    name="notifications"
                    options={{ headerShown: true, title: 'Powiadomienia' }}
                />
            </Stack>
        </View>
    );
}
