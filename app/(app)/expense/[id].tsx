import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { DetailedExpenseResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function ExpenseDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [expense, setExpense] = useState<DetailedExpenseResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    const loadExpense = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await expensesService.getExpense(id);
            setExpense(data);
        } catch {
            Alert.alert('Error', 'Failed to load expense');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadExpense();
    }, [loadExpense]);

    const handleDeleteParticipant = async (participantId: string) => {
        if (!id) return;
        Alert.alert('Remove Participant', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await expensesService.deleteParticipant(id, participantId);
                        await loadExpense();
                    } catch (error: any) {
                        Alert.alert('Error', error?.response?.data?.detail || error?.message || 'Unknown error');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!expense) {
        return (
            <View style={styles.center}>
                <Text>Expense not found</Text>
            </View>
        );
    }

    const isPayer = expense.payer.id === user?.id;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{expense.title}</Text>

            {expense.description && (
                <Text style={styles.description}>{expense.description}</Text>
            )}

            <View style={styles.infoRow}>
                <Text style={styles.label}>Amount:</Text>
                <Text style={styles.value}>{expense.amountTotal.toFixed(2)} zł</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>
                    {new Date(expense.expenseDate).toLocaleDateString('pl-PL')}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Payer:</Text>
                <Text style={styles.value}>{expense.payer.email}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Split:</Text>
                <Text style={styles.value}>{expense.splitType}</Text>
            </View>

            <Text style={styles.sectionTitle}>Participants</Text>
            {expense.shares.map((share) => (
                <View key={share.user.id} style={styles.participantItem}>
                    <View style={styles.participantInfo}>
                        <Text style={styles.participantEmail}>{share.user.email}</Text>
                        <Text style={styles.participantAmount}>{share.amount.toFixed(2)} zł</Text>
                    </View>
                    {isPayer && share.user.id !== user?.id && expense.shares.length > 1 && (
                        <TouchableOpacity onPress={() => handleDeleteParticipant(share.user.id)}>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginBottom: 16,
    },
    backText: {
        color: '#0a7ea4',
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#687076',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 15,
        color: '#687076',
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 8,
    },
    participantInfo: {
        flex: 1,
    },
    participantEmail: {
        fontSize: 15,
        fontWeight: '500',
    },
    participantAmount: {
        fontSize: 13,
        color: '#687076',
        marginTop: 2,
    },
    removeText: {
        color: '#ff3b30',
        fontSize: 13,
        fontWeight: '500',
    },
});
