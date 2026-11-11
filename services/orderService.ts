import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, writeBatch, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { Order, OrderStatus, CartItem } from '../types';

export const orderService = {
    async placeOrder(orderData: Omit<Order, 'id'>) {
        const batch = writeBatch(db);

        const orderRef = doc(collection(db, 'orders'));
        batch.set(orderRef, orderData);

        for (const item of orderData.items) {
            const productRef = doc(db, 'products', item.id);
            batch.update(productRef, {
                stock: item.stock - item.quantity
            });
        }

        await batch.commit();
        return orderRef.id;
    },

    observeUserOrders(userId: string, callback: (orders: Order[]) => void) {
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() } as Order));
            callback(orders);
        });
    },

    observeAllOrders(callback: (orders: Order[]) => void) {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() } as Order));
            callback(orders);
        });
    },

    observeOrderDetails(orderId: string, callback: (order: Order | null) => void) {
        const docRef = doc(db, 'orders', orderId);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({ id: docSnap.id, ...docSnap.data() } as Order);
            } else {
                callback(null);
            }
        });
    },

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        await updateDoc(doc(db, 'orders', orderId), { status });
    },

    async markOrderReviewed(orderId: string) {
        await updateDoc(doc(db, 'orders', orderId), { reviewed: true });
    }
};
