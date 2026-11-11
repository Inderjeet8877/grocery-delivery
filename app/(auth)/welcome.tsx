import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, Redirect } from 'expo-router';
import { THEME } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function WelcomeScreen() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (!isLoading) {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                return <Redirect href="/admin" />;
            }
            return <Redirect href="/(tabs)/home" />;
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="basket" size={56} color={THEME.colors.white} />
                </View>

                <Text variant="headlineLarge" style={styles.title}>
                    Fresh groceries,{'\n'}delivered to you.
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Everyday essentials at your doorstep. Pay cash on delivery.
                </Text>
            </View>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    buttonColor={THEME.colors.primary}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    onPress={() => router.push('/(auth)/login')}
                >
                    Get started
                </Button>
            </View>
        </View>
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
        alignItems: 'center',
        padding: 24,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        backgroundColor: THEME.colors.primary,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontFamily: THEME.fonts.bold,
        textAlign: 'center',
        color: THEME.colors.textPrimary,
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: THEME.fonts.regular,
        textAlign: 'center',
        color: THEME.colors.textSecondary,
        marginBottom: 40,
    },
    footer: {
        padding: 24,
        paddingBottom: 48,
    },
    button: {
        borderRadius: THEME.sizes.radius,
    },
    buttonContent: {
        height: 56,
    },
});
