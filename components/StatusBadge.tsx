import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { THEME } from '../constants/theme';
import { OrderStatus } from '../types';

const STATUS_COLORS: Record<OrderStatus, string> = {
    Pending: THEME.colors.pending,
    Confirmed: THEME.colors.info,
    'Out for Delivery': THEME.colors.transit,
    Delivered: THEME.colors.success,
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const color = STATUS_COLORS[status] ?? THEME.colors.textSecondary;

    return (
        // '1F' is a 12% alpha suffix on the 6-digit hex
        <View style={[styles.badge, { backgroundColor: color + '1F' }]}>
            <Text style={[styles.text, { color }]}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    text: {
        fontFamily: THEME.fonts.bold,
        fontSize: THEME.sizes.small,
    },
});
