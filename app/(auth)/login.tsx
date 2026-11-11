import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { THEME } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const setUser = useAuthStore(state => state.setUser);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing details', 'Enter your email and password.');
            return;
        }

        setLoading(true);
        try {
            const user = await authService.login(email, password);
            setUser(user);
            if (user.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/(tabs)/home');
            }
        } catch (error: any) {
            Alert.alert('Could not log in', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <Text variant="headlineLarge" style={styles.title}>Welcome back</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>Sign in to continue</Text>

                <TextInput
                    mode="outlined"
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    outlineColor={THEME.colors.border}
                    activeOutlineColor={THEME.colors.primary}
                />

                <TextInput
                    mode="outlined"
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    outlineColor={THEME.colors.border}
                    activeOutlineColor={THEME.colors.primary}
                />

                <Link href="/(auth)/forgot-password" asChild>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                </Link>

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    buttonColor={THEME.colors.primary}
                >
                    Log in
                </Button>

                <View style={styles.footer}>
                    <Text variant="bodyMedium">New here? </Text>
                    <Link href="/(auth)/signup" asChild>
                        <Text style={styles.link}>Sign up</Text>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: THEME.fonts.regular,
        color: THEME.colors.textSecondary,
        marginBottom: 32,
    },
    input: {
        backgroundColor: THEME.colors.surface,
        marginBottom: 16,
    },
    forgotPassword: {
        color: THEME.colors.primary,
        fontFamily: THEME.fonts.medium,
        textAlign: 'right',
        marginBottom: 32,
    },
    button: {
        borderRadius: THEME.sizes.radius,
        marginBottom: 24,
    },
    buttonContent: {
        height: 56,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    link: {
        color: THEME.colors.primary,
        fontFamily: THEME.fonts.bold,
    },
});
