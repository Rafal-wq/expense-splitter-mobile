import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { usersService } from '@/services/users.service';
import { SimpleUserResponse } from '@/types';

export default function CreateExpenseScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [participants, setParticipants] = useState<SimpleUserResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SimpleUserResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await usersService.searchUsers(query);
            const filtered = results.filter(
                (u) => !participants.find((p) => p.id === u.id)
            );
            setSearchResults(filtered);
        } catch {
            setSearchResults([]);
        }
    };

    const handleAddParticipant = (user: SimpleUserResponse) => {
        setParticipants([...participants, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveParticipant = (userId: string) => {
        setParticipants(participants.filter((p) => p.id !== userId));
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Błąd', 'Podaj tytuł wydatku');
            return;
        }
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert('Błąd', 'Podaj poprawną kwotę');
            return;
        }
        if (!expenseDate) {
            Alert.alert('Błąd', 'Podaj datę');
            return;
        }
        setLoading(true);
        try {
            await expensesService.createExpense({
                title: title.trim(),
                description: description.trim() || undefined,
                amount: parseFloat(amount),
                participants: participants.map((p) => ({ userId: p.id })),
                expenseDate: new Date(expenseDate).toISOString(),
            });
            Alert.alert('Sukces', 'Wydatek został utworzony', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Błąd', 'Nie udało się utworzyć wydatku');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Nowy wydatek</Text>

            <TextInput
                style={styles.input}
                placeholder="Tytuł"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Opis (opcjonalny)"
                value={description}
                onChangeText={setDescription}
            />
            <TextInput
                style={styles.input}
                placeholder="Kwota"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
            />
            <TextInput
                style={styles.input}
                placeholder="Data (RRRR-MM-DD)"
                value={expenseDate}
                onChangeText={setExpenseDate}
            />

            <Text style={styles.sectionTitle}>Uczestnicy</Text>
            <TextInput
                style={styles.input}
                placeholder="Szukaj użytkowników..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
            />

            {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                    {searchResults.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.searchResult}
                            onPress={() => handleAddParticipant(item)}
                        >
                            <Text style={styles.searchResultName}>{item.firstName} {item.lastName}</Text>
                            <Text style={styles.searchResultEmail}>{item.email}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {participants.length > 0 && (
                <View style={styles.participantsList}>
                    {participants.map((item) => (
                        <View key={item.id} style={styles.participantItem}>
                            <View style={styles.participantInfo}>
                                <Text style={styles.participantName}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.participantEmail}>{item.email}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveParticipant(item.id)}>
                                <Text style={styles.removeText}>Usuń</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Tworzenie...' : 'Utwórz wydatek'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    searchResultsContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
    },
    searchResult: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchResultName: {
        fontSize: 16,
        fontWeight: '500',
    },
    searchResultEmail: {
        fontSize: 13,
        color: '#687076',
    },
    participantsList: {
        marginBottom: 16,
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
    participantName: {
        fontSize: 16,
        fontWeight: '500',
    },
    participantEmail: {
        fontSize: 13,
        color: '#687076',
    },
    removeText: {
        color: '#ff3b30',
        fontSize: 13,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: '#687076',
        fontSize: 16,
    },
});
