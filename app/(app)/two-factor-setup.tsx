import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { profileService } from '@/services/profile.service';
import { showError, showSuccess } from '@/utils/toast';

export default function TwoFactorSetupScreen() {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [loadingQr, setLoadingQr] = useState(true);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchQr = async () => {
            try {
                const dataUrl = await profileService.enable2FA();
                if (mounted) {
                    setQrDataUrl(dataUrl);
                }
            } catch {
                if (mounted) {
                    showError('Nie udało się pobrać kodu QR');
                    router.back();
                }
            } finally {
                if (mounted) {
                    setLoadingQr(false);
                }
            }
        };
        void fetchQr();
        return () => {
            mounted = false;
        };
    }, []);

    const handleConfirm = async () => {
        if (!/^\d{6}$/.test(code)) {
            showError('Kod musi mieć dokładnie 6 cyfr');
            return;
        }
        setConfirming(true);
        try {
            await profileService.confirm2FA(code);
            showSuccess('Włączono dwuetapową weryfikację');
            router.back();
        } catch {
            showError('Nieprawidłowy kod, spróbuj ponownie');
        } finally {
            setConfirming(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ headerShown: true, title: 'Włącz 2FA' }} />
            <Text style={styles.heading}>Krok 1: Zeskanuj kod</Text>
            <Text style={styles.subtitle}>
                Otwórz aplikację Google Authenticator (lub kompatybilną) i zeskanuj kod QR.
            </Text>
            <View style={styles.qrWrapper}>
                {loadingQr ? (
                    <ActivityIndicator size="large" color="#0a7ea4" />
                ) : qrDataUrl ? (
                    <Image source={{ uri: qrDataUrl }} style={styles.qr} resizeMode="contain" />
                ) : null}
            </View>
            <Text style={styles.heading}>Krok 2: Wpisz kod</Text>
            <Text style={styles.subtitle}>
                Wpisz 6-cyfrowy kod wygenerowany przez aplikację.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="123456"
                value={code}
                onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={confirming}>
                {confirming ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Potwierdź i włącz</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 24 },
    heading: { fontSize: 18, fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#687076', marginBottom: 12 },
    qrWrapper: { alignItems: 'center', justifyContent: 'center', height: 240, marginBottom: 8 },
    qr: { width: 220, height: 220 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 8 },
    button: { backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
