import { useRouter } from 'expo-router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

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

export const rawSpecialties = [
  'الأسنان',
  'الجلدية',
  'الأطفال',
  'النساء والتوليد',
  'الجراحة',
  'الأنف والأذن والحنجرة',
  'العلاج الطبيعي',
];

const specialties = rawSpecialties.map(s => ({ label: s, value: s }));

export default function BookingScreen() {
  const router = useRouter();
  const [patientName, setPatientName] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(specialties[0].value);
  const [items, setItems] = useState(specialties);

  const addPatient = () => {
    console.log('addPatient called');
    if (patientName && value) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const timeSinceYearStartMilliseconds = now.getTime() - startOfYear.getTime();
      const timeSinceYearStart = Math.round(timeSinceYearStartMilliseconds / 1000);
      const year = now.getFullYear();
      const patientId = `${year}${timeSinceYearStart}`;
      const newPatientRef = database.ref(`/patients/${patientId}`);
      newPatientRef.set({
        name: patientName,
        specialty: value,
        time: firebase.database.ServerValue.TIMESTAMP,
      })
        .then(() => {
          console.log('Patient added successfully!');
          Alert.alert('Success', 'Patient added successfully!');
          setPatientName('');
          setValue(specialties[0].value);
          router.push('/');
        })
        .catch((error) => {
          console.error('Error adding patient:', error.message);
          Alert.alert('Error', 'Error adding patient: ' + error.message);
        });
    } else {
      Alert.alert('Error', 'Please enter patient name and select a specialty.');
    }
  };

  return (
    <View style={styles.screenContainer}>
      <TextInput
        style={styles.input}
        placeholder="اسم الحالة"
        placeholderTextColor="#333333"
        value={patientName}
        onChangeText={setPatientName}
      />
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={styles.dropdownPicker}
        containerStyle={styles.dropdownContainer}
        textStyle={styles.dropdownText}
        labelStyle={styles.dropdownLabel}
        dropDownContainerStyle={[styles.dropdownMenuContainer, { maxHeight: 200 }]} // Added maxHeight
        selectedItemLabelStyle={styles.dropdownSelectedItemLabel}
        placeholder="اختر التخصص"
        zIndex={3000}
        zIndexInverse={1000}
        listMode="SCROLLVIEW" // Explicitly set listMode to SCROLLVIEW
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
    flex: 1, // Changed flexGrow to flex to ensure it takes up available space
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
    backgroundColor: '#ffffff',
  },
  dropdownContainer: {
    width: 200,
    marginBottom: 20,
    // Removed zIndex from here as it's now handled by the DropDownPicker prop
  },
  dropdownPicker: {
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    minHeight: 60,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontFamily: 'ArefRuqaa-Regular',
    fontSize: 20,
    color: '#333333',
    textAlign: 'left',

  },
  dropdownLabel: {
    fontFamily: 'ArefRuqaa-Regular',
    fontSize: 30,
    color: '#333333',
    textAlign: 'left',
  },
  dropdownSelectedItemLabel: {
    fontFamily: 'ArefRuqaa-Regular',
    fontSize: 20,
    color: '#333333',
  },
  dropdownMenuContainer: {
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: '#ffffff',
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
    fontSize: 30,
    fontFamily: 'ArefRuqaa-Regular',
  },
  table: {
    minWidth: '100%',
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#ccc',
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f2f2f2',
    fontFamily: 'ArefRuqaa-Regular',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontFamily: 'ArefRuqaa-Regular',
  },
  noCasesText: {
    fontSize: 28,
    padding: 10,
    textAlign: 'center',
    fontFamily: 'ArefRuqaa-Regular',
  },
  tableButton: {
    flex: 1,
    backgroundColor: '#d93025',
    paddingVertical: 5,
    margin: 5,
  },
});