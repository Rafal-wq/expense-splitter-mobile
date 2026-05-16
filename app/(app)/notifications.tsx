import { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationsStore } from '@/store/notifications.store';
import { showError } from '@/utils/toast';
import { NotificationResponse } from '@/types';

export default function NotificationsScreen() {
    const { items, hydrate, markAsRead } = useNotificationsStore();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const page = await notificationsService.list();
            hydrate(page.content);
        } catch {
            showError('Nie udało się załadować powiadomień');
        }
    }, [hydrate]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            load().finally(() => setLoading(false));
        }, [load])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const handleTap = async (id: string) => {
        markAsRead(id);
        try {
            await notificationsService.markAsRead(id);
        } catch {
            showError('Nie udało się oznaczyć jako przeczytane');
            await load();
        }
    };

    const renderItem = ({ item }: { item: NotificationResponse }) => (
        <TouchableOpacity style={styles.item} onPress={() => handleTap(item.id)}>
            <View style={styles.dot} />
            <View style={styles.body}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.body}</Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleString('pl-PL')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Brak nowych powiadomień</Text>
                }
                contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    item: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0a7ea4',
        marginTop: 8,
        marginRight: 12,
    },
    body: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    message: { fontSize: 14, color: '#444', marginBottom: 6 },
    date: { fontSize: 12, color: '#687076' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#687076', fontSize: 15 },
});
