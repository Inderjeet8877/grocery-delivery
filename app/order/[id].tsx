import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../../utils/format';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { THEME } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ReviewModal } from '../../components/ReviewModal';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/authStore';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = useAuthStore(state => state.user);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewVisible, setReviewVisible] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        const unsub = orderService.observeOrderDetails(id, (data) => {
            setOrder(data);
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (!order || !user) return;
        setReviewLoading(true);
        try {
            for (const item of order.items) {
                await productService.addReview(item.id, {
                    userId: user.uid,
                    userName: user.name,
                    rating,
                    comment
                });
            }
            await orderService.markOrderReviewed(order.id);
            setReviewVisible(false);
            Alert.alert('Success', 'Thank you for your rating!');
        } catch {
            Alert.alert('Error', 'Could not submit review. Try again.');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return null;
    if (!order) return <View style={styles.centerContainer}><Text>Order not found</Text></View>;

    const steps = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(order.status);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <View style={styles.header}>
                        <View>
                            <Text variant="titleMedium" style={styles.orderId}>Order #{order.id.substring(0, 6).toUpperCase()}</Text>
                            <Text variant="bodySmall" style={styles.date}>
                                {formatDateTime(order.createdAt)}
                            </Text>
                        </View>
                        <StatusBadge status={order.status as OrderStatus} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Tracking</Text>
                    <View style={styles.stepperContainer}>
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isLast = index === steps.length - 1;
                            return (
                                <View key={step} style={styles.stepRow}>
                                    <View style={styles.stepIndicator}>
                                        <View style={[styles.circle, isCompleted && styles.circleActive]} />
                                        {!isLast && <View style={[styles.line, index < currentStepIndex && styles.lineActive]} />}
                                    </View>
                                    <Text style={[styles.stepText, isCompleted && styles.stepTextActive]}>{step}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {order.status === 'Delivered' && !order.reviewed && (
                        <Button
                            mode="contained"
                            buttonColor={THEME.colors.secondary}
                            onPress={() => setReviewVisible(true)}
                            style={styles.reviewButton}
                        >
                            Rate Your Order
                        </Button>
                    )}
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Delivery details</Text>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressName}>{order.customerName}</Text>
                        <Text style={styles.addressText}>{order.address.fullAddress}</Text>
                        <Text style={styles.addressText}>{order.address.pincode}</Text>
                        {order.address.landmark ? <Text style={styles.addressText}>Landmark: {order.address.landmark}</Text> : null}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Items</Text>
                    <View style={styles.card}>
                        {order.items.map((item, index) => (
                            <View key={item.id}>
                                <View style={styles.itemRow}>
                                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                                </View>
                                {index < order.items.length - 1 && <Divider style={styles.divider} />}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.card}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{order.subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery</Text>
                            <Text style={styles.summaryValue}>₹{order.deliveryFee}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{order.total}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Payment Method</Text>
                            <Text style={styles.summaryValue}>{order.paymentMethod}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <ReviewModal
                visible={reviewVisible}
                onDismiss={() => setReviewVisible(false)}
                onSubmit={handleReviewSubmit}
                loading={reviewLoading}
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
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        elevation: 1,
    },
    orderId: {
        fontFamily: THEME.fonts.bold,
    },
    date: {
        color: THEME.colors.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 12,
    },
    stepperContainer: {
        backgroundColor: THEME.colors.surface,
        padding: 24,
        borderRadius: THEME.sizes.radius,
        elevation: 1,
    },
    stepRow: {
        flexDirection: 'row',
        height: 60,
    },
    stepIndicator: {
        width: 24,
        alignItems: 'center',
        marginRight: 16,
    },
    circle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: THEME.colors.border,
        zIndex: 1,
    },
    circleActive: {
        backgroundColor: THEME.colors.primary,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: THEME.colors.border,
        marginTop: -2,
    },
    lineActive: {
        backgroundColor: THEME.colors.primary,
    },
    stepText: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.textSecondary,
        flex: 1,
        marginTop: -2, 
    },
    stepTextActive: {
        color: THEME.colors.textPrimary,
        fontFamily: THEME.fonts.bold,
    },
    reviewButton: {
        marginTop: 16,
        borderRadius: THEME.sizes.radius,
    },
    addressCard: {
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        elevation: 1,
    },
    addressName: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 4,
    },
    addressText: {
        color: THEME.colors.textSecondary,
        fontSize: 14,
    },
    card: {
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        elevation: 1,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: THEME.colors.background,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontFamily: THEME.fonts.medium,
    },
    itemMeta: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
    },
    itemPrice: {
        fontFamily: THEME.fonts.bold,
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
});
