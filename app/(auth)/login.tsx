import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { setTokens } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            await setTokens(response.accessToken, response.refreshToken);
            router.replace('/(app)/(tabs)/expenses');
        } catch {
            Alert.alert('Error', 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
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
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={styles.link}>Forgot password?</Text>
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