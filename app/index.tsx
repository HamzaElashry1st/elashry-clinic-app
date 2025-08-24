import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LogBox, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
]);

const database = firebase.database();
const { width } = Dimensions.get('window');

type ScreenName = 'home' | 'booking' | 'cases';

interface Patient {
  id: string;
  name: string;
  specialty: string;
}

interface HomeScreenProps {
  navigateTo: (screen: ScreenName) => void;
}

interface BookingScreenProps {
  navigateTo: (screen: ScreenName) => void;
  patientName: string;
  setPatientName: (name: string) => void;
  patientSpecialty: string;
  setPatientSpecialty: (specialty: string) => void;
  addPatient: () => void;
}

interface CasesScreenProps {
  navigateTo: (screen: ScreenName) => void;
  patientIdToRemove: string;
  setPatientIdToRemove: (id: string) => void;
  patientsData: Patient[];
  removePatient: () => void;
  fetchPatients: () => void;
}

const HomeScreen = ({ navigateTo }: HomeScreenProps) => {
  return (
    <View style={[styles.screenContainer, { width }]}>
      <Text style={styles.title}>عيادات العشري</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#1a73e8', borderRadius: 10 }]}
          onPress={() => navigateTo('booking')}
        >
          <Text style={styles.buttonText}>الحجز</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#1a73e8', borderRadius: 10 }]}
          onPress={() => navigateTo('cases')}
        >
          <Text style={styles.buttonText}>الحالات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BookingScreen = ({ navigateTo, patientName, setPatientName, patientSpecialty, setPatientSpecialty, addPatient }: BookingScreenProps) => {
  console.log('BookingScreen rendered');
  return (
    <View style={[styles.screenContainer, { width }]}>
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
          <TouchableOpacity activeOpacity={0.6} style={[styles.button, { backgroundColor: '#5f6368' }]} onPress={() => navigateTo('home')}>
          <Text style={styles.buttonText}>عودة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CasesScreen = ({ navigateTo, patientIdToRemove, setPatientIdToRemove, patientsData, removePatient, fetchPatients }: CasesScreenProps) => {
  console.log('CasesScreen rendered');
  useEffect(() => {
    console.log('CasesScreen useEffect: Calling fetchPatients');
    fetchPatients();
  }, []); // Fetch patients when the component mounts

  return (
    <ScrollView contentContainerStyle={[styles.screenContainer, { width }]}>
      <TextInput
        style={styles.input}
        placeholder="أدخل معرف المريض"
        value={String(patientIdToRemove || '')}
        onChangeText={setPatientIdToRemove}
      />
      {patientsData.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>المعرف</Text>
            <Text style={styles.tableHeader}>الاسم</Text>
            <Text style={styles.tableHeader}>التخصص</Text>
            <Text style={styles.tableHeader}></Text> {/* For the remove button */}
          </View>
          {patientsData.map((patient: Patient) => (
            <View key={String(patient.id)} style={styles.tableRow}>
              <Text style={styles.tableCell}>{String(patient.id)}</Text>
              <Text style={styles.tableCell}>{String(patient.name || '')}</Text>
              <Text style={styles.tableCell}>{String(patient.specialty || '')}</Text>
              <TouchableOpacity
                activeOpacity={0.6}
                style={[styles.button, styles.tableButton]}
                onPress={() => {
                  setPatientIdToRemove(patient.id);
                  removePatient();
                }}
              >
                <Text style={styles.buttonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.tableCell}>لا يوجد مرضى.</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#5f6368' }]}
          onPress={() => navigateTo('home')}
        >
          <Text style={styles.buttonText}>عودة</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("home");
  const [patientName, setPatientName] = useState('');
  const [patientSpecialty, setPatientSpecialty] = useState('');
  const [patientIdToRemove, setPatientIdToRemove] = useState('');
  const [patientsData, setPatientsData] = useState<Patient[]>([]);

  // Animation state
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let toValue = 0;
    if (currentScreen === 'home') {
      toValue = 0; // Home screen is at the starting position
    } else if (currentScreen === 'booking') {
      toValue = -width; // Booking screen is one width to the left
    } else if (currentScreen === 'cases') {
      toValue = -width * 2; // Cases screen is two widths to the left
    }

    Animated.timing(
      slideAnim,
      {
        toValue: toValue,
        duration: 300,
        useNativeDriver: true,
      }
    ).start();
  }, [currentScreen, slideAnim]);

  const navigateTo = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

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
          alert('Patient added successfully!');
          setPatientName('');
          setPatientSpecialty('');
          navigateTo('home');
        })
        .catch((error) => {
          console.error('Error adding patient:', error.message);
          alert('Error adding patient: ' + error.message);
        });
    } else {
      alert('Please enter patient name and specialty.');
    }
  };

  const fetchPatients = () => {
    console.log('fetchPatients called');
    database.ref('/patients').once('value')
      .then((snapshot) => {
        const patients = snapshot.val();
        const patientList: Patient[] = [];
        if (patients) {
          Object.keys(patients).forEach(key => {
            patientList.push({ id: key, ...patients[key] });
          });
          patientList.sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID descending
        } else {
          console.log('No patients found.');
          // Handle case where no patients are found, perhaps set an empty array or a message state
        }
        setPatientsData(patientList);
        console.log('Patients fetched successfully:', patientList);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error.message);
        alert('Error fetching patients: ' + error.message);
        setPatientsData([]);
      });
  };

  const removePatient = () => {
    console.log('removePatient called');
    if (patientIdToRemove) {
      database.ref('/patients/' + patientIdToRemove).remove()
        .then(() => {
          console.log('Patient removed successfully!');
          alert('Patient removed successfully!');
          setPatientIdToRemove('');
          fetchPatients(); // Refresh the list after removal
        })
        .catch((error) => {
          console.error('Error removing patient:', error.message);
          alert('Error removing patient: ' + error.message);
        });
    } else {
      alert('Please enter a patient ID to remove.');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.screenWrapper, { transform: [{ translateX: slideAnim }] }]}>
        <View style={{ width: width, flexShrink: 0 }}>
          <HomeScreen navigateTo={navigateTo} />
        </View>
        <View style={{ width: width, flexShrink: 0 }}>
          <BookingScreen
            navigateTo={navigateTo}
            patientName={patientName}
            setPatientName={setPatientName}
            patientSpecialty={patientSpecialty}
            setPatientSpecialty={setPatientSpecialty}
            addPatient={addPatient}
          />
        </View>
        <View style={{ width: width, flexShrink: 0 }}>
          <CasesScreen
            navigateTo={navigateTo}
            patientIdToRemove={patientIdToRemove}
            setPatientIdToRemove={setPatientIdToRemove}
            patientsData={patientsData}
            removePatient={removePatient}
            fetchPatients={fetchPatients}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    overflow: 'hidden', // Hide off-screen content
  },
  screenWrapper: {
    flexDirection: 'row',
    flex: 1,
    width: width * 3, // Three screens side by side
  },
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
  tableButton: {
    flex: 1,
    backgroundColor: '#d93025',
    paddingVertical: 5,
    margin: 5,
  },
});