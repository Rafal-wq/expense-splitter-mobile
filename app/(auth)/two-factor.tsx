import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { showError } from '@/utils/toast';

export default function TwoFactorScreen() {
    const { token } = useLocalSearchParams<{ token: string }>();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { setTokens, setUser } = useAuthStore();

    const handleVerify = async () => {
        if (!/^\d{6}$/.test(code)) {
            showError('Kod musi mieć dokładnie 6 cyfr');
            return;
        }
        if (!token) {
            showError('Brak tokenu — wróć i zaloguj się ponownie');
            return;
        }
        setLoading(true);
        try {
            const response = await authService.verify2FA(code, token);
            await setTokens(response.accessToken, response.refreshToken);
            const profile = await profileService.getMe();
            setUser(profile);
            router.replace('/(app)/(tabs)/expenses');
        } catch {
            showError('Nieprawidłowy kod, spróbuj ponownie');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dwuetapowa weryfikacja</Text>
            <Text style={styles.subtitle}>
                Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej (Google Authenticator).
            </Text>
            <TextInput
                style={styles.input}
                placeholder="123456"
                value={code}
                onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Zweryfikuj</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Wróć do logowania</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#687076', marginBottom: 24, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 8 },
    button: { backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { color: '#0a7ea4', textAlign: 'center', fontSize: 14 },
});
