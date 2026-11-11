import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, TextInput, Button } from 'react-native-paper';
import { THEME } from '../constants/theme';
import { Address } from '../types';

interface AddressModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSave: (address: Address) => void;
    loading?: boolean;
}

export const AddressModal = ({ visible, onDismiss, onSave, loading }: AddressModalProps) => {
    const [label, setLabel] = useState('Home');
    const [fullAddress, setFullAddress] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');

    const handleSave = () => {
        if (!fullAddress || !pincode || !label) return;
        onSave({
            label,
            fullAddress,
            pincode,
            landmark,
        });
    };

    const isFormValid = fullAddress.trim() !== '' && pincode.trim() !== '' && label.trim() !== '';

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <Text variant="titleLarge" style={styles.title}>Add New Address</Text>

                <TextInput
                    mode="outlined"
                    label="Label (e.g. Home, Work)"
                    value={label}
                    onChangeText={setLabel}
                    style={styles.input}
                    outlineColor={THEME.colors.border}
                    activeOutlineColor={THEME.colors.primary}
                />

                <TextInput
                    mode="outlined"
                    label="Full Address"
                    value={fullAddress}
                    onChangeText={setFullAddress}
                    multiline
                    numberOfLines={2}
                    style={styles.input}
                    outlineColor={THEME.colors.border}
                    activeOutlineColor={THEME.colors.primary}
                />

                <TextInput
                    mode="outlined"
                    label="Pincode"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor={THEME.colors.border}
                    activeOutlineColor={THEME.colors.primary}
                />

                <TextInput
                    mode="outlined"
                    label="Landmark (Optional)"
                    value={landmark}
                    onChangeText={setLandmark}
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
                        onPress={handleSave}
                        disabled={!isFormValid || loading}
                        loading={loading}
                        buttonColor={THEME.colors.primary}
                    >
                        Save Address
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
        marginBottom: 16,
    },
    input: {
        backgroundColor: THEME.colors.surface,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 12,
    },
});
