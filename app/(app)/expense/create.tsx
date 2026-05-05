import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { router } from 'expo-router';
import { expensesService } from '@/services/expenses.service';
import { usersService } from '@/services/users.service';
import { cacheService, CACHE_KEYS } from '@/services/cache.service';
import { offlineQueueService } from '@/services/offlineQueue.service';
import { showError, showSuccess, showInfo } from '@/utils/toast';
import { FriendshipResponse, SimpleUserResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function CreateExpenseScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [participants, setParticipants] = useState<SimpleUserResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SimpleUserResponse[]>([]);
    const [isOfflineSearch, setIsOfflineSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            setIsOfflineSearch(false);
            return;
        }
        try {
            const results = await usersService.searchUsers(query);
            const filtered = results.filter(
                (u) => !participants.find((p) => p.id === u.id)
            );
            setSearchResults(filtered);
            setIsOfflineSearch(false);
        } catch {
            // offline — szukaj wśród zapisanych znajomych
            const cachedFriends = await cacheService.get<FriendshipResponse[]>(CACHE_KEYS.FRIENDS);
            if (cachedFriends) {
                const lowerQuery = query.toLowerCase();
                const filtered = cachedFriends
                    .map((f) => (f.requester.id === user?.id ? f.recipient : f.requester))
                    .filter((u) => u.email.toLowerCase().includes(lowerQuery))
                    .filter((u) => !participants.find((p) => p.id === u.id))
                    .map((u) => ({
                        id: u.id,
                        email: u.email,
                        firstName: u.email.split('@')[0],
                        lastName: '',
                    }));
                setSearchResults(filtered);
                setIsOfflineSearch(true);
            } else {
                setSearchResults([]);
                setIsOfflineSearch(false);
            }
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
            showError('Podaj tytuł wydatku');
            return;
        }
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            showError('Podaj poprawną kwotę');
            return;
        }
        if (!expenseDate) {
            showError('Podaj datę');
            return;
        }
        setLoading(true);
        const payload = {
            title: title.trim(),
            description: description.trim() || undefined,
            amount: parseFloat(amount),
            participants: participants.map((p) => ({ userId: p.id })),
            expenseDate: new Date(expenseDate).toISOString(),
        };
        try {
            await expensesService.createExpense(payload);
            showSuccess('Wydatek został utworzony');
            router.back();
        } catch {
            await offlineQueueService.add(payload);
            showInfo('Tryb offline', 'Wydatek zostanie wysłany gdy wróci internet');
            router.back();
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

            {isOfflineSearch && searchResults.length > 0 && (
                <Text style={styles.offlineSearchLabel}>Tryb offline — wyniki z listy znajomych</Text>
            )}

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
    offlineSearchLabel: {
        fontSize: 12,
        color: '#c0392b',
        marginBottom: 4,
        marginTop: -8,
    },
});
