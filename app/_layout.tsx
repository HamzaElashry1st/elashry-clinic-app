import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'ArefRuqaa-Regular': require('../assets/fonts/ArefRuqaa-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
 <Stack.Screen name="index" options={{ title: 'Home' }} />
 <Stack.Screen name="booking" options={{ title: 'Booking' }} />
 <Stack.Screen name="cases" options={{ title: 'Cases' }} />
 </Stack>
  );
}
