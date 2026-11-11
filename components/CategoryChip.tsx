import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { THEME } from '../constants/theme';

interface CategoryChipProps {
    label: string;
    imageUrl?: string;
    selected?: boolean;
    onPress: () => void;
}

export const CategoryChip = ({ label, imageUrl, selected, onPress }: CategoryChipProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.container,
                selected && styles.containerSelected
            ]}
        >
            {imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                />
            )}
            <Text style={[
                styles.label,
                selected && styles.labelSelected
            ]}>
                {label}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        marginRight: 10,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    containerSelected: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    image: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    label: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.textPrimary,
        fontSize: THEME.sizes.medium,
    },
    labelSelected: {
        color: THEME.colors.white,
    },
});
