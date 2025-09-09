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
    priority: number;
}

export default function CasesScreen() {
    const router = useRouter();
    const [patientsData, setPatientsData] = useState<Patient[]>([]);
    const [currentSpecialtyIndex, setCurrentSpecialtyIndex] = useState(0);
    const [specialties, setSpecialties] = useState<string[]>([]);
    const currentSpecialty = specialties[currentSpecialtyIndex];

    useEffect(() => {
        database.ref('/specialties').once('value')
            .then(snapshot => {
                const specialtiesData = snapshot.val() || {};
                const loadedSpecialties = Object.values(specialtiesData);
                setSpecialties(loadedSpecialties as string[]);
            })
            .catch(error => {
                Alert.alert('Error', 'Could not fetch specialties.')
            })

        const patientsRef = database.ref('/patients');
        patientsRef.on('value', (snapshot) => {
            const patients = snapshot.val() || {};
            const patientList: Patient[] = Object.keys(patients).map(key => ({
                id: key,
                name: patients[key].name,
                specialty: patients[key].specialty,
                priority: patients[key].priority !== undefined && patients[key].priority !== null ? patients[key].priority : 0,
            }));

            const filteredPatients = patientList.filter(patient => patient.specialty === currentSpecialty);

            filteredPatients.sort((a, b) => a.priority - b.priority);

            setPatientsData(filteredPatients);
        });

        return () => patientsRef.off('value');
    }, [currentSpecialty]);

    const goToNextSpecialty = () => {
        if (specialties.length === 0) return;
        setCurrentSpecialtyIndex(prevIndex => (prevIndex + 1) % specialties.length);
    };

    const goToPreviousSpecialty = () => {
        if (specialties.length === 0) return;
        setCurrentSpecialtyIndex(prevIndex => (prevIndex - 1 + specialties.length) % specialties.length);
    };

    return (
        <ScrollView contentContainerStyle={styles.screenContainer}>
            <View style={styles.specialtyBar}>
                <TouchableOpacity onPress={goToPreviousSpecialty} style={[styles.arrowButton, { flex: 1, alignItems: 'flex-start' }]}>
                <Text style={styles.label}>التخصص السابق</Text>
                    <Text style={styles.arrowText}>&lt;</Text>
                </TouchableOpacity>
                <View style={[styles.specialtyInfo, { flex: 2, alignItems: 'center' }]}>
                    <Text style={styles.label}>التخصص</Text>
                    <Text style={styles.specialtyText}>{currentSpecialty}</Text>
                </View>
                <TouchableOpacity onPress={goToNextSpecialty} style={[styles.arrowButton, { flex: 1, alignItems: 'flex-end' }]}>
                    <Text style={styles.label}>التخصص التالي</Text>
                    <Text style={styles.arrowText}>&gt;</Text>
                </TouchableOpacity>
            </View>

            {patientsData.length > 0 ? (
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>الاسم</Text>
                        <Text style={styles.tableHeader}>التخصص</Text>
                        <Text style={styles.tableHeader}>الترتيب</Text>
                    </View>
                    {patientsData.map((patient, index) => (
                        <View key={patient.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{patient.name}</Text>
                            <Text style={styles.tableCell}>{patient.specialty}</Text>
                            <Text style={styles.tableCell}>{patient.priority}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.noCasesText}>لا توجد حالات لهذه التخصص.</Text>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity activeOpacity={0.6} style={[styles.button, { backgroundColor: '#5f6368' }]} onPress={() => router.push('/')}>
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
        alignItems: 'center',
        width: '100%',
        paddingVertical: 15,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
        borderRadius: 10,
        paddingHorizontal: 10, // Add padding here
    },
    arrowButton: {
        // paddingHorizontal: 20,  // Removed to allow flex
        paddingVertical: 10,
    },
    arrowText: {
        fontSize: 30,
        fontFamily: 'SegoeUI',
        color: '#333333',
    },
    specialtyInfo: {
        // flex: 1, // Removed to allow flex on the arrow buttons
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
        fontSize: 24,
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
        fontSize: 22,
    },
    tableCell: {
        flex: 1,
        padding: 10,
        textAlign: 'center',
        fontFamily: 'SegoeUI',
        fontSize: 22,
    },
    noCasesText: {
        fontSize: 28,
        padding: 10,
        textAlign: 'center',
        fontFamily: 'SegoeUI',
    },
});