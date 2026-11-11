import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, IconButton, FAB, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function AdminCategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
        const unsub = productService.observeCategories(setCategories);
        return () => unsub();
    }, []);

    const openAddModal = () => {
        setEditId(null);
        setName('');
        setSortOrder((categories.length + 1).toString());
        setImageUri(null);
        setModalVisible(true);
    };

    const openEditModal = (cat: Category) => {
        setEditId(cat.id);
        setName(cat.name);
        setSortOrder(cat.sortOrder.toString());
        setImageUri(cat.imageUrl);
        setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name || (!imageUri && !editId)) {
            Alert.alert('Error', 'Name and Image are required');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = imageUri;
            if (imageUri && !imageUri.startsWith('http')) {
                const path = `categories/${Date.now()}.jpg`;
                finalImageUrl = await productService.uploadImage(imageUri, path);
            }

            const categoryData = {
                name,
                sortOrder: parseInt(sortOrder, 10) || 0,
                ...(finalImageUrl ? { imageUrl: finalImageUrl } : {})
            };

            if (editId) {
                await updateDoc(doc(db, 'categories', editId), categoryData);
            } else {
                await addDoc(collection(db, 'categories'), categoryData);
            }
            setModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Category', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await deleteDoc(doc(db, 'categories', id));
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.sortOrder}. {item.name}</Text>
                        <View style={styles.actions}>
                            <IconButton icon="pencil" size={20} iconColor={THEME.colors.primary} onPress={() => openEditModal(item)} />
                            <IconButton icon="delete" size={20} iconColor={THEME.colors.error} onPress={() => handleDelete(item.id)} />
                        </View>
                    </View>
                )}
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={openAddModal}
                color={THEME.colors.white}
                theme={{ colors: { primaryContainer: THEME.colors.primary } }}
            />

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={styles.modalTitle}>{editId ? 'Edit Category' : 'Add Category'}</Text>

                    <Button mode="outlined" onPress={pickImage} style={styles.input}>
                        {imageUri ? 'Change Image' : 'Select Image'}
                    </Button>

                    <TextInput
                        mode="outlined"
                        label="Category Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Sort Order"
                        value={sortOrder}
                        onChangeText={setSortOrder}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <View style={styles.modalActions}>
                        <Button onPress={() => setModalVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={handleSave} loading={loading} buttonColor={THEME.colors.primary}>
                            Save
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
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: THEME.sizes.radius,
        marginBottom: 8,
        elevation: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontFamily: THEME.fonts.bold,
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: THEME.colors.primary,
    },
    modal: {
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
        marginBottom: 16,
        backgroundColor: THEME.colors.surface,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
});
