import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Animated, { FadeInDown, Layout, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProductCard = ({ product, onPress, index = 0 }: ProductCardProps) => {
    const addToCart = useCartStore(state => state.addToCart);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            entering={FadeInDown.delay(index * 50).springify()}
            layout={Layout.springify()}
            style={[styles.card, animatedStyle]}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    contentFit="contain"
                    transition={200}
                />
                {product.offer ? (
                    <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>{product.offer}% OFF</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.info}>
                <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
                    {product.name}
                </Text>
                <Text variant="bodySmall" style={styles.stock}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </Text>

                <View style={styles.bottomRow}>
                    <Text variant="titleLarge" style={styles.price}>
                        ₹{product.price}
                    </Text>
                    <IconButton
                        icon="cart-plus"
                        mode="contained"
                        containerColor={THEME.colors.primary}
                        iconColor={THEME.colors.white}
                        size={20}
                        disabled={!product.isAvailable || product.stock === 0}
                        onPress={handleAddToCart}
                    />
                </View>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.sizes.radius,
        marginBottom: THEME.sizes.margin,
        elevation: 2,
        shadowColor: THEME.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 150,
        backgroundColor: THEME.colors.background,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    offerBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: THEME.colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: THEME.sizes.radius,
    },
    offerText: {
        color: THEME.colors.white,
        fontFamily: THEME.fonts.bold,
        fontSize: THEME.sizes.small,
    },
    info: {
        padding: THEME.sizes.padding,
    },
    title: {
        fontFamily: THEME.fonts.medium,
        marginBottom: 4,
        color: THEME.colors.textPrimary,
    },
    stock: {
        color: THEME.colors.textSecondary,
        marginBottom: 8,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontFamily: THEME.fonts.bold,
        color: THEME.colors.primary,
    },
});
