import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { THEME } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function SignupScreen() {
    const router = useRouter();
    const setUser = useAuthStore(state => state.setUser);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const user = await authService.register(email, password, name, phone);
            setUser(user);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'Could not create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.content}>
                    <Text variant="headlineLarge" style={styles.title}>Create account</Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>Sign up to get started</Text>

                    <TextInput
                        mode="outlined"
                        label="Full name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        outlineColor={THEME.colors.border}
                        activeOutlineColor={THEME.colors.primary}
                    />

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
                        label="Phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
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

                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        buttonColor={THEME.colors.primary}
                    >
                        Sign up
                    </Button>

                    <View style={styles.footer}>
                        <Text variant="bodyMedium">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Text style={styles.link}>Log in</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
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
    button: {
        borderRadius: THEME.sizes.radius,
        marginTop: 16,
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
