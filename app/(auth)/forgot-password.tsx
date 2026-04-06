import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            Alert.alert('Success', 'If an account exists for this email, you will receive a password reset link', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') },
            ]);
        } finally {
            setLoading(false);
        }
    };

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
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>Back to Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
