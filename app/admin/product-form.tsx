import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, Switch, Menu } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { THEME } from '../../constants/theme';
import { productService } from '../../services/productService';
import { Category, Product } from '../../types';

export default function ProductFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');
    const [offer, setOffer] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = productService.observeCategories(setCategories);
        return () => unsub();
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            productService.getProduct(id).then(p => {
                if (p) {
                    setName(p.name);
                    setCategoryId(p.category);
                    setPrice(p.price.toString());
                    setStock(p.stock.toString());
                    setDescription(p.description);
                    setOffer(p.offer ? p.offer.toString() : '');
                    setIsAvailable(p.isAvailable);
                    setImageUri(p.imageUrl);
                }
                setLoading(false);
            });
        }
    }, [id]);

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
        if (!name || !categoryId || !price || !stock || !description || !imageUri) {
            Alert.alert('Validation Error', 'Please fill all required fields and select an image.');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = imageUri;
            if (!imageUri.startsWith('http')) {
                const path = `products/${Date.now()}.jpg`;
                finalImageUrl = await productService.uploadImage(imageUri, path);
            }

            const productData: Omit<Product, 'id'> = {
                name,
                category: categoryId,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                description,
                offer: offer ? parseFloat(offer) : 0,
                isAvailable,
                imageUrl: finalImageUrl,
            };

            if (id) {
                await productService.updateProduct(id, productData);
            } else {
                await productService.addProduct(productData);
            }

            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || 'Select Category';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.imagePickerContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.previewPlaceholder}>
                            <Text style={{ color: THEME.colors.textSecondary }}>No Image Selected</Text>
                        </View>
                    )}
                    <Button mode="outlined" onPress={pickImage} style={styles.pickerButton} textColor={THEME.colors.primary}>
                        {imageUri ? 'Change Image' : 'Select Image'}
                    </Button>
                </View>

                <TextInput
                    mode="outlined"
                    label="Product Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />

                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                            style={styles.dropdownButton}
                            textColor={categoryId ? THEME.colors.textPrimary : THEME.colors.textSecondary}
                        >
                            {selectedCategoryName}
                        </Button>
                    }
                >
                    {categories.map((c) => (
                        <Menu.Item
                            key={c.id}
                            onPress={() => { setCategoryId(c.id); setMenuVisible(false); }}
                            title={c.name}
                        />
                    ))}
                </Menu>

                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label="Price (₹)"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                    />
                    <TextInput
                        mode="outlined"
                        label="Stock"
                        value={stock}
                        onChangeText={setStock}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    />
                </View>

                <TextInput
                    mode="outlined"
                    label="Offer % (Optional)"
                    value={offer}
                    onChangeText={setOffer}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <TextInput
                    mode="outlined"
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                />

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Available for Sale</Text>
                    <Switch
                        value={isAvailable}
                        onValueChange={setIsAvailable}
                        color={THEME.colors.primary}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                    contentStyle={{ height: 50 }}
                    buttonColor={THEME.colors.primary}
                >
                    Save Product
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    previewImage: {
        width: 150,
        height: 150,
        borderRadius: THEME.sizes.radius,
        marginBottom: 16,
        backgroundColor: THEME.colors.surface,
    },
    previewPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: THEME.sizes.radius,
        marginBottom: 16,
        backgroundColor: THEME.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.border,
        borderStyle: 'dashed',
    },
    pickerButton: {
        borderColor: THEME.colors.primary,
    },
    input: {
        marginBottom: 16,
        backgroundColor: THEME.colors.surface,
    },
    dropdownButton: {
        marginBottom: 16,
        paddingVertical: 8,
        borderColor: THEME.colors.outline,
        backgroundColor: THEME.colors.surface,
        justifyContent: 'flex-start',
    },
    row: {
        flexDirection: 'row',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 16,
        paddingHorizontal: 8,
    },
    switchLabel: {
        fontFamily: THEME.fonts.medium,
        color: THEME.colors.textPrimary,
    },
    saveButton: {
        marginTop: 24,
        borderRadius: THEME.sizes.radius,
    },
});
