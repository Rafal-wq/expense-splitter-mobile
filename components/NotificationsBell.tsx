import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNotificationsStore } from '@/store/notifications.store';

export function NotificationsBell() {
    const unreadCount = useNotificationsStore((s) => s.unreadCount);

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(app)/notifications')}
            hitSlop={10}
        >
            <Ionicons name="notifications-outline" size={24} color="#0a7ea4" />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginRight: 16,
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
