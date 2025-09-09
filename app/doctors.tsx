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

interface Doctor {
  id: string;
  name: string;
  value: string;
  specialty: string;
}

interface Specialty {
  id: string;
  name: string;
}

export default function DoctorsScreen() {
  const router = useRouter();
  const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);
  const [currentSpecialtyIndex, setCurrentSpecialtyIndex] = useState(0);
  const [specialtiesData, setSpecialtiesData] = useState<Specialty[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const currentSpecialty = specialties[currentSpecialtyIndex] || "جميع التخصصات";

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = () => {
    database.ref('/specialties').once('value')
      .then((snapshot) => {
        const specialtiesData = snapshot.val() || {};
        const loadedSpecialties: Specialty[] = Object.keys(specialtiesData).map(key => ({
          id: key,
          name: specialtiesData[key]
        }));
        setSpecialtiesData(loadedSpecialties);
        const specialtyNames = loadedSpecialties.map(s => s.name);
        setSpecialties(["جميع التخصصات", ...specialtyNames]);
      })
      .catch((error: any) => {
        Alert.alert('Error', 'Error fetching specialties: ' + error.message);
      });
  };

  const fetchDoctors = () => {
    database.ref('/doctors').once('value')
      .then((snapshot) => {
        const doctors = snapshot.val();
        let doctorList: Doctor[] = [];
        if (doctors) {
          Object.keys(doctors).forEach(key => {
            doctorList.push({ id: key, ...doctors[key] });
          });
          setDoctorsData(doctorList);
        } else {
          setDoctorsData([]);
        }
      })
      .catch((error) => {
        Alert.alert('Error', 'Error fetching doctors: ' + error.message);
        setDoctorsData([]);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const goToNextSpecialty = () => {
    setCurrentSpecialtyIndex((prevIndex) =>
      (prevIndex + 1) % specialties.length
    );
  };

  const goToPreviousSpecialty = () => {
    setCurrentSpecialtyIndex((prevIndex) =>
      (prevIndex - 1 + specialties.length) % specialties.length
    );
  };

  const filteredDoctors = currentSpecialty === 'جميع التخصصات'
    ? doctorsData
    : doctorsData.filter(doctor => doctor.specialty === currentSpecialty);

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <View style={styles.specialtyBar}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={goToPreviousSpecialty} style={styles.arrowButton}>
            <Text style={styles.arrowLabel}>التخصص السابق</Text>
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.specialtyTextContainer}>
          <Text style={styles.label}>التخصص</Text>
          <Text style={styles.specialtyText}>{currentSpecialty}</Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={goToNextSpecialty} style={styles.arrowButton}>
            <Text style={styles.arrowLabel}>التخصص التالي</Text>
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredDoctors.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>الاسم</Text>
            <Text style={styles.tableHeader}>التخصص</Text>
            <Text style={styles.tableHeader}>أوقات التواجد</Text>
          </View>
          {filteredDoctors.map((doctor: Doctor) => (
            <View key={String(doctor.id)} style={styles.tableRow}>
              <Text style={styles.tableCell}>{String(doctor.name || '')}</Text>
              <Text style={styles.tableCell}>{String(doctor.specialty || '')}</Text>
              <Text style={styles.tableCell}>{String(doctor.value || '')}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noCasesText}>لا توجد بيانات أطباء لعرضها.</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  specialtyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
    borderRadius: 10,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  arrowButton: {
    alignItems: 'center',
  },
  arrowLabel: {
    fontSize: 16,
    fontFamily: 'SegoeUI',
    color: '#666666',
    textAlign: 'center',
  },
  arrowText: {
    fontSize: 30,
    fontFamily: 'SegoeUI',
    color: '#333333',
    fontWeight: 'bold',
  },
  specialtyTextContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtyText: {
    fontSize: 32,
    fontFamily: 'SegoeUI',
    color: '#333333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: 'SegoeUI',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
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
    fontSize: 24,
    fontFamily: 'SegoeUI',
  },
  table: {
    width: '100%',
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
});