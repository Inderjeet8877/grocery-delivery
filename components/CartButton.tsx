import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Badge } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCartStore } from '../store/cartStore';
import { THEME } from '../constants/theme';

export const CartButton = () => {
    const router = useRouter();
    const totalItems = useCartStore(state => state.getTotalItems());

    return (
        <View style={styles.container}>
            <IconButton
                icon="cart-outline"
                iconColor={THEME.colors.textPrimary}
                size={24}
                onPress={() => router.push('/(tabs)/cart')}
            />
            {totalItems > 0 && (
                <Badge style={styles.badge} visible={true}>
                    {totalItems}
                </Badge>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginRight: 8,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: THEME.colors.primary,
    },
});
