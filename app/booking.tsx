import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Initialize Firebase (if not already initialized)
const firebaseConfig = {
  apiKey: "AIzaSyB1bm_0TI5WytMlmP3IfZM1zhqDpvLBPn4",
  authDomain: "elashryclinic-22e84.firebaseapp.com",
  databaseURL: "https://elashryclinic-22e84-default-rtdb.firebaseio.com",
  projectId: "elashryclinic-22e84",
  storageBucket: "elashryclinic-22e84.firebasestorage.app",
  messagingSenderId: "94154446201",
  appId: "1:94154446201:web:fca72a62bd6843f985cba8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

export default function BookingScreen() {
  const router = useRouter();
  const [patientName, setPatientName] = useState('');
  const [patientSpecialty, setPatientSpecialty] = useState('');

  const addPatient = () => {
    console.log('addPatient called');
    if (patientName && patientSpecialty) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const timeSinceYearStartMilliseconds = now.getTime() - startOfYear.getTime();
      const timeSinceYearStart = Math.round(timeSinceYearStartMilliseconds / 1000); // Convert milliseconds to seconds and round
      const year = now.getFullYear();
      const newPatientRef = database.ref(`/patients/${year}${timeSinceYearStart}`);
      newPatientRef.set({
        name: patientName,
        specialty: patientSpecialty,
      })
        .then(() => {
          console.log('Patient added successfully!');
          Alert.alert('Success', 'Patient added successfully!');
          setPatientName('');
          setPatientSpecialty('');
          router.push('/'); // Navigate back to home
        })
        .catch((error) => {
          console.error('Error adding patient:', error.message);
          Alert.alert('Error', 'Error adding patient: ' + error.message);
        });
    } else {
      Alert.alert('Error', 'Please enter patient name and specialty.');
    }
  };

  return (
    <View style={styles.screenContainer}>
      <TextInput
        style={styles.input}
        placeholder="اسم الحالة"
        value={patientName}
        onChangeText={setPatientName}
      />
      <TextInput
        style={styles.input}
        placeholder="التخصص"
        value={patientSpecialty}
        onChangeText={setPatientSpecialty}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#1a73e8' }]}
          onPress={addPatient}
        >
          <Text style={styles.buttonText}>إرسال</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
          <TouchableOpacity activeOpacity={0.6} style={[styles.button, { backgroundColor: '#5f6368' }]} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>عودة</Text>
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
  input: {
    borderColor: 'gray',
    borderWidth: 2,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 200,
    fontFamily: 'ArefRuqaa-Regular',
    fontSize: 36,
  },
  buttonContainer: {
    width: 170,
    marginVertical: 10,
    transitionProperty: 'all',
    transitionDelay: '0.0s',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    transitionProperty: 'all',
    transitionDelay: '0.0s',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});