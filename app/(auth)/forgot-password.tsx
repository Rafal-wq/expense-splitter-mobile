import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth.service';
import { showError, showSuccess } from '@/utils/toast';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [step, setStep] = useState<'email' | 'confirm'>('email');

    const handleResetPassword = async () => {
        if (!email) {
            showError('Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            await authService.resetPassword(email);
            setStep('confirm');
        } catch {
            showError('Failed to send reset email. Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async () => {
        if (!token || !newPassword || !repeatNewPassword) {
            showError('Please fill in all fields');
            return;
        }
        if (newPassword !== repeatNewPassword) {
            showError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await authService.confirmResetPassword(token, newPassword, repeatNewPassword);
            showSuccess('Password reset successfully');
            router.replace('/(auth)/login');
        } catch {
            showError('Failed to reset password. Check your token and try again');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'confirm') {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.description}>
                    Enter the token from your email and set a new password.
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Reset token"
                    value={token}
                    onChangeText={setToken}
                    autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="New password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Repeat new password"
                        value={repeatNewPassword}
                        onChangeText={setRepeatNewPassword}
                        secureTextEntry={!showRepeatPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRepeatPassword(!showRepeatPassword)} style={styles.eyeButton}>
                        <Text style={styles.eyeText}>{showRepeatPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleConfirmReset} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('email')}>
                    <Text style={styles.link}>Back</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
                Enter your email address and we'll send you a link to reset your password.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>Back to Sign In</Text>
            </TouchableOpacity>
        </View>
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
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#687076',
        textAlign: 'center',
        marginBottom: 32,
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
