import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { LogBox, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
]);

const ADMIN_PASSWORD = 'KeepAdministrator';
const LONG_PRESS_DURATION = 5000;

export default function IndexPage() {
  const router = useRouter();
  const longPressTimer = useRef<number | null>(null);
  const [titleText, setTitleText] = useState('عيادات العشري');

  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      if (true) { 
        router.push({ pathname: '/cases_admin' });
      } else {
      }
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles.title}>{titleText}</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#1a73e8', borderRadius: 10 } ]}
          onPress={() => router.push({ pathname: '/booking' })}
        >
          <Text style={styles.buttonText}>الحجز</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#1a73e8', borderRadius: 10 } ]}
          onPress={() => router.push({ pathname: '/cases_user' })}
        >
          <Text style={styles.buttonText}>الحالات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 60,
    marginBottom: 40,
    fontFamily: 'ArefRuqaa-Regular',
    textAlign: 'center',
  },
  buttonContainer: {
    width: 170,
    marginVertical: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});