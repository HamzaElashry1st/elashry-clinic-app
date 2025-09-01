import { useRouter } from 'expo-router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface Patient {
  id: string;
  name: string;
  specialty: string;
  time?: number;
}

export default function CasesScreen() {
  const router = useRouter();
  const [patientsData, setPatientsData] = useState<Patient[]>([]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const fetchPatients = () => {
    console.log('fetchPatients called');
    database.ref('/patients').once('value')
      .then((snapshot) => {
        const patients = snapshot.val();
        const patientList: Patient[] = [];
        const timeToRemove = Date.now() - (3 * 24 * 60 * 60 * 1000);

        if (patients) {
          Object.keys(patients).forEach(key => {
            const patient = { id: key, ...patients[key] };
            // Remove patients older than 1 week
            if (patient.time && patient.time < timeToRemove) {
              database.ref('/patients/' + patient.id).remove()
                .then(() => console.log(`Patient ${patient.id} removed due to age.`))
                .catch((error) => console.error(`Error removing old patient ${patient.id}:`, error.message));
            } else {
              patientList.push(patient);
            }
          });
          patientList.sort((a, b) => (a.time || 0) - (b.time || 0));
        } else {
          console.log('No patients found.');
        }
        setPatientsData(patientList);
        console.log('Patients fetched successfully:', patientList);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error.message);
        Alert.alert('Error', 'Error fetching patients: ' + error.message);
        setPatientsData([]);
      });
  };

  const removePatient = (patientId: string) => {
    console.log('removePatient called with ID:', patientId);
    if (patientId) {
      database.ref('/patients/' + patientId).remove()
        .then(() => {
          console.log('Patient removed successfully!');
          Alert.alert('Success', 'Patient removed successfully from the list!');
          fetchPatients(); // Refresh the list after removal
        })
        .catch((error) => {
          console.error('Error removing patient:', error.message);
          Alert.alert('Error', 'Error removing patient: ' + error.message);
        });
    } else {
      Alert.alert('Error', 'Patient ID is missing.');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      {patientsData.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>الاسم</Text>
            <Text style={styles.tableHeader}>التخصص</Text>
            <Text style={styles.tableHeader}>وقت التسجيل</Text>
            <Text style={styles.tableHeader}></Text> {/* For the remove button */}
          </View>
          {patientsData.map((patient: Patient) => (
            <View key={String(patient.id)} style={styles.tableRow}>
              <Text style={styles.tableCell}>{String(patient.name || '')}</Text>
              <Text style={styles.tableCell}>{String(patient.specialty || '')}</Text>
              <Text style={styles.tableCell}>{patient.time ? formatTimestamp(patient.time) : 'N/A'}</Text>
              <TouchableOpacity
                activeOpacity={0.6}
                style={[styles.button, styles.tableButton]}
                onPress={() => removePatient(patient.id)}
              >
                <Text style={styles.buttonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noCasesText}>لا توجد حالات.</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.button, { backgroundColor: '#5f6368' }]}
          onPress={() => router.push('/')}
        >
          <Text style={styles.buttonText}>عودة</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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