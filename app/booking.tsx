import { useRouter } from 'expo-router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useEffect, useState } from 'react';
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

export default function BookingScreen() {
  const router = useRouter();
  const [patientName, setPatientName] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
      database.ref('/specialties').once('value')
        .then(snapshot => {
            const specialtiesData = snapshot.val() || {};
            const loadedSpecialties = Object.values(specialtiesData).map((s: any) => ({label: s, value: s}));
            setItems(loadedSpecialties);
            if (loadedSpecialties.length > 0) {
                setValue(loadedSpecialties[0].value);
            }
        })
        .catch(error => {
            Alert.alert('Error', 'Could not fetch specialties.')
        })
  }, [])

  const addPatient = () => {
    if (patientName && value) {
      if (patientName.length >= 8 && patientName.split(' ').length - 1 >= 2) {
        const now = new Date();
        const newPatientRef = database.ref(`/patients/${now.getTime()}`);

        database.ref('/patients').orderByChild('priority').limitToLast(1).once('value')
          .then(snapshot => {
            let nextPriority = 1; 
            if (snapshot.val()) {
              const lastPatient = Object.values(snapshot.val())[0];
              nextPriority = (lastPatient as any).priority + 1;
            }

            newPatientRef.set({
              name: patientName,
              specialty: value,
              priority: nextPriority,
              time: now.getTime(),
            })
              .then(() => {
                Alert.alert('Success', 'Patient added successfully!');
                setPatientName('');
                router.push('/');
              })
          });
      } else {
        Alert.alert('Error', 'يجب إدخال الاسم ثلاثي');
      }

    } else {
      Alert.alert('Error', 'Please enter patient name and select a specialty.');
    }
  };

  const handleNameChange = (text: string) => {
    const arabicRegex = new RegExp(/^[\u0621-\u064A\s]+$/);
    let validText = '';
    for (let i = 0; i < text.length; i++) {
      if (arabicRegex.test(text[i])) {
        validText += text[i];
      }
    }
    setPatientName(validText);
  };

  return (
    <View style={styles.screenContainer}>
      <TextInput
        style={styles.input}
        placeholder="اسم الحالة"
        placeholderTextColor="#333333"
        value={patientName}
        onChangeText={handleNameChange}
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
        dropDownContainerStyle={[styles.dropdownMenuContainer, { maxHeight: 200 }]} 
        selectedItemLabelStyle={styles.dropdownSelectedItemLabel}
        placeholder="اختر التخصص"
        zIndex={3000}
        zIndexInverse={1000}
        listMode="SCROLLVIEW" 
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
    flex: 1,
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
    fontFamily: 'SegoeUI',
    fontSize: 36,
    backgroundColor: '#ffffff',
  },
  dropdownContainer: {
    width: 200,
    marginBottom: 20,
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
    fontFamily: 'SegoeUI',
    fontSize: 20,
    color: '#333333',
    textAlign: 'left',

  },
  dropdownLabel: {
    fontFamily: 'SegoeUI',
    fontSize: 30,
    color: '#333333',
    textAlign: 'left',
  },
  dropdownSelectedItemLabel: {
    fontFamily: 'SegoeUI',
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
    fontFamily: 'SegoeUI',
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
    fontFamily: 'SegoeUI',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontFamily: 'SegoeUI',
  },
  noCasesText: {
    fontSize: 28,
    padding: 10,
    textAlign: 'center',
    fontFamily: 'SegoeUI',
  },
  tableButton: {
    flex: 1,
    backgroundColor: '#d93025',
    paddingVertical: 5,
    margin: 5,
  },
});