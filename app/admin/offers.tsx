import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, IconButton, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { Image } from 'expo-image';

export default function AdminOffersScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [offerValue, setOfferValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = productService.observeProducts(setProducts);
        return () => unsub();
    }, []);

    const productsWithOffers = useMemo(() => {
        return products.filter(p => p.offer && p.offer > 0);
    }, [products]);

    const openOfferModal = (product: Product) => {
        setSelectedProduct(product);
        setOfferValue(product.offer ? product.offer.toString() : '');
        setModalVisible(true);
    };

    const handleSaveOffer = async () => {
        if (!selectedProduct) return;
        setLoading(true);
        try {
            const parsedOffer = parseFloat(offerValue) || 0;
            await productService.updateProduct(selectedProduct.id, { offer: parsedOffer });
            setModalVisible(false);
        } catch {
            Alert.alert('Error', 'Could not update offer');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveOffer = async (id: string) => {
        Alert.alert('Remove Offer', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try {
                        await productService.updateProduct(id, { offer: 0 });
                    } catch {
                        Alert.alert('Error', 'Failed to remove offer');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Active Offers ({productsWithOffers.length})</Text>
            <FlatList
                data={productsWithOffers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price}</Text>
                            <Text style={styles.offerText}>{item.offer}% OFF</Text>
                        </View>
                        <View style={styles.actions}>
                            <IconButton icon="pencil" size={20} iconColor={THEME.colors.primary} onPress={() => openOfferModal(item)} />
                            <IconButton icon="close" size={20} iconColor={THEME.colors.error} onPress={() => handleRemoveOffer(item.id)} />
                        </View>
                    </View>
                )}
                style={{ flexGrow: 0, maxHeight: '45%' }}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>All Products</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={{ padding: 16, alignItems: 'center' }}><Text>No products available.</Text></View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price}</Text>
                        </View>
                        <Button mode="text" onPress={() => openOfferModal(item)}>Set Offer</Button>
                    </View>
                )}
            />

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={styles.modalTitle}>Set Offer</Text>
                    <Text style={{ marginBottom: 16 }}>{selectedProduct?.name}</Text>

                    <TextInput
                        mode="outlined"
                        label="Offer Discount %"
                        value={offerValue}
                        onChangeText={setOfferValue}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <View style={styles.modalActions}>
                        <Button onPress={() => setModalVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={handleSaveOffer} loading={loading} buttonColor={THEME.colors.primary}>
                            Save Offer
                        </Button>
                    </View>
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
    sectionTitle: {
        fontFamily: THEME.fonts.bold,
        padding: 16,
        paddingBottom: 8,
        color: THEME.colors.textPrimary,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.surface,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: THEME.sizes.radius,
        elevation: 1,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: THEME.colors.background,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontFamily: THEME.fonts.medium,
    },
    price: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
    },
    offerText: {
        fontSize: 12,
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.secondary,
    },
    actions: {
        flexDirection: 'row',
    },
    modal: {
        backgroundColor: THEME.colors.surface,
        padding: 24,
        margin: 20,
        borderRadius: THEME.sizes.radius,
    },
    modalTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 8,
    },
    input: {
        marginBottom: 24,
        backgroundColor: THEME.colors.surface,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
});
