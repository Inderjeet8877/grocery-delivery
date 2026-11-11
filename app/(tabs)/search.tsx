import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { Category, Product } from '../../types';

export default function SearchScreen() {
    const router = useRouter();
    const { category: initialCategory } = useLocalSearchParams<{ category: string }>();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
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

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
            return matchesSearch && matchesCategory && p.isAvailable;
        });
    }, [products, searchQuery, selectedCategory]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Searchbar
                        placeholder="Search groceries"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        autoFocus={!initialCategory}
                    />
                    <View style={styles.categories}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={[{ id: 'all', name: 'All' } as Category, ...categories]}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <CategoryChip
                                    label={item.name}
                                    selected={item.id === 'all' ? selectedCategory === null : selectedCategory === item.id}
                                    onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
                                />
                            )}
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text variant="titleMedium" style={styles.emptyText}>Nothing matches that search.</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <View style={styles.gridItem}>
                            <ProductCard
                                product={item}
                                index={index}
                                onPress={() => router.push(`/product/${item.id}`)}
                            />
                        </View>
                    )}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    header: {
        padding: 16,
        backgroundColor: THEME.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    searchBar: {
        backgroundColor: THEME.colors.background,
        marginBottom: 16,
    },
    categories: {
        flexDirection: 'row',
    },
    listContent: {
        padding: 8,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        paddingTop: 48,
        alignItems: 'center',
    },
    emptyText: {
        color: THEME.colors.textSecondary,
        fontFamily: THEME.fonts.medium,
    },
});
