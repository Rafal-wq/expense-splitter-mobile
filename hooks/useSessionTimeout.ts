import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

const SESSION_TIMEOUT = 15 * 60 * 1000;

export function useSessionTimeout() {
    const { isAuthenticated, logout } = useAuthStore();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            try {
                await authService.logout();
            } finally {
                await logout();
                router.replace('/(auth)/login');
            }
        }, SESSION_TIMEOUT);
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        resetTimer();

        const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
            if (appStateRef.current === 'background' && nextState === 'active') {
                resetTimer();
            }
            appStateRef.current = nextState;
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            subscription.remove();
        };
    }, [isAuthenticated]);

    return { resetTimer };
}
