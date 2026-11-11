import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, IconButton, Divider } from 'react-native-paper';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { Product, Review } from '../../types';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const addToCart = useCartStore(state => state.addToCart);

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        productService.getProduct(id).then(p => {
            setProduct(p);
            setLoading(false);
        });

        const unsubReviews = productService.observeReviews(id, setReviews);

        return () => {
            unsubReviews();
        };
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;

        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        Alert.alert('Added to cart', undefined, [
            { text: 'Keep shopping', style: 'cancel' },
            { text: 'Go to cart', onPress: () => router.push('/(tabs)/cart') }
        ]);
    };

    if (loading) return null;
    if (!product) {
        return (
            <View style={styles.centerContainer}>
                <Text>Product not found.</Text>
            </View>
        );
    }

    const isOutOfStock = product.stock === 0 || !product.isAvailable;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="contain" />
                    {product.offer ? (
                        <View style={styles.offerBadge}>
                            <Text style={styles.offerText}>{product.offer}% OFF</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.content}>
                    <Text variant="headlineSmall" style={styles.title}>{product.name}</Text>
                    <Text variant="headlineMedium" style={styles.price}>₹{product.price}</Text>

                    {isOutOfStock ? (
                        <Text style={styles.outOfStock}>Currently Out of stock</Text>
                    ) : (
                        <Text style={styles.inStock}>{product.stock} items left in stock</Text>
                    )}

                    <Divider style={styles.divider} />

                    <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
                    <Text variant="bodyMedium" style={styles.description}>{product.description}</Text>

                    <Divider style={styles.divider} />

                    <Text variant="titleMedium" style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                    {reviews.length === 0 ? (
                        <Text style={styles.noReviews}>No reviews yet.</Text>
                    ) : (
                        reviews.map(review => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.userName}</Text>
                                    <View style={styles.stars}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <IconButton
                                                key={star}
                                                icon={star <= review.rating ? 'star' : 'star-outline'}
                                                size={16}
                                                iconColor={THEME.colors.secondary}
                                                style={{ margin: 0, padding: 0 }}
                                            />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewDate}>
                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                                {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.quantityContainer}>
                    <IconButton
                        icon="minus"
                        mode="contained-tonal"
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isOutOfStock}
                    />
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <IconButton
                        icon="plus"
                        mode="contained-tonal"
                        onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={isOutOfStock || quantity >= product.stock}
                    />
                </View>
                <Button
                    mode="contained"
                    buttonColor={THEME.colors.primary}
                    style={styles.addToCartButton}
                    contentStyle={{ height: 56 }}
                    disabled={isOutOfStock}
                    onPress={handleAddToCart}
                >
                    {isOutOfStock ? 'Out of stock' : 'Add to cart'}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: THEME.colors.surface,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    offerBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: THEME.colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: THEME.sizes.radius,
    },
    offerText: {
        color: THEME.colors.white,
        fontFamily: THEME.fonts.bold,
    },
    content: {
        padding: 16,
    },
    title: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.textPrimary,
        marginBottom: 8,
    },
    price: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.primary,
        marginBottom: 8,
    },
    outOfStock: {
        color: THEME.colors.error,
        fontFamily: THEME.fonts.medium,
    },
    inStock: {
        color: THEME.colors.success,
        fontFamily: THEME.fonts.medium,
    },
    divider: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 8,
    },
    description: {
        color: THEME.colors.textSecondary,
        lineHeight: 22,
    },
    noReviews: {
        color: THEME.colors.textSecondary,
        fontStyle: 'italic',
    },
    reviewCard: {
        backgroundColor: THEME.colors.surface,
        padding: 12,
        borderRadius: THEME.sizes.radius,
        marginBottom: 12,
        elevation: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewerName: {
        fontFamily: THEME.fonts.medium,
    },
    stars: {
        flexDirection: 'row',
    },
    reviewDate: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        marginBottom: 8,
    },
    reviewComment: {
        color: THEME.colors.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: THEME.colors.surface,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.border,
        alignItems: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    quantityText: {
        fontFamily: THEME.fonts.bold,
        fontSize: 18,
        marginHorizontal: 8,
        width: 24,
        textAlign: 'center',
    },
    addToCartButton: {
        flex: 1,
        borderRadius: THEME.sizes.radius,
    },
});
