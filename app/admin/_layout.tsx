import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { headerOptions } from '../_layout';

export default function AdminLayout() {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (!isLoading) {
        if (!isAuthenticated || user?.role !== 'admin') {
            return <Redirect href="/(auth)/welcome" />;
        }
    }

    return (
        <Stack screenOptions={{ headerShown: true, ...headerOptions }}>
            <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
            <Stack.Screen name="products" options={{ title: 'Products' }} />
            <Stack.Screen name="product-form" options={{ title: 'Product', presentation: 'modal' }} />
            <Stack.Screen name="categories" options={{ title: 'Categories' }} />
            <Stack.Screen name="orders" options={{ title: 'Orders' }} />
            <Stack.Screen name="offers" options={{ title: 'Offers' }} />
        </Stack>
    );
}
