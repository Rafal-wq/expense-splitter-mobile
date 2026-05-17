import { useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/auth.store';
import { profileService } from '@/services/profile.service';
import { showError } from '@/utils/toast';

export default function FacebookOAuthScreen() {
    const webviewRef = useRef<WebView>(null);
    const handledRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const { setTokens, setUser } = useAuthStore();

    const url = `${API_BASE_URL}/oauth2/authorization/facebook`;

    const handleMessage = async (event: { nativeEvent: { data: string } }) => {
        if (handledRef.current) return;
        const text = event.nativeEvent.data;
        try {
            const json = JSON.parse(text);
            if (!json.accessToken || !json.refreshToken) return;
            handledRef.current = true;

            if (json.twoFactorRequired) {
                showError('Konto wymaga 2FA — zaloguj się przez email i hasło');
                router.back();
                return;
            }

            await setTokens(json.accessToken, json.refreshToken);
            try {
                const profile = await profileService.getMe();
                setUser(profile);
            } catch {
                showError('Nie udało się pobrać profilu');
            }
            router.replace('/(app)/(tabs)/expenses');
        } catch {
            return;
        }
    };

    const onNavigationStateChange = (navState: WebViewNavigation) => {
        if (handledRef.current) return;
        if (
            navState.url.includes('/login/oauth2/code/facebook') &&
            !navState.loading
        ) {
            webviewRef.current?.injectJavaScript(
                `window.ReactNativeWebView.postMessage(document.body.innerText); true;`
            );
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: true, title: 'Logowanie Facebook' }} />
            <WebView
                ref={webviewRef}
                source={{ uri: url }}
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onMessage={handleMessage}
                onNavigationStateChange={onNavigationStateChange}
                onError={() => {
                    showError('Logowanie Facebook nie powiodło się');
                    router.back();
                }}
                sharedCookiesEnabled
                thirdPartyCookiesEnabled
            />
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#1877f2" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
});
