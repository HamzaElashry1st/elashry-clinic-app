typescriptreact
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

type ScreenName = 'home' | 'booking' | 'cases';

interface Patient {
  id: string;
  name: string;
  specialty: string;
}

interface CasesScreenProps {
  navigateTo: (screen: ScreenName) => void;
}

const CasesScreen = ({ navigateTo }: CasesScreenProps) => {
  const [patientIdToRemove, setPatientIdToRemove] = useState('');
  const [patientsData, setPatientsData] = useState<Patient[]>([]);

  const fetchPatients = () => {
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
          // Handle case where no patients are found, perhaps set an empty array or a message state
        }
        setPatientsData(patientList);
      })
      .catch((error) => {
        alert('Error fetching patients: ' + error.message);
        setPatientsData([]);
      });
  };

  const removePatient = () => {
    if (patientIdToRemove) {
      database.ref('/patients/' + patientIdToRemove).remove()
        .then(() => {
          alert('Patient removed successfully!');
          setPatientIdToRemove('');
          fetchPatients(); // Refresh the list after removal
        })
        .catch((error) => {
          alert('Error removing patient: ' + error.message);
        });
    } else {
      alert('Please enter a patient ID to remove.');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []); // Fetch patients when the component mounts

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
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

export default CasesScreen;