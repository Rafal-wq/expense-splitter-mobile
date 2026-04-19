import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { ExpenseResponse } from '@/types';
import { useFocusEffect } from 'expo-router';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadExpenses = useCallback(async () => {
        try {
            const data = await expensesService.getExpenses();
            setExpenses(data);
        } catch {
            Alert.alert('Error', 'Failed to load expenses');
        }
    }, []);

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
        Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await expensesService.deleteExpense(id);
                        await loadExpenses();
                    } catch {
                        Alert.alert('Error', 'Failed to delete expense');
                    }
                },
            },
        ]);
    };

    const renderExpense = ({ item }: { item: ExpenseResponse }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/(app)/expense/${item.id}`)}
        >
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDate}>
                    {new Date(item.expenseDate).toLocaleDateString('pl-PL')}
                </Text>
                <Text style={[styles.itemRole, item.role === 'PAYER' ? styles.rolePayer : styles.roleParticipant]}>
                    {item.role === 'PAYER' ? 'Płacący' : 'Uczestnik'}
                </Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>{item.amountTotal.toFixed(2)} zł</Text>
                {item.role === 'PAYER' && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>Usuń</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

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
