import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email);
            Alert.alert('Success', 'Password reset email sent!', [
                { text: 'OK', onPress: () => router.push('/(auth)/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not send reset email');
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
                <Text variant="headlineLarge" style={styles.title}>Reset password</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Enter your email to receive a password reset link.
                </Text>

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

                <Button
                    mode="contained"
                    onPress={handleReset}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    buttonColor={THEME.colors.primary}
                >
                    Send reset link
                </Button>

                <Button
                    mode="text"
                    onPress={() => router.back()}
                    textColor={THEME.colors.textSecondary}
                >
                    Back to log in
                </Button>
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
        marginBottom: 24,
    },
    button: {
        borderRadius: THEME.sizes.radius,
        marginBottom: 16,
    },
    buttonContent: {
        height: 56,
    },
});
