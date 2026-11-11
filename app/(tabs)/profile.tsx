import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Avatar, List, Switch, Button, Portal, Modal, TextInput, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { AddressModal } from '../../components/AddressModal';
import { Address } from '../../types';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser, logout } = useAuthStore();

    const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);

    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [editProfileVisible, setEditProfileVisible] = useState(false);

    const [editName, setEditName] = useState(user?.name || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    const handleLogout = async () => {
        await authService.logout();
        logout();
        router.replace('/(auth)/welcome');
    };

    const handleToggleNotifications = async () => {
        if (!user) return;
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        await authService.updateUserProfile(user.uid, { notificationsEnabled: newValue });
        setUser({ ...user, notificationsEnabled: newValue });
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await authService.updateUserProfile(user.uid, { name: editName, phone: editPhone });
            setUser({ ...user, name: editName, phone: editPhone });
            setEditProfileVisible(false);
        } catch {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (address: Address) => {
        if (!user) return;
        setLoading(true);
        try {
            const updatedAddresses = [...(user.address || []), address];
            await authService.updateUserProfile(user.uid, { address: updatedAddresses });
            setUser({ ...user, address: updatedAddresses });
            setAddressModalVisible(false);
        } catch {
            Alert.alert('Error', 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (index: number) => {
        if (!user) return;
        const updatedAddresses = user.address.filter((_, i) => i !== index);
        await authService.updateUserProfile(user.uid, { address: updatedAddresses });
        setUser({ ...user, address: updatedAddresses });
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text size={80} label={initials} style={styles.avatar} color={THEME.colors.white} />
                <Text variant="headlineSmall" style={styles.name}>{user.name}</Text>
                <Text variant="bodyMedium" style={styles.email}>{user.email}</Text>
                <Text variant="bodyMedium" style={styles.phone}>{user.phone}</Text>
                <Button
                    mode="outlined"
                    onPress={() => setEditProfileVisible(true)}
                    style={styles.editButton}
                    textColor={THEME.colors.primary}
                >
                    Edit profile
                </Button>
            </View>

            <List.Section>
                <List.Subheader>Settings</List.Subheader>
                <List.Item
                    title="Push notifications"
                    left={props => <List.Icon {...props} icon="bell-outline" />}
                    right={() => <Switch value={notificationsEnabled} onValueChange={handleToggleNotifications} color={THEME.colors.primary} />}
                />
            </List.Section>

            <List.Section>
                <View style={styles.addressHeader}>
                    <List.Subheader>Saved addresses</List.Subheader>
                    <IconButton icon="plus" size={24} iconColor={THEME.colors.primary} onPress={() => setAddressModalVisible(true)} />
                </View>

                {user.address && user.address.length > 0 ? (
                    user.address.map((addr, index) => (
                        <List.Item
                            key={index}
                            title={addr.label}
                            description={`${addr.fullAddress}\n${addr.landmark ? addr.landmark + ', ' : ''}${addr.pincode}`}
                            left={props => <List.Icon {...props} icon="map-marker-outline" />}
                            right={props => (
                                <IconButton
                                    icon="trash-can-outline"
                                    iconColor={THEME.colors.error}
                                    onPress={() => handleDeleteAddress(index)}
                                />
                            )}
                        />
                    ))
                ) : (
                    <List.Item title="No addresses saved" description="Add an address for checkout" />
                )}
            </List.Section>

            <List.Section>
                <List.Subheader>Support</List.Subheader>
                <List.Item
                    title="Contact us"
                    left={props => <List.Icon {...props} icon="help-circle-outline" />}
                    onPress={() => Alert.alert('Contact Support', 'Email: support@grocery.com\nPhone: 1800-123-4567')}
                />
            </List.Section>

            <Button
                mode="text"
                textColor={THEME.colors.error}
                icon="logout"
                onPress={handleLogout}
                style={styles.logoutButton}
            >Log out</Button>

            <Portal>
                <Modal
                    visible={editProfileVisible}
                    onDismiss={() => setEditProfileVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>Edit Profile</Text>
                    <TextInput
                        mode="outlined"
                        label="Name"
                        value={editName}
                        onChangeText={setEditName}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Phone"
                        value={editPhone}
                        onChangeText={setEditPhone}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                    <View style={styles.modalActions}>
                        <Button onPress={() => setEditProfileVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={handleSaveProfile} loading={loading} buttonColor={THEME.colors.primary}>
                            Save
                        </Button>
                    </View>
                </Modal>
            </Portal>

            <AddressModal
                visible={addressModalVisible}
                onDismiss={() => setAddressModalVisible(false)}
                onSave={handleAddAddress}
                loading={loading}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: THEME.colors.surface,
        marginBottom: 16,
    },
    avatar: {
        backgroundColor: THEME.colors.primary,
        marginBottom: 16,
    },
    name: {
        fontFamily: THEME.fonts.bold,
    },
    email: {
        color: THEME.colors.textSecondary,
        marginTop: 4,
    },
    phone: {
        color: THEME.colors.textSecondary,
        marginBottom: 16,
    },
    editButton: {
        borderColor: THEME.colors.primary,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 8,
    },
    logoutButton: {
        marginVertical: 24,
    },
    modalContent: {
        backgroundColor: THEME.colors.surface,
        padding: 24,
        margin: 20,
        borderRadius: THEME.sizes.radius,
    },
    modalTitle: {
        fontFamily: THEME.fonts.bold,
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
        backgroundColor: THEME.colors.surface,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 12,
    },
});
