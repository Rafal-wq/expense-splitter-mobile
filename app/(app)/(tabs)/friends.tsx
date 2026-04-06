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
} from 'react-native';
import { friendsService } from '@/services/friends.service';
import { FriendshipResponse } from '@/types';

export default function FriendsScreen() {
    const [friends, setFriends] = useState<FriendshipResponse[]>([]);
    const [pendingReceived, setPendingReceived] = useState<FriendshipResponse[]>([]);
    const [pendingSent, setPendingSent] = useState<FriendshipResponse[]>([]);
    const [recipientId, setRecipientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [accepted, pending] = await Promise.all([
                friendsService.getFriendships('ACCEPTED'),
                friendsService.getFriendships('PENDING'),
            ]);
            setFriends(accepted);
            setPendingReceived(pending);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || error?.message || 'Unknown error');
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        loadData().finally(() => setLoading(false));
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const handleSendRequest = async () => {
        if (!recipientId.trim()) {
            Alert.alert('Error', 'Please enter a user ID');
            return;
        }
        try {
            await friendsService.sendFriendRequest(recipientId.trim());
            Alert.alert('Success', 'Friend request sent');
            setRecipientId('');
            await loadData();
        } catch {
            Alert.alert('Error', 'Failed to send friend request');
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await friendsService.acceptFriendRequest(id);
            await loadData();
        } catch {
            Alert.alert('Error', 'Failed to accept friend request');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await friendsService.rejectFriendRequest(id);
            await loadData();
        } catch {
            Alert.alert('Error', 'Failed to reject friend request');
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Friend', 'Are you sure you want to remove this friend?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await friendsService.deleteFriendship(id);
                        await loadData();
                    } catch {
                        Alert.alert('Error', 'Failed to delete friend');
                    }
                },
            },
        ]);
    };

    const renderFriend = ({ item }: { item: FriendshipResponse }) => (
        <View style={styles.item}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                    {item.requester.email}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPendingRequest = ({ item }: { item: FriendshipResponse }) => (
        <View style={styles.item}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.requester.email}</Text>
                <Text style={styles.itemSubtitle}>Wants to be your friend</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleAccept(item.id)} style={styles.acceptButton}>
                    <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(item.id)} style={styles.rejectButton}>
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.sendRequest}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter user ID to add friend"
                    value={recipientId}
                    onChangeText={setRecipientId}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendRequest}>
                    <Text style={styles.sendButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {pendingReceived.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Friend Requests</Text>
                    <FlatList
                        data={pendingReceived}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPendingRequest}
                        scrollEnabled={false}
                    />
                </>
            )}

            <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFriend}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No friends yet</Text>}
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
    sendRequest: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
        marginTop: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: '#687076',
        marginTop: 16,
    },
});
