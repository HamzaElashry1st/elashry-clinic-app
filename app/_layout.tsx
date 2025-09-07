import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'ArefRuqaa-Regular': require('../assets/fonts/ArefRuqaa-Regular.ttf'),
    'SegoeUI': require('../assets/fonts/SegoeUI.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="index" options={{ animation: 'slide_from_left' }} />
        <Stack.Screen name="booking" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="cases" />
      </Stack>
    </AuthProvider>
  );
}