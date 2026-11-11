import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../../utils/format';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export default function OrdersScreen() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (user?.uid) {
            const unsub = orderService.observeUserOrders(user.uid, setOrders);
            return () => unsub();
        }
    }, [user]);

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={styles.emptyText}>No orders yet. Your first one will show up here.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push(`/order/${item.id}`)}
                    >
                        <View style={styles.cardHeader}>
                            <Text variant="titleMedium" style={styles.orderId}>
                                Order #{item.id.substring(0, 6).toUpperCase()}
                            </Text>
                            <StatusBadge status={item.status} />
                        </View>

                        <View style={styles.cardBody}>
                            <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
                            <Text style={styles.items}>
                                {item.items.length} item{item.items.length > 1 ? 's' : ''} • ₹{item.total}
                            </Text>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        marginBottom: 16,
        elevation: 2,
        shadowColor: THEME.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontFamily: THEME.fonts.bold,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        color: THEME.colors.textSecondary,
        fontSize: THEME.sizes.medium,
    },
    items: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.primary,
    },
    emptyContainer: {
        paddingTop: 48,
        alignItems: 'center',
    },
    emptyText: {
        color: THEME.colors.textSecondary,
        fontFamily: THEME.fonts.medium,
    },
});
