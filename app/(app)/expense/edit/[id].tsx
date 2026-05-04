import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';

export default function EditExpenseScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadExpense = useCallback(async () => {
        if (!id) return;
        try {
            const data = await expensesService.getExpense(id);
            setTitle(data.title);
            setDescription(data.description ?? '');
            setAmount(data.amountTotal.toString());
        } catch {
            Alert.alert('Błąd', 'Nie udało się załadować wydatku');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadExpense();
    }, [loadExpense]);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Błąd', 'Tytuł jest wymagany');
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Błąd', 'Podaj poprawną kwotę');
            return;
        }
        if (!id) return;
        setSaving(true);
        try {
            await expensesService.updateExpense(id, {
                title: title.trim(),
                description: description.trim() || undefined,
                amount: parsedAmount,
            });
            Alert.alert('Sukces', 'Wydatek został zaktualizowany', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Błąd', 'Nie udało się zaktualizować wydatku');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Wróć</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Edytuj wydatek</Text>

            <Text style={styles.label}>Tytuł</Text>
            <TextInput style={styles.input} placeholder="Tytuł" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Opis (opcjonalny)</Text>
            <TextInput style={[styles.input, styles.multilineInput]} placeholder="Opis" value={description} onChangeText={setDescription} multiline numberOfLines={3} />

            <Text style={styles.label}>Kwota (zł)</Text>
            <TextInput style={styles.input} placeholder="Kwota" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { marginBottom: 16 },
    backText: { color: '#0a7ea4', fontSize: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    label: { fontSize: 14, color: '#687076', marginBottom: 4 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
    multilineInput: { height: 80, textAlignVertical: 'top' },
    saveButton: { backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { padding: 16, alignItems: 'center' },
    cancelText: { color: '#687076', fontSize: 16 },
});
