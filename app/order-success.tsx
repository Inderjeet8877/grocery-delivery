import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '../constants/theme';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    return (
        <View style={styles.container}>
            <IconButton
                icon="check-circle"
                size={100}
                iconColor={THEME.colors.success}
                style={styles.icon}
            />

            <Text variant="headlineMedium" style={styles.title}>Order placed</Text>

            <Text variant="bodyLarge" style={styles.subtitle}>
                Thanks for your order. Pay in cash when it arrives.
            </Text>

            {orderId && (
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Order ID</Text>
                    <Text style={styles.orderIdValue}>#{orderId.substring(0, 6).toUpperCase()}</Text>
                </View>
            )}

            <View style={styles.actions}>
                <Button
                    mode="contained"
                    onPress={() => router.replace(`/(tabs)/orders`)}
                    buttonColor={THEME.colors.primary}
                    style={styles.button}
                >
                    Track order
                </Button>
                <Button
                    mode="outlined"
                    onPress={() => router.replace(`/(tabs)/home`)}
                    textColor={THEME.colors.primary}
                    style={styles.button}
                >
                    Keep shopping
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    icon: {
        marginBottom: 24,
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
        marginBottom: 32,
        lineHeight: 24,
    },
    orderIdContainer: {
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        alignItems: 'center',
        marginBottom: 48,
        width: '100%',
        elevation: 1,
    },
    orderIdLabel: {
        color: THEME.colors.textSecondary,
        marginBottom: 4,
    },
    orderIdValue: {
        fontFamily: THEME.fonts.bold,
        fontSize: 20,
        color: THEME.colors.primary,
    },
    actions: {
        width: '100%',
        gap: 16,
    },
    button: {
        borderRadius: THEME.sizes.radius,
        paddingVertical: 6,
    },
});
