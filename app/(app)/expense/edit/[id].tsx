import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { showError, showSuccess } from '@/utils/toast';

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
            showError('Nie udało się załadować wydatku');
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
            showError('Tytuł jest wymagany');
            return;
        }
        if (!id) return;
        setSaving(true);
        try {
            await expensesService.updateExpense(id, {
                title: title.trim(),
                description: description.trim() || undefined,
            });
            showSuccess('Wydatek został zaktualizowany');
            router.back();
        } catch {
            showError('Nie udało się zaktualizować wydatku');
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
            <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={amount}
                editable={false}
            />
            <Text style={styles.helperText}>
                Kwoty wydatku nie można zmienić. Jeśli kwota się zmieniła, usuń ten wydatek i utwórz nowy.
            </Text>

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
    inputDisabled: { backgroundColor: '#f5f7f9', color: '#687076' },
    helperText: { fontSize: 13, color: '#687076', marginTop: -8, marginBottom: 16, fontStyle: 'italic' },
    multilineInput: { height: 80, textAlignVertical: 'top' },
    saveButton: { backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { padding: 16, alignItems: 'center' },
    cancelText: { color: '#687076', fontSize: 16 },
});
