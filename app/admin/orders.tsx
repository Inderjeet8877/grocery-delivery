import React, { useEffect, useMemo, useState } from 'react';
import { formatDateTime } from '../../utils/format';
import { Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Divider, IconButton, Modal, Portal, Text } from 'react-native-paper';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { StatusBadge } from '../../components/StatusBadge';
import { THEME } from '../../constants/theme';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';

const TABS = ['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];

export default function AdminOrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedTab, setSelectedTab] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [customerPhone, setCustomerPhone] = useState<string | null>(null);
    const [loadingPhone, setLoadingPhone] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = orderService.observeAllOrders(setOrders);
        return () => unsub();
    }, []);

    const filteredOrders = useMemo(() => {
        if (selectedTab === 'All') return orders;
        return orders.filter(o => o.status === selectedTab);
    }, [orders, selectedTab]);

    const handleUpdateStatus = async (status: OrderStatus) => {
        if (!selectedOrder) return;
        setLoading(true);
        try {
            await orderService.updateOrderStatus(selectedOrder.id, status);

            const user = await authService.getUserProfile(selectedOrder.userId);
            if (user?.expoPushToken && user.notificationsEnabled) {
                let title = 'Order Update';
                let body = `Your order #${selectedOrder.id.substring(0, 6).toUpperCase()} status changed to ${status}`;

                if (status === 'Confirmed') {
                    title = 'Order confirmed';
                    body = 'Your order has been confirmed and is being processed.';
                } else if (status === 'Out for Delivery') {
                    title = 'Out for delivery';
                    body = 'Your order is on its way.';
                } else if (status === 'Delivered') {
                    title = 'Order delivered';
                    body = 'Tap to rate your order.';
                }

                await notificationService.sendPushNotification(user.expoPushToken, title, body, { orderId: selectedOrder.id });
            }

            setModalVisible(false);
            Alert.alert('Success', 'Order status updated');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const openOrderModal = async (order: Order) => {
        setSelectedOrder(order);
        setCustomerPhone(null);
        setModalVisible(true);

        setLoadingPhone(true);
        try {
            const user = await authService.getUserProfile(order.userId);
            if (user && user.phone) {
                setCustomerPhone(user.phone);
            }
        } catch (error) {
            console.warn('Could not load customer phone', error);
        } finally {
            setLoadingPhone(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, selectedTab === tab && styles.tabSelected]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No orders found.</Text>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInDown.delay(index * 100).springify()}
                        layout={Layout.springify()}
                    >
                        <TouchableOpacity style={styles.card} onPress={() => openOrderModal(item)}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.customerName}>{item.customerName}</Text>
                                <StatusBadge status={item.status} />
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={styles.infoText}>{item.items.length} items • ₹{item.total}</Text>
                                <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            />

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
                    {selectedOrder && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text variant="titleLarge" style={styles.modalTitle}>Order Details</Text>
                                <IconButton icon="close" onPress={() => setModalVisible(false)} style={{ margin: 0 }} />
                            </View>

                            <Text style={styles.label}>Customer Name</Text>
                            <Text style={styles.value}>{selectedOrder.customerName}</Text>

                            <Text style={styles.label}>Phone number</Text>
                            <Text style={styles.value}>
                                {loadingPhone ? 'Loading...' : (customerPhone || 'Not provided')}
                            </Text>

                            <Text style={styles.label}>Address</Text>
                            <Text style={styles.value}>
                                {selectedOrder.address.fullAddress}
                                {selectedOrder.address.landmark ? `\nLandmark: ${selectedOrder.address.landmark}` : ''}
                                {'\n'}Pincode: {selectedOrder.address.pincode}
                            </Text>

                            <Text style={styles.label}>Items</Text>
                            {selectedOrder.items.map(item => (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                                </View>
                            ))}

                            <Divider style={styles.divider} />

                            <View style={styles.itemRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>₹{selectedOrder.total}</Text>
                            </View>

                            <Text variant="titleMedium" style={styles.updateTitle}>Update Status</Text>
                            <View style={styles.statusButtons}>
                                {['Pending', 'Confirmed', 'Out for Delivery', 'Delivered'].map(status => (
                                    <Button
                                        key={status}
                                        mode={selectedOrder.status === status ? 'contained' : 'outlined'}
                                        onPress={() => handleUpdateStatus(status as OrderStatus)}
                                        loading={loading && selectedOrder.status !== status}
                                        disabled={loading || selectedOrder.status === status}
                                        style={styles.statusBtn}
                                        buttonColor={selectedOrder.status === status ? THEME.colors.primary : undefined}
                                        textColor={selectedOrder.status === status ? THEME.colors.white : THEME.colors.primary}
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </View>

                        </ScrollView>
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    tabContainer: {
        backgroundColor: THEME.colors.surface,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        borderRadius: 20,
        backgroundColor: THEME.colors.background,
    },
    tabSelected: {
        backgroundColor: THEME.colors.primary,
    },
    tabText: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.textSecondary,
    },
    tabTextSelected: {
        color: THEME.colors.white,
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        marginBottom: 12,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    customerName: {
        fontFamily: THEME.fonts.bold,
        fontSize: 16,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoText: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.primary,
    },
    dateText: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
    },
    modal: {
        backgroundColor: THEME.colors.surface,
        padding: 24,
        margin: 20,
        borderRadius: THEME.sizes.radius,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontFamily: THEME.fonts.bold,
    },
    label: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontFamily: THEME.fonts.medium,
        marginBottom: 16,
        fontSize: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        flex: 1,
        paddingRight: 16,
    },
    itemPrice: {
        fontFamily: THEME.fonts.medium,
    },
    divider: {
        marginVertical: 16,
    },
    totalLabel: {
        fontFamily: THEME.fonts.bold,
        fontSize: 18,
    },
    totalValue: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.primary,
        fontSize: 18,
    },
    updateTitle: {
        fontFamily: THEME.fonts.bold,
        marginTop: 24,
        marginBottom: 16,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusBtn: {
        marginBottom: 8,
    },
    emptyContainer: {
        paddingTop: 48,
        alignItems: 'center',
    },
    emptyText: {
        color: THEME.colors.textSecondary,
        fontStyle: 'italic',
    },
});
