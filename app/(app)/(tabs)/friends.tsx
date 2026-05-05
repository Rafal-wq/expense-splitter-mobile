import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { friendsService } from '@/services/friends.service';
import { usersService } from '@/services/users.service';
import { cacheService, CACHE_KEYS } from '@/services/cache.service';
import { FriendshipResponse, SimpleUserResponse, UserResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function FriendsScreen() {
    const [friends, setFriends] = useState<FriendshipResponse[]>([]);
    const [pendingReceived, setPendingReceived] = useState<FriendshipResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SimpleUserResponse[]>([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuthStore();

    const loadData = useCallback(async () => {
        try {
            const [accepted, pending] = await Promise.all([
                friendsService.getFriendships('ACCEPTED'),
                friendsService.getFriendships('PENDING'),
            ]);
            setFriends(accepted);
            setPendingReceived(pending.filter((f) => f.recipient.id === user?.id));
            await cacheService.set(CACHE_KEYS.FRIENDS, accepted);
        } catch {
            const cached = await cacheService.get<FriendshipResponse[]>(CACHE_KEYS.FRIENDS);
            if (cached) {
                setFriends(cached);
            } else {
                Alert.alert('Błąd', 'Nie udało się załadować listy znajomych');
            }
        }
    }, [user]);

    useEffect(() => {
        setLoading(true);
        loadData().finally(() => setLoading(false));
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const results = await usersService.searchUsers(query);
            setSearchResults(results);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async (recipientId: string) => {
        try {
            await friendsService.sendFriendRequest(recipientId);
            Alert.alert('Sukces', 'Zaproszenie do znajomych zostało wysłane');
            setSearchQuery('');
            setSearchResults([]);
            await loadData();
        } catch {
            Alert.alert('Błąd', 'Nie udało się wysłać zaproszenia');
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await friendsService.acceptFriendRequest(id);
            await loadData();
        } catch {
            Alert.alert('Błąd', 'Nie udało się zaakceptować zaproszenia');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await friendsService.rejectFriendRequest(id);
            await loadData();
        } catch {
            Alert.alert('Błąd', 'Nie udało się odrzucić zaproszenia');
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Usuń znajomego', 'Czy na pewno chcesz usunąć tę osobę ze znajomych?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Usuń',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await friendsService.deleteFriendship(id);
                        await loadData();
                    } catch {
                        Alert.alert('Błąd', 'Nie udało się usunąć znajomego');
                    }
                },
            },
        ]);
    };

    const getFriendUser = (friendship: FriendshipResponse): UserResponse => {
        return friendship.requester.id === user?.id
            ? friendship.recipient
            : friendship.requester;
    };

    const renderSearchResult = ({ item }: { item: SimpleUserResponse }) => (
        <TouchableOpacity style={styles.searchResult} onPress={() => handleSendRequest(item.id)}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.itemSubtitle}>{item.email}</Text>
            </View>
            <Text style={styles.addText}>+ Dodaj</Text>
        </TouchableOpacity>
    );

    const renderFriend = ({ item }: { item: FriendshipResponse }) => {
        const friend = getFriendUser(item);
        return (
            <View style={styles.item}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{friend.email}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Usuń</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderPendingRequest = ({ item }: { item: FriendshipResponse }) => (
        <View style={styles.item}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.requester.email}</Text>
                <Text style={styles.itemSubtitle}>Chce zostać Twoim znajomym</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleAccept(item.id)} style={styles.acceptButton}>
                    <Text style={styles.acceptText}>Akceptuj</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(item.id)} style={styles.rejectButton}>
                    <Text style={styles.rejectText}>Odrzuć</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <TextInput
                style={styles.searchInput}
                placeholder="Szukaj użytkowników po nazwie lub emailu..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
            />

            {searching && <Text style={styles.loadingText}>Szukam...</Text>}

            {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id}
                        renderItem={renderSearchResult}
                        scrollEnabled={false}
                    />
                </View>
            )}

            {pendingReceived.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Zaproszenia ({pendingReceived.length})</Text>
                    <FlatList
                        data={pendingReceived}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPendingRequest}
                        scrollEnabled={false}
                    />
                </>
            )}

            <Text style={styles.sectionTitle}>Znajomi ({friends.length})</Text>
            {loading ? (
                <Text style={styles.loadingText}>Ładowanie...</Text>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFriend}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>Brak znajomych</Text>}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 8,
    },
    searchResultsContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
    },
    searchResult: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    addText: {
        color: '#0a7ea4',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
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
    itemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#687076',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 6,
        padding: 8,
    },
    acceptText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    rejectButton: {
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    rejectText: {
        color: '#687076',
        fontWeight: 'bold',
        fontSize: 13,
    },
    deleteButton: {
        padding: 8,
    },
    deleteText: {
        color: '#ff3b30',
        fontSize: 13,
        fontWeight: '500',
    },
    loadingText: {
        textAlign: 'center',
        color: '#687076',
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#687076',
        marginTop: 16,
    },
});
