import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'ArefRuqaa-Regular': require('../assets/fonts/ArefRuqaa-Regular.ttf'),
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
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="booking" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="cases" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}