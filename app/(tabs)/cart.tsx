import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, IconButton, Button, Divider } from 'react-native-paper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { DELIVERY_FEE, THEME } from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
    const router = useRouter();
    const { items, updateQuantity, removeFromCart, getSubtotal } = useCartStore();

    const subtotal = getSubtotal();
    const total = subtotal + DELIVERY_FEE;

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to proceed.');
            return;
        }
        router.push('/checkout');
    };

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text variant="headlineSmall" style={styles.emptyTitle}>Your cart is empty</Text>
                <Text variant="bodyLarge" style={styles.emptySubtitle}>
                    Add a few things and they will show up here.
                </Text>
                <Button
                    mode="contained"
                    onPress={() => router.push('/(tabs)/home')}
                    buttonColor={THEME.colors.primary}
                    style={styles.shopButton}
                >
                    Browse groceries
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listHeader}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text variant="titleMedium" numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                            <Text variant="bodyMedium" style={styles.itemPrice}>₹{item.price}</Text>

                            <View style={styles.quantityRow}>
                                <View style={styles.quantityControls}>
                                    <IconButton
                                        icon="minus"
                                        size={16}
                                        mode="contained-tonal"
                                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                    />
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                    <IconButton
                                        icon="plus"
                                        size={16}
                                        mode="contained-tonal"
                                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    />
                                </View>
                                <IconButton
                                    icon="trash-can-outline"
                                    iconColor={THEME.colors.error}
                                    size={24}
                                    onPress={() => removeFromCart(item.id)}
                                />
                            </View>
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text variant="bodyLarge" style={styles.summaryLabel}>Subtotal</Text>
                    <Text variant="bodyLarge" style={styles.summaryValue}>₹{subtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text variant="bodyLarge" style={styles.summaryLabel}>Delivery</Text>
                    <Text variant="bodyLarge" style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.summaryRow}>
                    <Text variant="titleLarge" style={styles.totalLabel}>Total</Text>
                    <Text variant="titleLarge" style={styles.totalValue}>₹{total}</Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleCheckout}
                    buttonColor={THEME.colors.primary}
                    style={styles.checkoutButton}
                    contentStyle={{ height: 56 }}
                >
                    Checkout
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
    listHeader: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.surface,
        padding: 12,
        borderRadius: THEME.sizes.radius,
        marginBottom: 12,
        elevation: 1,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: THEME.sizes.radius,
        backgroundColor: THEME.colors.background,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemName: {
        fontFamily: THEME.fonts.bold,
    },
    itemPrice: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.primary,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity: {
        fontFamily: THEME.fonts.bold,
        marginHorizontal: 8,
        fontSize: 16,
    },
    footer: {
        backgroundColor: THEME.colors.surface,
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: THEME.colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
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
    divider: {
        marginVertical: 12,
    },
    totalLabel: {
        fontFamily: THEME.fonts.bold,
    },
    totalValue: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.primary,
    },
    checkoutButton: {
        marginTop: 24,
        borderRadius: THEME.sizes.radius,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: THEME.colors.background,
    },
    emptyTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 8,
    },
    emptySubtitle: {
        textAlign: 'center',
        color: THEME.colors.textSecondary,
        marginBottom: 24,
    },
    shopButton: {
        borderRadius: THEME.sizes.radius,
    },
});
