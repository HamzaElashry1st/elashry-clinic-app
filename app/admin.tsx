import { useRouter } from 'expo-router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

interface Patient {
    id: string;
    name: string;
    specialty: string;
    priority: number;
    time?: number; 
}

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

export default function AdminScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'cases' | 'doctors' | 'specialties'>('cases');
    const [patientsData, setPatientsData] = useState<Patient[]>([]);
    const [currentSpecialtyIndex, setCurrentSpecialtyIndex] = useState(0);
    const [specialties, setSpecialties] = useState<string[]>([]);
    const currentSpecialty = specialties[currentSpecialtyIndex] || "جميع التخصصات";
    const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);
    const [currentDoctorViewIndex, setCurrentDoctorViewIndex] = useState(0);
    const [newDoctorName, setNewDoctorName] = useState('');
    const [newDoctorValue, setNewDoctorValue] = useState('');
    const [openSpecialtyDropdown, setOpenSpecialtyDropdown] = useState(false);
    const [selectedDoctorSpecialty, setSelectedDoctorSpecialty] = useState<string | null>(null);
    const [doctorSpecialtyItems, setDoctorSpecialtyItems] = useState<{label: string, value: string}[]>([]);
    const [newSpecialty, setNewSpecialty] = useState('');
    const [specialtiesData, setSpecialtiesData] = useState<Specialty[]>([]);

    useEffect(() => {
        autoDeleteOldEntries();
        fetchSpecialties();

        if (activeTab === 'cases') {
            fetchPatients();
        } else if (activeTab === 'doctors') {
            fetchDoctors();
        } else if (activeTab === 'specialties') {
            fetchSpecialties();
        }
    }, [activeTab, currentSpecialtyIndex]);

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
                setSpecialties([...specialtyNames, "جميع التخصصات"]);
                setDoctorSpecialtyItems(specialtyNames.map(s => ({ label: s, value: s })));
            })
            .catch((error: any) => {
                Alert.alert('Error', 'Error fetching specialties: ' + error.message);
            });
    };

    const addSpecialty = () => {
        if (!newSpecialty) {
            Alert.alert('Error', 'Please enter a specialty name.');
            return;
        }
        const newSpecialtyRef = database.ref('/specialties');
        newSpecialtyRef.push(newSpecialty)
            .then(() => {
                Alert.alert('Success', 'Specialty added successfully!');
                setNewSpecialty('');
                fetchSpecialties();
            })
            .catch((error: any) => {
                Alert.alert('Error', 'Error adding specialty: ' + error.message);
            });
    };

    const removeSpecialty = (specialtyId: string) => {
        database.ref('/specialties/' + specialtyId).remove()
            .then(() => {
                Alert.alert('Success', 'Specialty removed successfully!');
                fetchSpecialties();
            })
            .catch((error: any) => {
                Alert.alert('Error', 'Error removing specialty: ' + error.message);
            });
    };

   const autoDeleteOldEntries = () => {
        const timeToRemove = Date.now() - (3 * 24 * 60 * 60 * 1000);
        database.ref('/patients').once('value')
            .then((snapshot) => {
                const patients = snapshot.val() || {};
                Object.keys(patients).forEach(key => {
                    const patientData = patients[key] || {};
                    if (patientData.time && patientData.time < timeToRemove) {
                        database.ref('/patients/' + key).remove()
                    }
                });
                fetchPatients();
            })
    };

  const fetchPatients = () => {
    database
      .ref('/patients')
      .once('value')
      .then((snapshot) => {
        const patients = snapshot.val() || {};
        let patientList: Patient[] = Object.keys(patients).map(key => ({
            id: key,
            ...patients[key]
        }));

        const filteredPatients = currentSpecialty === 'جميع التخصصات'
            ? patientList
            : patientList.filter((patient) => patient.specialty === currentSpecialty);

          filteredPatients.sort((a, b) => a.priority - b.priority);

          setPatientsData(filteredPatients);
      })
      .catch((error: any) => {
        Alert.alert('Error', 'Error fetching patients: ' + (error as Error).message);
        setPatientsData([]);
      });
  };

    const removePatient = (patientId: string) => {
        if (patientId) {
            database.ref('/patients/' + patientId + '/priority').once('value')
                .then(snapshot => {
                    const removedPriority = snapshot.val();
                    database.ref('/patients/' + patientId).remove()
                        .then(() => {
                            Alert.alert('Success', 'Patient removed successfully from the list!');
                            updatePrioritiesAfterDeletion(removedPriority);
                        })
                })
        }
    };

    const updatePrioritiesAfterDeletion = (removedPriority: number) => {
        database.ref('/patients').orderByChild('priority').once('value')
            .then(snapshot => {
                const patients = snapshot.val() || {};
                    let updates: any = {};
                    Object.keys(patients).forEach(key => {
                        const patient = patients[key] as Patient;
                        if (patient.priority > removedPriority) {
                            updates['/patients/' + key + '/priority'] = patient.priority -1;
                        }
                    });
                    return database.ref().update(updates);
            })
             .then(() => {
                fetchPatients();
            })
    };

   const updatePatientPriority = async (patientId: string, direction: number) => {
    try {
        if (!patientId) {
            Alert.alert('Error', 'Patient ID is undefined.');
            return;
        }

        const patientRef = database.ref('/patients/' + patientId);
        const patientSnapshot = await patientRef.once('value');
        const patient = patientSnapshot.val() as Patient;

        if (!patient) {
            Alert.alert('Error', 'Patient not found.');
            return;
        }

        const currentPriority = patient.priority;
        const targetPriority = currentPriority + direction;

        const patientsRef = database.ref('/patients');
        // Fetch all patients of the same specialty
        const snapshot = await patientsRef
            .orderByChild('specialty')
            .equalTo(patient.specialty)
            .once('value');

        if (snapshot.exists()) {
            const patients: { [key: string]: Patient } = snapshot.val();
            let swapPatientId: string | null = null;

            // Find the patient with the target priority
            for (const patientKey in patients) {
                if (patients[patientKey].priority === targetPriority) {
                    swapPatientId = patientKey;
                    break;
                }
            }

            if (swapPatientId) {
                const swapPatientRef = database.ref('/patients/' + swapPatientId);
                const swapPatientSnapshot = await swapPatientRef.once('value');
                const swapPatient = swapPatientSnapshot.val() as Patient;

                if (swapPatient) {
                    await database.ref('/patients/' + patientId).update({ priority: swapPatient.priority });
                    await database.ref('/patients/' + swapPatientId).update({ priority: currentPriority });
                    fetchPatients();
                } else {
                    Alert.alert('Error', 'Swap patient data not found.');
                }
            } else {
                Alert.alert('Error', 'No patient found with the target priority.');
            }
        } else {
            Alert.alert('Error', 'No patients found for this specialty.');
        }

    } catch (error: any) {
        Alert.alert('Error', 'Error updating patient priority: ' + error.message);
    }
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

                    if (currentDoctorViewIndex > doctorList.length) {
                        setCurrentDoctorViewIndex(doctorList.length > 0 ? doctorList.length : 0);
                    }
                } else {
                    setDoctorsData([]);
                    setCurrentDoctorViewIndex(0);
                }
            })
    };

    const addDoctor = () => {
        if (!newDoctorName || !newDoctorValue || !selectedDoctorSpecialty) {
            Alert.alert('Error', 'Please enter doctor name, clinic time, and select a specialty.');
            return;
        }
        const timestamp = Date.now();
        const newDoctorRef = database.ref('/doctors/' + timestamp);
        newDoctorRef.set({
            name: newDoctorName,
            value: newDoctorValue,
            specialty: selectedDoctorSpecialty,
        })
            .then(() => {
                Alert.alert('Success', 'Doctor added successfully!');
                setNewDoctorName('');
                setNewDoctorValue('');
                setSelectedDoctorSpecialty(null);
                setCurrentDoctorViewIndex(0);
                fetchDoctors();
            })
    };

    const updateDoctor = () => {
        const selectedDoctor = doctorsData[currentDoctorViewIndex - 1];
        if (!selectedDoctor) {
            Alert.alert('Error', 'No doctor selected for update.');
            return;
        }
        if (!newDoctorName || !newDoctorValue || !selectedDoctorSpecialty) {
            Alert.alert('Error', 'Please enter doctor name, clinic time, and select a specialty for update.');
            return;
        }

        database.ref('/doctors/' + selectedDoctor.id).update({
            name: newDoctorName,
            value: newDoctorValue,
            specialty: selectedDoctorSpecialty,
        })
            .then(() => {
                Alert.alert('Success', 'Doctor updated successfully!');
                fetchDoctors();
            })
    };

    const removeDoctor = () => {
        const selectedDoctor = doctorsData[currentDoctorViewIndex - 1];
        if (!selectedDoctor) {
            Alert.alert('Error', 'No doctor selected for removal.');
            return;
        }

        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this doctor?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => {
                        database.ref('/doctors/' + selectedDoctor.id).remove()
                            .then(() => {
                                Alert.alert('Success', 'Doctor removed successfully!');
                                const newIndex = Math.max(0, currentDoctorViewIndex - 1);
                                setCurrentDoctorViewIndex(newIndex);
                                fetchDoctors();
                            })
                    },
                    style: "destructive"
                }
            ]
        );
    };


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

    const goToNextDoctor = () => {
        setCurrentDoctorViewIndex((prevIndex) => {
            const totalOptions = doctorsData.length + 1;
            return (prevIndex + 1) % totalOptions;
        });
    };

    const goToPreviousDoctor = () => {
        setCurrentDoctorViewIndex((prevIndex) => {
            const totalOptions = doctorsData.length + 1;
            return (prevIndex - 1 + totalOptions) % totalOptions;
        });
    };

    const currentDoctorDisplayName = () => {
        if (currentDoctorViewIndex === 0) {
            return '+ إضافة دكتور';
        } else {
            return doctorsData[currentDoctorViewIndex - 1]?.name || '';
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.screenContainer}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'cases' && styles.activeTabButton]}
                    onPress={() => setActiveTab('cases')}
                >
                    <Text style={[styles.tabButtonText, activeTab === 'cases' && styles.activeTabButtonText]}>الحالات</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'doctors' && styles.activeTabButton]}
                    onPress={() => setActiveTab('doctors')}
                >
                    <Text style={[styles.tabButtonText, activeTab === 'doctors' && styles.activeTabButtonText]}>الأطباء</Text>
                </TouchableOpacity>
                 <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'specialties' && styles.activeTabButton]}
                    onPress={() => setActiveTab('specialties')}
                >
                    <Text style={[styles.tabButtonText, activeTab === 'specialties' && styles.activeTabButtonText]}>التخصصات</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'cases' && (
                <>
                    <View style={styles.specialtyBar}>
                        <TouchableOpacity onPress={goToPreviousSpecialty} style={styles.arrowButton}>
                            <Text style={[styles.arrowText, { fontWeight: 'bold' }]}>&lt;</Text>
                        </TouchableOpacity>
                        <Text style={styles.specialtyText}>{currentSpecialty}</Text>
                        <TouchableOpacity onPress={goToNextSpecialty} style={styles.arrowButton}>
                            <Text style={[styles.arrowText, { fontWeight: 'bold' }]}>&gt;</Text>
                        </TouchableOpacity>
                    </View>

                    {patientsData.length > 0 ? (
                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableHeader}>الاسم</Text>
                                <Text style={styles.tableHeader}>التخصص</Text>
                                <Text style={styles.tableHeader}>تعديل الاولوية</Text>
                            </View>
                            {patientsData.map((patient: Patient, index) => (
                                <View key={String(patient.id)} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{String(patient.name || '')}</Text>
                                    <Text style={styles.tableCell}>{String(patient.specialty || '')}</Text>
                                      <View style={styles.actionsCell}>
                                         {currentSpecialty !== 'جميع التخصصات' && (
                                            <>
                                                 <TouchableOpacity onPress={() => updatePatientPriority(patient.id,  -1)}>
                                                      <Text style={styles.priorityButton}>▲</Text>
                                                  </TouchableOpacity>
                                                 <TouchableOpacity onPress={() => updatePatientPriority(patient.id, 1)}>
                                                      <Text style={styles.priorityButton}>▼</Text>
                                                  </TouchableOpacity>
                                            </>
                                         )}
                                    </View>
                                    <View style={styles.actionsCell}>
                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            style={[styles.button, styles.tableButton]}
                                            onPress={() => removePatient(patient.id)}
                                        >
                                            <Text style={styles.buttonText}>حذف</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noCasesText}>لا توجد حالات لهذه التخصص.</Text>
                    )}
                </>
            )}
            
            {activeTab === 'specialties' && (
                <View style={styles.doctorManagementContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="اسم التخصص الجديد"
                        value={newSpecialty}
                        onChangeText={setNewSpecialty}
                        multiline={false}
                    />
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={[styles.button, { backgroundColor: '#4CAF50', width: '100%', marginBottom: 20 }]}
                        onPress={addSpecialty}
                    >
                        <Text style={styles.buttonText}>إضافة تخصص</Text>
                    </TouchableOpacity>
                    {specialtiesData.map((spec) => (
                        <View key={spec.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{spec.name}</Text>
                            <View style={styles.actionsCell}>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    style={[styles.button, styles.tableButton]}
                                    onPress={() => removeSpecialty(spec.id)}>
                                    <Text style={styles.buttonText}>حذف</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
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

            {activeTab === 'doctors' && (
                <View style={styles.doctorManagementContainer}>
                    <View style={styles.specialtyBar}>
                        <TouchableOpacity onPress={goToPreviousDoctor} style={styles.arrowButton}>
                            <Text style={[styles.arrowText, { fontWeight: 'bold' }]}>&lt;</Text>
                        </TouchableOpacity>
                        <Text style={styles.specialtyText}>{currentDoctorDisplayName()}</Text>
                        <TouchableOpacity onPress={goToNextDoctor} style={styles.arrowButton}>
                            <Text style={[styles.arrowText, { fontWeight: 'bold' }]}>&gt;</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="اسم الدكتور"
                        value={newDoctorName}
                        onChangeText={setNewDoctorName}
                        multiline={false}
                    />

                    <DropDownPicker
                        open={openSpecialtyDropdown}
                        value={selectedDoctorSpecialty}
                        items={doctorSpecialtyItems}
                        setOpen={setOpenSpecialtyDropdown}
                        setValue={setSelectedDoctorSpecialty}
                        setItems={setDoctorSpecialtyItems}
                        style={styles.dropdownPicker}
                        containerStyle={styles.dropdownContainer}
                        textStyle={styles.dropdownText}
                        labelStyle={styles.dropdownLabel}
                        dropDownContainerStyle={[styles.dropdownMenuContainer, { maxHeight: 200 }]}
                        selectedItemLabelStyle={styles.dropdownSelectedItemLabel}
                        placeholder="اختر التخصص"
                        listMode="SCROLLVIEW"
                        zIndex={3000}
                        zIndexInverse={1000}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="أوقات تواجد الدكتور"
                        value={newDoctorValue}
                        onChangeText={setNewDoctorValue}
                        multiline={true}
                        numberOfLines={5}
                    />

                    <View style={styles.buttonRow}>
                        {currentDoctorViewIndex === 0 ? (
                            <TouchableOpacity
                                activeOpacity={0.6}
                                style={[styles.button, { backgroundColor: '#4CAF50', flex: 1, marginHorizontal: 5 }]}
                                onPress={addDoctor}
                            >
                                <Text style={styles.buttonText}>إضافة طبيب جديد</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    style={[styles.button, { backgroundColor: '#2196F3', flex: 1, marginHorizontal: 5 }]}
                                    onPress={updateDoctor}
                                >
                                    <Text style={styles.buttonText}>تحديث الطبيب</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    style={[styles.button, { backgroundColor: '#f44336', flex: 1, marginHorizontal: 5 }]}
                                    onPress={removeDoctor}
                                >
                                    <Text style={styles.buttonText}>حذف الطبيب</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                </View>
            )}

           
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        justifyContent: 'center',
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeTabButton: {
        backgroundColor: '#007AFF',
    },
    tabButtonText: {
        fontSize: 20,
        fontFamily: 'SegoeUI',
        color: '#333333',
    },
    activeTabButtonText: {
        color: 'white',
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
    },
    arrowButton: {
       paddingHorizontal: 20,
        paddingVertical: 10,
    },
    arrowText: {
        fontSize: 30,
        fontFamily: 'SegoeUI',
        color: '#333',
    },
    specialtyText: {
        fontSize: 32,
        fontFamily: 'SegoeUI',
        color: '#333333',
        textAlign: 'center',
        flex: 1,
    },
    input: {
        borderColor: 'gray',
        borderWidth: 2,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        minWidth: 200,
        fontFamily: 'SegoeUI',
        fontSize: 24,
        width: '100%',
        textAlign: 'right',
        paddingVertical: 10,
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
        minWidth: 80,
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
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
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
        backgroundColor: '#d93025',
        paddingVertical: 5,
        paddingHorizontal: 10,
        margin: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorManagementContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 28,
        fontFamily: 'SegoeUI',
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    dropdownContainer: {
        width: '100%',
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
        textAlign: 'right',
    },
    dropdownLabel: {
        fontFamily: 'SegoeUI',
        fontSize: 24,
        color: '#333333',
        textAlign: 'right',
    },
    dropdownSelectedItemLabel: {
        fontFamily: 'SegoeUI',
        fontSize: 24,
        color: '#333333',
    },
    dropdownMenuContainer: {
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    actionsCell: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityButton: {
        fontSize: 24,
        padding: 5,
    },
});
