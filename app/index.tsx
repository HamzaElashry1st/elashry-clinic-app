import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, LogBox, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PromptModal from '../components/PromptModal';

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
]);

const ADMIN_PASSWORD = 'clinics.at.manial.1970';
const LONG_PRESS_DURATION = 5000;

export default function IndexPage() {
  const router = useRouter();
  const pressStartTime = useRef<number | null>(null);
  const waitTimer = useRef<number | null>(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptInputValue, setPromptInputValue] = useState('');

  const showAdminPrompt = () => {
    if (Platform.OS === 'web') {
      const password = window.prompt('Admin Password', 'Enter password to access admin page:');
      if (password === ADMIN_PASSWORD) {
        router.push({ pathname: '/cases_admin' });
      } else if (password !== null) {
        alert('Incorrect Password');
      }
    } else {
      setIsPromptVisible(true);
    }
  };

  const handlePromptConfirm = (password: string) => {
    setIsPromptVisible(false);
    setPromptInputValue('');
    if (password === ADMIN_PASSWORD) {
      router.push({ pathname: '/cases_admin' });
    } else {
      Alert.alert('Incorrect Password', 'Please try again.');
    }
  };

  const handlePromptCancel = () => {
    setIsPromptVisible(false);
    setPromptInputValue('');
    if (waitTimer.current) {
      clearTimeout(waitTimer.current);
      waitTimer.current = null;
    }
  };

  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    if (waitTimer.current) {
      clearTimeout(waitTimer.current);
      waitTimer.current = null;
    }
  };

  const handlePressOut = () => {
    const pressDuration = Date.now() - (pressStartTime.current || 0);

    if (pressDuration >= LONG_PRESS_DURATION) {
      console.log("Held for at least 5s. Waiting 1s after release...");
      waitTimer.current = setTimeout(showAdminPrompt, 1000);
    } else {
      console.log("Not held for long enough. Clearing any pending timers.");
      if (waitTimer.current) {
        clearTimeout(waitTimer.current);
        waitTimer.current = null;
      }
    }
    pressStartTime.current = null;
  };

  return (
    <View style={styles.screenContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles.title}>عيادات العشري</Text>
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
          <Text style={styles.buttonText}>اعرف ترتيبك</Text>
        </TouchableOpacity>
      </View>

      <PromptModal
        visible={isPromptVisible}
        title="Admin Password"
        message="Enter password to access admin page:"
        onCancel={handlePromptCancel}
        onConfirm={handlePromptConfirm}
        secureTextEntry={true}
        defaultValue={promptInputValue}
      />
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
    fontFamily: 'ArefRuqaa-Regular',
    color: 'white',
    fontSize: 30,
  },
});