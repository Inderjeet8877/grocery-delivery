import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, RadioButton, Divider, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { DELIVERY_FEE, THEME } from '../constants/theme';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/orderService';
import { AddressModal } from '../components/AddressModal';
import { Address } from '../types';
import { authService } from '../services/authService';

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, getSubtotal, clearCart } = useCartStore();
    const { user, setUser } = useAuthStore();

    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(
        user?.address?.length ? 0 : null
    );
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const subtotal = getSubtotal();
    const total = subtotal + DELIVERY_FEE;

    const handleAddAddress = async (address: Address) => {
        if (!user) return;
        setLoading(true);
        try {
            const updatedAddresses = [...(user.address || []), address];
            await authService.updateUserProfile(user.uid, { address: updatedAddresses });
            setUser({ ...user, address: updatedAddresses });
            setSelectedAddressIndex(updatedAddresses.length - 1);
            setAddressModalVisible(false);
        } catch {
            Alert.alert('Error', 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!user) return;
        if (selectedAddressIndex === null || !user.address[selectedAddressIndex]) {
            Alert.alert('Address needed', 'Please select or add a delivery address.');
            return;
        }

        setLoading(true);
        try {
            const orderId = await orderService.placeOrder({
                userId: user.uid,
                customerName: user.name,
                items,
                subtotal,
                deliveryFee: DELIVERY_FEE,
                total,
                address: user.address[selectedAddressIndex],
                paymentMethod: 'COD',
                status: 'Pending',
                createdAt: Date.now()
            });

            clearCart();
            router.replace(`/order-success?orderId=${orderId}`);
        } catch (e: any) {
            Alert.alert('Could not place order', e.message || 'Could not place order');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text>Your cart is empty.</Text>
                <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>Go Back</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Delivery address</Text>
                        <Button mode="text" onPress={() => setAddressModalVisible(true)} textColor={THEME.colors.primary}>
                            + Add new
                        </Button>
                    </View>

                    {user?.address && user.address.length > 0 ? (
                        user.address.map((addr, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.addressCard, selectedAddressIndex === index && styles.addressCardSelected]}
                                onPress={() => setSelectedAddressIndex(index)}
                            >
                                <RadioButton
                                    value={index.toString()}
                                    status={selectedAddressIndex === index ? 'checked' : 'unchecked'}
                                    onPress={() => setSelectedAddressIndex(index)}
                                    color={THEME.colors.primary}
                                />
                                <View style={styles.addressInfo}>
                                    <Text style={styles.addressLabel}>{addr.label}</Text>
                                    <Text style={styles.addressText}>{addr.fullAddress}</Text>
                                    <Text style={styles.addressText}>
                                        {addr.landmark ? addr.landmark + ', ' : ''}Pincode: {addr.pincode}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noAddressText}>No saved addresses. Please add one.</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Order summary</Text>
                    <View style={styles.summaryCard}>
                        {items.map(item => (
                            <View key={item.id} style={styles.summaryItemRow}>
                                <Text style={styles.summaryItemName} numberOfLines={1}>{item.quantity}x {item.name}</Text>
                                <Text style={styles.summaryItemPrice}>₹{item.price * item.quantity}</Text>
                            </View>
                        ))}
                        <Divider style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery</Text>
                            <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{total}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Payment method</Text>
                    <View style={styles.paymentCard}>
                        <IconButton icon="cash" size={24} iconColor={THEME.colors.primary} />
                        <Text style={styles.paymentText}>Cash on delivery</Text>
                        <IconButton icon="check-circle" size={24} iconColor={THEME.colors.success} style={{ marginLeft: 'auto' }} />
                    </View>
                    <Text style={styles.paymentNote}>Cash on delivery is the only payment option for now.</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Text variant="titleLarge" style={styles.totalValue}>₹{total}</Text>
                    <Button
                        mode="contained"
                        onPress={handlePlaceOrder}
                        loading={loading}
                        disabled={loading || selectedAddressIndex === null}
                        buttonColor={THEME.colors.primary}
                        style={styles.placeOrderButton}
                        contentStyle={{ height: 50, paddingHorizontal: 24 }}
                    >
                        Place order
                    </Button>
                </View>
            </View>

            <AddressModal
                visible={addressModalVisible}
                onDismiss={() => setAddressModalVisible(false)}
                onSave={handleAddAddress}
                loading={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontFamily: THEME.fonts.bold,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.surface,
        padding: 12,
        borderRadius: THEME.sizes.radius,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    addressCardSelected: {
        borderColor: THEME.colors.primary,
        backgroundColor: THEME.colors.primary + '10',
    },
    addressInfo: {
        flex: 1,
        marginLeft: 8,
    },
    addressLabel: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 4,
    },
    addressText: {
        color: THEME.colors.textSecondary,
        fontSize: 13,
    },
    noAddressText: {
        color: THEME.colors.textSecondary,
        fontStyle: 'italic',
        padding: 16,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        elevation: 1,
    },
    summaryItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryItemName: {
        flex: 1,
        fontFamily: THEME.fonts.regular,
        marginRight: 16,
    },
    summaryItemPrice: {
        fontFamily: THEME.fonts.medium,
    },
    divider: {
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: THEME.colors.textSecondary,
    },
    summaryValue: {
        fontFamily: THEME.fonts.medium,
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
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.sizes.radius,
        borderWidth: 1,
        borderColor: THEME.colors.primary,
        marginTop: 8,
    },
    paymentText: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.textPrimary,
    },
    paymentNote: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: THEME.colors.surface,
        padding: 16,
        elevation: 8,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.border,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeOrderButton: {
        borderRadius: THEME.sizes.radius,
    },
});
