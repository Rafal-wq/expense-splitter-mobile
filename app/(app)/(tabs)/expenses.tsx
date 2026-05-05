import { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { cacheService, CACHE_KEYS } from '@/services/cache.service';
import { ExpenseResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { isExpenseSettled } from '@/utils/expenseSettled';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [settledMap, setSettledMap] = useState<Record<string, boolean>>({});
    const { user } = useAuthStore();

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

    const loadExpenses = useCallback(async () => {
        try {
            const data = await expensesService.getExpenses();
            setExpenses(data);
            await cacheService.set(CACHE_KEYS.EXPENSES, data);
            loadSettledStatus(data);
        } catch {
            const cached = await cacheService.get<ExpenseResponse[]>(CACHE_KEYS.EXPENSES);
            if (cached) {
                setExpenses(cached);
                loadSettledStatus(cached);
            } else {
                Alert.alert('Błąd', 'Nie udało się załadować wydatków');
            }
        }
    }, [loadSettledStatus]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadExpenses().finally(() => setLoading(false));
        }, [loadExpenses])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadExpenses();
        setRefreshing(false);
    }, [loadExpenses]);

    const handleDelete = async (id: string) => {
        Alert.alert('Usuń wydatek', 'Czy na pewno chcesz usunąć ten wydatek?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Usuń',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await expensesService.deleteExpense(id);
                        await loadExpenses();
                    } catch {
                        Alert.alert('Błąd', 'Nie udało się usunąć wydatku');
                    }
                },
            },
        ]);
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

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(app)/expense/create')}
            >
                <Text style={styles.addButtonText}>+ Nowy wydatek</Text>
            </TouchableOpacity>

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
        marginTop: 8,
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
});
