import { db, storage } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, onSnapshot, where, orderBy, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Category, Review } from '../types';

export const productService = {
    observeProducts(callback: (products: Product[]) => void) {
        const q = query(collection(db, 'products'));
        return onSnapshot(q, (snapshot) => {
            const products: Product[] = [];
            snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() } as Product));
            callback(products);
        });
    },

    observeCategories(callback: (categories: Category[]) => void) {
        const q = query(collection(db, 'categories'), orderBy('sortOrder'));
        return onSnapshot(q, (snapshot) => {
            const categories: Category[] = [];
            snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() } as Category));
            callback(categories);
        });
    },

    async getProduct(id: string) {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
    },

    async addProduct(product: Omit<Product, 'id'>) {
        const res = await addDoc(collection(db, 'products'), product);
        return res.id;
    },

    async updateProduct(id: string, data: Partial<Product>) {
        await updateDoc(doc(db, 'products', id), data);
    },

    async deleteProduct(id: string) {
        await deleteDoc(doc(db, 'products', id));
    },

    async uploadImage(uri: string, path: string): Promise<string> {
        const response = await fetch(uri);
        const blob = await response.blob();
        const imageRef = ref(storage, path);
        await uploadBytes(imageRef, blob);
        return await getDownloadURL(imageRef);
    },

    async addReview(productId: string, review: Omit<Review, 'id' | 'createdAt'>) {
        const reviewData = {
            ...review,
            createdAt: Date.now()
        };
        await addDoc(collection(db, `products/${productId}/reviews`), reviewData);
    },

    observeReviews(productId: string, callback: (reviews: Review[]) => void) {
        const q = query(collection(db, `products/${productId}/reviews`), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const reviews: Review[] = [];
            snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() } as Review));
            callback(reviews);
        });
    }
};
