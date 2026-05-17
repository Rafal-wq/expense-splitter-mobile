import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.heroSection}>
                <View style={styles.iconCircle}>
                    <Ionicons name="wallet" size={64} color="#fff" />
                </View>
                <Text style={styles.appName}>Expense Splitter</Text>
                <Text style={styles.tagline}>
                    Dziel wydatki ze znajomymi bez nieporozumień
                </Text>
            </View>

            <View style={styles.featuresSection}>
                <View style={styles.featureRow}>
                    <Ionicons name="people-outline" size={24} color="#0a7ea4" />
                    <Text style={styles.featureText}>Twórz wydatki grupowe</Text>
                </View>
                <View style={styles.featureRow}>
                    <Ionicons name="receipt-outline" size={24} color="#0a7ea4" />
                    <Text style={styles.featureText}>Śledź kto komu jest winien</Text>
                </View>
                <View style={styles.featureRow}>
                    <Ionicons name="notifications-outline" size={24} color="#0a7ea4" />
                    <Text style={styles.featureText}>Powiadomienia w czasie rzeczywistym</Text>
                </View>
                <View style={styles.featureRow}>
                    <Ionicons name="shield-checkmark-outline" size={24} color="#0a7ea4" />
                    <Text style={styles.featureText}>Bezpieczne logowanie z 2FA</Text>
                </View>
            </View>

            <View style={styles.ctaSection}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.primaryButtonText}>Zaloguj się</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/(auth)/register')}
                >
                    <Text style={styles.secondaryButtonText}>Utwórz konto</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    heroSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#0a7ea4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#11181C',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#687076',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    featuresSection: {
        paddingVertical: 24,
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#11181C',
        flex: 1,
    },
    ctaSection: {
        gap: 12,
        paddingBottom: 16,
    },
    primaryButton: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0a7ea4',
    },
    secondaryButtonText: {
        color: '#0a7ea4',
        fontSize: 16,
        fontWeight: '600',
    },
});
