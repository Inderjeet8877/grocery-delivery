import { Inter_400Regular, Inter_500Medium, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { MD3LightTheme, PaperProvider, configureFonts } from 'react-native-paper';
import { THEME } from '../constants/theme';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

const { colors, fonts } = THEME;

// Paper's MD3 defaults are purple-tinted; every container colour is overridden
// so tonal buttons, search bars and cards stay in the green/neutral palette.
const paperTheme = {
  ...MD3LightTheme,
  roundness: 3,
  fonts: configureFonts({ config: { fontFamily: fonts.regular } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primarySoft,
    onPrimaryContainer: colors.textPrimary,
    secondary: colors.secondary,
    secondaryContainer: colors.primarySoft,
    onSecondaryContainer: colors.textPrimary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.background,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.outline,
    outlineVariant: colors.border,
    error: colors.error,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
    },
  },
};

export const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { fontFamily: fonts.bold, color: colors.textPrimary },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
};

export default function RootLayout() {
  const { user } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    [fonts.regular]: Inter_400Regular,
    [fonts.medium]: Inter_500Medium,
    [fonts.bold]: Inter_700Bold,
  });

  useEffect(() => {
    if (user?.uid && user.notificationsEnabled) {
      notificationService.registerForPushNotificationsAsync(user.uid);
    }
  }, [user]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={{ headerShown: false, ...headerOptions }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Product' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Order details' }} />
        <Stack.Screen name="order-success" />
      </Stack>
    </PaperProvider>
  );
}
