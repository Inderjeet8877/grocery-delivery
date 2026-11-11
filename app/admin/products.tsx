import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, IconButton, FAB, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { Product } from '../../types';

export default function AdminProductsScreen() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsub = productService.observeProducts(setProducts);
        return () => unsub();
    }, []);

    const handleToggleAvailable = async (id: string, current: boolean) => {
        try {
            await productService.updateProduct(id, { isAvailable: !current });
        } catch {
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Product', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await productService.deleteProduct(id);
                    } catch {
                        Alert.alert('Error', 'Failed to delete product');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price} • Stock: {item.stock}</Text>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Available</Text>
                                <Switch
                                    value={item.isAvailable}
                                    onValueChange={() => handleToggleAvailable(item.id, item.isAvailable)}
                                    color={THEME.colors.primary}
                                />
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <IconButton
                                icon="pencil"
                                size={20}
                                iconColor={THEME.colors.primary}
                                onPress={() => router.push(`/admin/product-form?id=${item.id}`)}
                            />
                            <IconButton
                                icon="delete"
                                size={20}
                                iconColor={THEME.colors.error}
                                onPress={() => handleDelete(item.id)}
                            />
                        </View>
                    </View>
                )}
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/admin/product-form')}
                color={THEME.colors.white}
                theme={{ colors: { primaryContainer: THEME.colors.primary } }}
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
        paddingBottom: 80,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.surface,
        padding: 12,
        borderRadius: THEME.sizes.radius,
        marginBottom: 12,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: THEME.sizes.radius,
        backgroundColor: THEME.colors.background,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 2,
    },
    price: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 12,
        marginRight: 8,
        color: THEME.colors.textSecondary,
    },
    actions: {
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: THEME.colors.primary,
    },
});
