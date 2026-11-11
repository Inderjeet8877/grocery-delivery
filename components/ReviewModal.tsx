import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { THEME } from '../constants/theme';

interface ReviewModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (rating: number, comment: string) => void;
    loading?: boolean;
}

export const ReviewModal = ({ visible, onDismiss, onSubmit, loading }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating === 0) return;
        onSubmit(rating, comment);
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <Text variant="titleLarge" style={styles.title}>Rate your order</Text>

                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <IconButton
                            key={star}
                            icon={star <= rating ? 'star' : 'star-outline'}
                            iconColor={THEME.colors.secondary}
                            size={32}
                            onPress={() => setRating(star)}
                        />
                    ))}
                </View>

                <TextInput
                    mode="outlined"
                    label="Optional Comment"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    outlineColor={THEME.colors.border}
                    activeOutlineColor={THEME.colors.primary}
                />

                <View style={styles.actions}>
                    <Button onPress={onDismiss} textColor={THEME.colors.textSecondary}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        disabled={rating === 0 || loading}
                        loading={loading}
                        buttonColor={THEME.colors.primary}
                    >
                        Submit
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: THEME.colors.surface,
        padding: 24,
        margin: 20,
        borderRadius: THEME.sizes.radius,
    },
    title: {
        fontFamily: THEME.fonts.bold,
        textAlign: 'center',
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: THEME.colors.surface,
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
});
