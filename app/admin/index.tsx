import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { Href, useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Order, Product } from '../../types';

export default function AdminDashboard() {
    const router = useRouter();
    const { logout } = useAuthStore();

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsubOrders = orderService.observeAllOrders(setOrders);
        const unsubProducts = productService.observeProducts(setProducts);
        return () => {
            unsubOrders();
            unsubProducts();
        };
    }, []);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ordersToday = orders.filter(o => o.createdAt >= today.getTime());
        const pendingOrders = orders.filter(o => o.status === 'Pending');
        const lowStock = products.filter(p => p.stock < 5);

        return {
            totalOrdersToday: ordersToday.length,
            pendingOrders: pendingOrders.length,
            totalProducts: products.length,
            lowStock: lowStock.length,
        };
    }, [orders, products]);

    const handleLogout = async () => {
        await authService.logout();
        logout();
        router.replace('/(auth)/welcome');
    };

    const NavCard = ({ title, icon, route, color }: { title: string; icon: string; route: Href; color: string }) => (
        <Card style={styles.navCard} onPress={() => router.push(route)}>
            <Card.Content style={styles.navCardContent}>
                <IconButton icon={icon} iconColor={color} size={32} style={styles.navIcon} />
                <Text variant="titleMedium" style={styles.navTitle}>{title}</Text>
            </Card.Content>
        </Card>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalOrdersToday}</Text>
                    <Text style={styles.statLabel}>Orders today</Text>
                </View>
                <View style={[styles.statBox, stats.pendingOrders > 0 && { backgroundColor: THEME.colors.secondary + '20' }]}>
                    <Text style={[styles.statValue, { color: THEME.colors.secondary }]}>{stats.pendingOrders}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalProducts}</Text>
                    <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={[styles.statBox, stats.lowStock > 0 && { backgroundColor: THEME.colors.error + '20' }]}>
                    <Text style={[styles.statValue, { color: THEME.colors.error }]}>{stats.lowStock}</Text>
                    <Text style={styles.statLabel}>Low stock</Text>
                </View>
            </View>

            <Text variant="titleLarge" style={styles.sectionTitle}>Manage</Text>

            <View style={styles.grid}>
                <NavCard title="Products" icon="package" route="/admin/products" color={THEME.colors.primary} />
                <NavCard title="Orders" icon="clipboard-list-outline" route="/admin/orders" color={THEME.colors.info} />
                <NavCard title="Categories" icon="shape-outline" route="/admin/categories" color={THEME.colors.transit} />
                <NavCard title="Offers" icon="brightness-percent" route="/admin/offers" color={THEME.colors.secondary} />
            </View>

            <Button
                mode="outlined"
                icon="logout"
                textColor={THEME.colors.error}
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                Log out
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        padding: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statBox: {
        width: '48%',
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: THEME.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    statValue: {
        fontFamily: THEME.fonts.bold,
        fontSize: 32,
        color: THEME.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.textSecondary,
    },
    sectionTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    navCard: {
        width: '48%',
        marginBottom: 16,
        backgroundColor: THEME.colors.surface,
    },
    navCardContent: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    navIcon: {
        backgroundColor: THEME.colors.background,
        marginBottom: 8,
    },
    navTitle: {
        fontFamily: THEME.fonts.bold,
    },
    logoutButton: {
        marginTop: 24,
        marginBottom: 48,
        borderColor: THEME.colors.error,
    },
});
