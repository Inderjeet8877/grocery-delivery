import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import { Category, Product } from '../../types';

export default function HomeScreen() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const unsubProducts = productService.observeProducts(setProducts);
        const unsubCategories = productService.observeCategories(setCategories);

        return () => {
            unsubProducts();
            unsubCategories();
        };
    }, []);

    const offers = useMemo(() => products.filter(p => p.offer && p.offer > 0 && p.isAvailable), [products]);
    const availableProducts = useMemo(() => products.filter(p => p.isAvailable), [products]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <Stack.Screen
                options={{
                    headerTitle: () => (
                        <View>
                            <Text style={styles.headerGreeting}>{getGreeting()},</Text>
                            <Text style={styles.headerName}>{user?.name?.split(' ')[0]}</Text>
                        </View>
                    ),
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <Pressable style={styles.searchContainer} onPress={() => router.push('/(tabs)/search')}>
                    <Searchbar
                        placeholder="Search groceries"
                        value=""
                        editable={false}
                        onPressIn={() => router.push('/(tabs)/search')}
                        style={styles.searchBar}
                    />
                </Pressable>

                {categories.length > 0 && <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {categories.map((cat) => (
                            <CategoryChip
                                key={cat.id}
                                label={cat.name}
                                imageUrl={cat.imageUrl}
                                onPress={() => router.push(`/(tabs)/search?category=${encodeURIComponent(cat.id)}`)}
                            />
                        ))}
                    </ScrollView>
                </View>}

                {offers.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="titleLarge" style={styles.sectionTitle}>On offer today</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {offers.map((product, index) => (
                                <View key={product.id} style={styles.carouselItem}>
                                    <ProductCard
                                        product={product}
                                        index={index}
                                        onPress={() => router.push(`/product/${product.id}`)}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.section}>
                    <Text variant="titleLarge" style={[styles.sectionTitle, { marginLeft: 16 }]}>All products</Text>
                    {availableProducts.length === 0 && (
                        <Text style={styles.emptyText}>Nothing on the shelves yet. Check back soon.</Text>
                    )}
                    <View style={styles.gridContainer}>
                        {availableProducts.map((product, index) => (
                            <View key={product.id} style={styles.gridItem}>
                                <ProductCard
                                    product={product}
                                    index={index}
                                    onPress={() => router.push(`/product/${product.id}`)}
                                />
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    headerGreeting: {
        fontFamily: THEME.fonts.regular,
        fontSize: THEME.sizes.small,
        color: THEME.colors.textSecondary,
    },
    headerName: {
        fontFamily: THEME.fonts.bold,
        fontSize: THEME.sizes.medium,
        color: THEME.colors.textPrimary,
    },
    searchContainer: {
        padding: 16,
    },
    searchBar: {
        backgroundColor: THEME.colors.surface,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 12,
        marginLeft: 16,
        color: THEME.colors.textPrimary,
    },
    emptyText: {
        marginHorizontal: 16,
        color: THEME.colors.textSecondary,
    },
    horizontalList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    carouselItem: {
        width: 250,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    gridItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
});
