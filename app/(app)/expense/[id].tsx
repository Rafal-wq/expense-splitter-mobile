import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { DetailedExpenseResponse, PaymentResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function ExpenseDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [expense, setExpense] = useState<DetailedExpenseResponse | null>(null);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    const loadData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [expenseData, paymentsData] = await Promise.all([
                expensesService.getExpense(id),
                expensesService.getPayments(id),
            ]);
            setExpense(expenseData);
            setPayments(paymentsData);
        } catch {
            Alert.alert('Błąd', 'Nie udało się załadować wydatku');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeleteParticipant = async (participantId: string) => {
        if (!id) return;
        Alert.alert('Usuń uczestnika', 'Czy na pewno chcesz usunąć tego uczestnika?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Usuń',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await expensesService.deleteParticipant(id, participantId);
                        await loadData();
                    } catch (error: any) {
                        Alert.alert('Błąd', error?.response?.data?.detail || error?.message || 'Nieznany błąd');
                    }
                },
            },
        ]);
    };

    const handleMarkAsPaid = async (amount: number) => {
        if (!id) return;
        Alert.alert('Potwierdź płatność', `Czy potwierdzasz otrzymanie ${amount.toFixed(2)} zł?`, [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Potwierdź',
                onPress: async () => {
                    try {
                        await expensesService.createPayment({ expenseId: id, amount });
                        await loadData();
                    } catch (error: any) {
                        const msg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Nieznany błąd';
                        Alert.alert('Błąd', msg);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Ładowanie...</Text>
            </View>
        );
    }

    if (!expense) {
        return (
            <View style={styles.center}>
                <Text>Nie znaleziono wydatku</Text>
            </View>
        );
    }

    const isPayer = expense.payer.id === user?.id;
    const myShare = expense.shares.find((s) => s.user.id === user?.id);
    const myPayments = isPayer
        ? payments
        : payments.filter((p) => p.payer.id === user?.id);
    const totalPaid = payments
        .filter((p) => p.payer.id === user?.id)
        .reduce((sum, p) => sum + p.amount, 0);
    const isSettled = myShare ? totalPaid >= myShare.amount : true;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Wróć</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{expense.title}</Text>

            {expense.description && (
                <Text style={styles.description}>{expense.description}</Text>
            )}

            <View style={styles.infoRow}>
                <Text style={styles.label}>Kwota:</Text>
                <Text style={styles.value}>{expense.amountTotal.toFixed(2)} zł</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Data:</Text>
                <Text style={styles.value}>
                    {new Date(expense.expenseDate).toLocaleDateString('pl-PL')}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Płacący:</Text>
                <Text style={styles.value}>{expense.payer.email}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>Podział:</Text>
                <Text style={styles.value}>{expense.splitType === 'EQUAL' ? 'Równy' : expense.splitType}</Text>
            </View>

            {isPayer && (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/(app)/expense/edit/${id}`)}
                >
                    <Text style={styles.editButtonText}>Edytuj wydatek</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Uczestnicy</Text>
            {expense.shares.map((share) => (
                <View key={share.user.id} style={styles.participantItem}>
                    <View style={styles.participantInfo}>
                        <Text style={styles.participantEmail}>{share.user.email}</Text>
                        <Text style={styles.participantAmount}>{share.amount.toFixed(2)} zł</Text>
                    </View>
                    {isPayer && share.user.id !== user?.id && expense.shares.length > 1 && (
                        <TouchableOpacity onPress={() => handleDeleteParticipant(share.user.id)}>
                            <Text style={styles.removeText}>Usuń</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            <Text style={styles.sectionTitle}>Płatności</Text>

            {!isPayer && myShare && !isSettled && (
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handleMarkAsPaid(myShare.amount - totalPaid)}
                >
                    <Text style={styles.payButtonText}>
                        Zgłoś wpłatę ({(myShare.amount - totalPaid).toFixed(2)} zł)
                    </Text>
                </TouchableOpacity>
            )}

            {!isPayer && myShare && isSettled && (
                <View style={styles.settledBadge}>
                    <Text style={styles.settledText}>Rozliczono</Text>
                </View>
            )}

            {myPayments.length === 0 ? (
                <Text style={styles.emptyText}>Brak płatności</Text>
            ) : (
                myPayments.map((payment) => (
                    <View key={payment.id} style={styles.paymentItem}>
                        <View style={styles.participantInfo}>
                            <Text style={styles.participantEmail}>
                                {isPayer
                                    ? `Od: ${payment.payer.email}`
                                    : `Do: ${expense.payer.email}`}
                            </Text>
                            <Text style={styles.participantAmount}>{payment.amount.toFixed(2)} zł</Text>
                        </View>
                        <View style={[styles.statusBadge, styles.statusCompleted]}>
                            <Text style={styles.statusText}>Zapłacono</Text>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { marginBottom: 16 },
    backText: { color: '#0a7ea4', fontSize: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    description: { fontSize: 14, color: '#687076', marginBottom: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    label: { fontSize: 15, color: '#687076' },
    value: { fontSize: 15, fontWeight: '500' },
    editButton: { marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#0a7ea4', borderRadius: 8, alignItems: 'center' },
    editButtonText: { color: '#0a7ea4', fontSize: 15, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
    participantItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
    participantInfo: { flex: 1 },
    participantEmail: { fontSize: 15, fontWeight: '500' },
    participantAmount: { fontSize: 13, color: '#687076', marginTop: 2 },
    removeText: { color: '#ff3b30', fontSize: 13, fontWeight: '500' },
    payButton: { backgroundColor: '#34c759', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    payButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    settledBadge: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    settledText: { color: '#2e7d32', fontSize: 15, fontWeight: '600' },
    paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusCompleted: { backgroundColor: '#e8f5e9' },
    statusPending: { backgroundColor: '#fff3e0' },
    statusText: { fontSize: 12, fontWeight: '600' },
    emptyText: { textAlign: 'center', color: '#687076', marginTop: 8 },
});
