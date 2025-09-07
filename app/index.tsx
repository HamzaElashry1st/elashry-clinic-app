import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, LogBox, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import PromptModal from '../components/PromptModal';
import { useAuth } from '../context/AuthContext';

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
]);

const ADMIN_PASSWORD = 'clinics@manial1970';

const settingsIconSvg = `
<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,16a4,4,0,1,0-4-4A4,4,0,0,0,12,16Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,12,10ZM3.5,12.877l-1,.579a2,2,0,0,0-.733,2.732l1.489,2.578A2,2,0,0,0,5.99,19.5L7,18.916a1.006,1.006,0,0,1,1.008.011.992.992,0,0,1,.495.857V21a2,2,0,0,0,2,2h3a2,2,0,0,0,2-2V19.782a1.009,1.009,0,0,1,1.5-.866l1.009.582a2,2,0,0,0,2.732-.732l1.488-2.578a2,2,0,0,0-.733-2.732l-1-.579a1.007,1.007,0,0,1-.5-.89,1,1,0,0,1,.5-.864l1-.579a2,2,0,0,0,.733-2.732L20.742,5.234A2,2,0,0,0,18.01,4.5L17,5.083a1.008,1.008,0,0,1-1.5-.867V3a2,2,0,0,0-2-2h-3a2,2,0,0,0-2,2V4.294a.854.854,0,0,1-.428.74l-.154.089a.864.864,0,0,1-.854,0L5.99,4.5a2,2,0,0,0-2.733.732L1.769,7.813A2,2,0,0,0,2.5,10.544l1,.578a1.011,1.011,0,0,1,.5.891A.994.994,0,0,1,3.5,12.877Zm1-3.487-1-.578L4.99,6.234l1.074.62a2.86,2.86,0,0,0,2.85,0l.154-.088A2.863,2.863,0,0,0,10.5,4.294V3h3V4.216a3.008,3.008,0,0,0,4.5,2.6l1.007-.582L20.5,8.812l-1,.578a3.024,3.024,0,0,0,0,5.219l1,.579h0l-1.488,2.578L18,17.184a3.008,3.008,0,0,0-4.5,2.6V21h-3V19.784a3.006,3.006,0,0,0-4.5-2.6l-1.007.582L3.5,15.188l1-.579a3.024,3.024,0,0,0,0-5.219Z"></path></g></svg>
`;

export default function IndexPage() {
  const router = useRouter();
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptInputValue, setPromptInputValue] = useState('');
  const { isAdminAuthenticated, setIsAdminAuthenticated } = useAuth(); // Use useAuth hook

  const showAdminPrompt = () => {
    if (isAdminAuthenticated) {
      router.push({ pathname: '/admin' });
      return;
    }

    if (Platform.OS === 'web') {
      const password = window.prompt('Admin Password', 'Enter password to access admin page:');
      if (password === ADMIN_PASSWORD) {
        setIsAdminAuthenticated(true);
        router.push({ pathname: '/admin' });
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
      setIsAdminAuthenticated(true);
      router.push({ pathname: '/admin' });
    } else {
      Alert.alert('Incorrect Password', 'Please try again.');
    }
  };

  const handlePromptCancel = () => {
    setIsPromptVisible(false);
    setPromptInputValue('');
  };

  return (
    <View style={styles.screenContainer}>
      <TouchableOpacity onPress={showAdminPrompt} style={styles.settingsButton}>
        <SvgXml xml={settingsIconSvg} width="30" height="30" fill="black" />
      </TouchableOpacity>
      
      <Text style={styles.title}>عيادات العشري</Text>

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
          onPress={() => router.push({ pathname: '/cases' })}
        >
          <Text style={styles.buttonText}>اعرف ترتيبك</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#1a73e8', borderRadius: 10 } ]}
          onPress={() => router.push({ pathname: '/doctors' })}
        >
          <Text style={styles.buttonText}>الأطباء</Text>
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
    position: 'relative', // Added for absolute positioning of settings button
  },
  settingsButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 1,
    padding: 10,
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
    fontSize: 26,
    fontFamily: 'SegoeUI',
  },
});