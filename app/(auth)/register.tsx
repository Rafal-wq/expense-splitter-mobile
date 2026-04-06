import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth.service';
import axios from 'axios';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
        return null;
    };

    const validateEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleRegister = async () => {
        if (!email || !firstName || !lastName || !newPassword || !repeatNewPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            Alert.alert('Error', passwordError);
            return;
        }
        if (newPassword !== repeatNewPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await authService.register({ email, firstName, lastName, newPassword, repeatNewPassword });
            Alert.alert('Success', 'Account created successfully', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') },
            ]);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'Registration failed. Please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <Text style={styles.requirement}>• At least 8 characters</Text>
                <Text style={styles.requirement}>• At least one uppercase letter (A-Z)</Text>
                <Text style={styles.requirement}>• At least one lowercase letter (a-z)</Text>
                <Text style={styles.requirement}>• At least one number (0-9)</Text>
                <Text style={styles.requirement}>• At least one special character (!@#$...)</Text>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Repeat Password"
                    value={repeatNewPassword}
                    onChangeText={setRepeatNewPassword}
                    secureTextEntry={!showRepeatPassword}
                />
                <TouchableOpacity onPress={() => setShowRepeatPassword(!showRepeatPassword)} style={styles.eyeButton}>
                    <Text style={styles.eyeText}>{showRepeatPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Register'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>Already have an account? Sign In</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    eyeButton: {
        padding: 12,
    },
    eyeText: {
        fontSize: 18,
    },
    passwordRequirements: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#687076',
        marginBottom: 4,
    },
    requirement: {
        fontSize: 12,
        color: '#687076',
        marginTop: 2,
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
    link: {
        color: '#0a7ea4',
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
    },
});