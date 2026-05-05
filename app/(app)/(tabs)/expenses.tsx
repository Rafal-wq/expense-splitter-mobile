import { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { showError } from '@/utils/toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { router, useFocusEffect } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { cacheService, CACHE_KEYS } from '@/services/cache.service';
import { offlineQueueService, QueuedExpense } from '@/services/offlineQueue.service';
import { useSyncStore } from '@/store/sync.store';
import { ExpenseResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { isExpenseSettled } from '@/utils/expenseSettled';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [pendingQueue, setPendingQueue] = useState<QueuedExpense[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [settledMap, setSettledMap] = useState<Record<string, boolean>>({});
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { syncVersion } = useSyncStore();

    const loadSettledStatus = useCallback(async (expenseList: ExpenseResponse[]) => {
        const entries = await Promise.all(
            expenseList.map(async (expense) => {
                try {
                    const [detailed, payments] = await Promise.all([
                        expensesService.getExpense(expense.id),
                        expensesService.getPayments(expense.id),
                    ]);

                    const settled = user?.id
                        ? isExpenseSettled(detailed, payments, user.id, expense.role)
                        : false;

                    return [expense.id, settled] as const;
                } catch {
                    return [expense.id, false] as const;
                }
            })
        );
        setSettledMap(Object.fromEntries(entries));
    }, [user?.id]);

    const sortExpenses = (list: ExpenseResponse[]) =>
        [...list].sort(
            (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
        );

    const loadExpenses = useCallback(async () => {
        try {
            const data = await expensesService.getExpenses();
            const sorted = sortExpenses(data);
            setExpenses(sorted);
            await cacheService.set(CACHE_KEYS.EXPENSES, sorted);
            loadSettledStatus(sorted);
        } catch {
            const cached = await cacheService.get<ExpenseResponse[]>(CACHE_KEYS.EXPENSES);
            if (cached) {
                setExpenses(cached);
                loadSettledStatus(cached);
            } else {
                showError('Nie udało się załadować wydatków');
            }
        }
    }, [loadSettledStatus]);

    const loadQueue = useCallback(async () => {
        const queue = await offlineQueueService.getQueue();
        setPendingQueue(queue);
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            Promise.all([loadExpenses(), loadQueue()]).finally(() => setLoading(false));
        }, [loadExpenses, loadQueue])
    );

    // Odśwież po powrocie internetu i zakończeniu synca
    useEffect(() => {
        if (syncVersion > 0) {
            loadExpenses();
            loadQueue();
        }
    }, [syncVersion, loadExpenses, loadQueue]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadExpenses();
        setRefreshing(false);
    }, [loadExpenses]);

    const handleDelete = (id: string) => setDeleteId(id);

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleteId(null);
        try {
            await expensesService.deleteExpense(deleteId);
            await loadExpenses();
        } catch {
            showError('Nie udało się usunąć wydatku');
        }
    };

    const confirmDeletePending = async () => {
        if (!deletePendingId) return;
        setDeletePendingId(null);
        await offlineQueueService.remove(deletePendingId);
        await loadQueue();
    };

    const renderExpense = ({ item }: { item: ExpenseResponse }) => {
        const isSettled = settledMap[item.id] ?? false;
        return (
            <TouchableOpacity
                style={[styles.item, isSettled && styles.itemSettled]}
                onPress={() => router.push(`/(app)/expense/${item.id}`)}
            >
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, isSettled && styles.textMuted]}>{item.title}</Text>
                    <Text style={styles.itemDate}>
                        {new Date(item.expenseDate).toLocaleDateString('pl-PL')}
                    </Text>
                    <Text style={[styles.itemRole, item.role === 'PAYER' ? styles.rolePayer : styles.roleParticipant]}>
                        {item.role === 'PAYER' ? 'Płacący' : 'Uczestnik'}
                    </Text>
                </View>
                <View style={styles.itemRight}>
                    <Text style={[styles.itemAmount, isSettled && styles.textMuted]}>
                        {item.amountTotal.toFixed(2)} zł
                    </Text>
                    {isSettled ? (
                        <View style={styles.settledBadge}>
                            <Text style={styles.settledText}>Rozliczony</Text>
                        </View>
                    ) : (
                        item.role === 'PAYER' && (
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                                <Text style={styles.deleteText}>Usuń</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderPendingItem = (item: QueuedExpense) => (
        <View key={item.tempId} style={[styles.item, styles.itemPending]}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.payload.title}</Text>
                <Text style={styles.itemDate}>
                    {new Date(item.timestamp).toLocaleDateString('pl-PL')}
                </Text>
                <Text style={[styles.itemRole, styles.rolePayer]}>Płacący</Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>{item.payload.amount.toFixed(2)} zł</Text>
                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>⏳ Oczekuje</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setDeletePendingId(item.tempId)}
                    style={styles.deleteButton}
                >
                    <Text style={styles.deleteText}>Usuń</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(app)/expense/create')}
            >
                <Text style={styles.addButtonText}>+ Nowy wydatek</Text>
            </TouchableOpacity>

            {pendingQueue.length > 0 && (
                <View style={styles.pendingSection}>
                    <Text style={styles.pendingSectionTitle}>Oczekuje na synchronizację</Text>
                    {pendingQueue.map(renderPendingItem)}
                </View>
            )}

            {loading ? (
                <Text style={styles.loadingText}>Ładowanie...</Text>
            ) : (
                <FlatList
                    data={expenses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderExpense}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>Brak wydatków</Text>}
                />
            )}

            <ConfirmModal
                visible={deleteId !== null}
                title="Usuń wydatek"
                message="Czy na pewno chcesz usunąć ten wydatek?"
                confirmText="Usuń"
                destructive
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <ConfirmModal
                visible={deletePendingId !== null}
                title="Usuń oczekujący wydatek"
                message="Czy na pewno chcesz usunąć ten wydatek z kolejki? Nie zostanie wysłany."
                confirmText="Usuń"
                destructive
                onConfirm={confirmDeletePending}
                onCancel={() => setDeletePendingId(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    addButton: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    itemSettled: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemDate: {
        fontSize: 13,
        color: '#687076',
        marginTop: 2,
    },
    itemRole: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
    rolePayer: {
        color: '#0a7ea4',
    },
    roleParticipant: {
        color: '#687076',
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textMuted: {
        color: '#aaa',
    },
    settledBadge: {
        marginTop: 6,
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    settledText: {
        color: '#2e7d32',
        fontSize: 11,
        fontWeight: '600',
    },
    deleteButton: {
        marginTop: 6,
    },
    deleteText: {
        color: '#ff3b30',
        fontSize: 13,
    },
    loadingText: {
        textAlign: 'center',
        color: '#687076',
        marginTop: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: '#687076',
        marginTop: 16,
    },
    pendingSection: {
        marginBottom: 8,
    },
    pendingSectionTitle: {
        fontSize: 13,
        color: '#c0392b',
        fontWeight: '600',
        marginBottom: 6,
    },
    itemPending: {
        borderColor: '#f0a500',
        backgroundColor: '#fffbf0',
    },
    pendingBadge: {
        marginTop: 6,
        backgroundColor: '#fff3cd',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    pendingText: {
        color: '#856404',
        fontSize: 11,
        fontWeight: '600',
    },
});
