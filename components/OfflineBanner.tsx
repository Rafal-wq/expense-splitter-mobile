import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;

    return (
        <View style={styles.banner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
            <Text style={styles.text}>Brak połączenia — tryb offline</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#c0392b',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    text: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
