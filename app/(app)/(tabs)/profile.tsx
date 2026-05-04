import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { profileService } from '@/services/profile.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { DetailedUserResponse } from '@/types';

type ActiveSection = 'info' | 'editProfile' | 'changePassword';

export default function ProfileScreen() {
    const { logout, setUser } = useAuthStore();
    const [profile, setProfile] = useState<DetailedUserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<ActiveSection>('info');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');

    const loadProfile = useCallback(async () => {
        try {
            const data = await profileService.getMe();
            setProfile(data);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setEmail(data.email);
        } catch {
            Alert.alert('Błąd', 'Nie udało się załadować profilu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSaveProfile = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            Alert.alert('Błąd', 'Wszystkie pola są wymagane');
            return;
        }
        setSaving(true);
        try {
            const updated = await profileService.updateProfile({ firstName, lastName, email });
            setProfile(updated);
            setUser(updated);
            setActiveSection('info');
            Alert.alert('Sukces', 'Profil został zaktualizowany');
        } catch {
            Alert.alert('Błąd', 'Nie udało się zaktualizować profilu');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !repeatNewPassword) {
            Alert.alert('Błąd', 'Wszystkie pola są wymagane');
            return;
        }
        if (newPassword !== repeatNewPassword) {
            Alert.alert('Błąd', 'Nowe hasła nie są identyczne');
            return;
        }
        setSaving(true);
        try {
            await profileService.changePassword({ oldPassword, newPassword, repeatNewPassword });
            setOldPassword('');
            setNewPassword('');
            setRepeatNewPassword('');
            setActiveSection('info');
            Alert.alert('Sukces', 'Hasło zostało zmienione');
        } catch {
            Alert.alert('Błąd', 'Nie udało się zmienić hasła. Sprawdź czy obecne hasło jest poprawne.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Wylogowanie', 'Czy na pewno chcesz się wylogować?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Wyloguj',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await authService.logout();
                    } finally {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.center}>
                <Text>Nie udało się załadować profilu</Text>
                <TouchableOpacity onPress={loadProfile} style={styles.retryButton}>
                    <Text style={styles.retryText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {activeSection === 'info' && (
                <>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {profile.firstName.charAt(0).toUpperCase()}{profile.lastName.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
                    <Text style={styles.emailText}>{profile.email}</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Rola</Text>
                            <Text style={styles.infoValue}>{profile.role === 'ADMIN' ? 'Administrator' : 'Użytkownik'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Konto od</Text>
                            <Text style={styles.infoValue}>
                                {new Date(profile.createdAt).toLocaleDateString('pl-PL')}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.actionButton} onPress={() => setActiveSection('editProfile')}>
                        <Text style={styles.actionButtonText}>Edytuj profil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => setActiveSection('changePassword')}>
                        <Text style={styles.actionButtonText}>Zmień hasło</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Wyloguj się</Text>
                    </TouchableOpacity>
                </>
            )}

            {activeSection === 'editProfile' && (
                <>
                    <Text style={styles.sectionTitle}>Edytuj profil</Text>
                    <Text style={styles.label}>Imię</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Imię" />
                    <Text style={styles.label}>Nazwisko</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Nazwisko" />
                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
                        <Text style={styles.saveButtonText}>{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveSection('info')}>
                        <Text style={styles.cancelText}>Anuluj</Text>
                    </TouchableOpacity>
                </>
            )}

            {activeSection === 'changePassword' && (
                <>
                    <Text style={styles.sectionTitle}>Zmień hasło</Text>
                    <Text style={styles.label}>Obecne hasło</Text>
                    <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} placeholder="Obecne hasło" secureTextEntry />
                    <Text style={styles.label}>Nowe hasło</Text>
                    <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Nowe hasło" secureTextEntry />
                    <Text style={styles.label}>Powtórz nowe hasło</Text>
                    <TextInput style={styles.input} value={repeatNewPassword} onChangeText={setRepeatNewPassword} placeholder="Powtórz nowe hasło" secureTextEntry />
                    <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={saving}>
                        <Text style={styles.saveButtonText}>{saving ? 'Zapisywanie...' : 'Zmień hasło'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveSection('info')}>
                        <Text style={styles.cancelText}>Anuluj</Text>
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0a7ea4', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    emailText: { fontSize: 15, color: '#687076', marginBottom: 24 },
    infoCard: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 24, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    infoLabel: { fontSize: 15, color: '#687076' },
    infoValue: { fontSize: 15, fontWeight: '500' },
    actionButton: { width: '100%', padding: 14, borderWidth: 1, borderColor: '#0a7ea4', borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    actionButtonText: { color: '#0a7ea4', fontSize: 16, fontWeight: '600' },
    logoutButton: { width: '100%', padding: 14, borderWidth: 1, borderColor: '#ff3b30', borderRadius: 8, alignItems: 'center', marginTop: 8 },
    logoutText: { color: '#ff3b30', fontSize: 16, fontWeight: '600' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, alignSelf: 'flex-start' },
    label: { fontSize: 14, color: '#687076', alignSelf: 'flex-start', marginBottom: 4 },
    input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
    saveButton: { width: '100%', backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { width: '100%', padding: 14, alignItems: 'center' },
    cancelText: { color: '#687076', fontSize: 16 },
    retryButton: { marginTop: 12, padding: 12 },
    retryText: { color: '#0a7ea4', fontSize: 15 },
});
