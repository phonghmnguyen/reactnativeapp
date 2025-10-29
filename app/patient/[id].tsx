import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';
import type { MedicationStatus, Patient } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PatientDetailScreen() {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        loadPatient();
    }, [id]);

    const loadPatient = async () => {
        if (!id) {
            Alert.alert('Error', 'Patient ID not found');
            router.back();
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.getPatient(id);
            if (response.success && response.data) {
                setPatient(response.data);
            } else {
                Alert.alert('Error', 'Failed to load patient details');
                router.back();
            }
        } catch (error) {
            console.error('Error loading patient:', error);
            Alert.alert('Error', 'An error occurred while loading patient details');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleMedicationAction = async (
        medicationId: string,
        action: 'done' | 'delayed' | 'cancelled'
    ) => {
        if (!patient || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const status: MedicationStatus = {
                patientId: patient.id,
                medicationId,
                status: action,
                timestamp: new Date(),
            };

            if (action === 'delayed') {
                // Delay by 30 minutes
                const delayedTime = new Date(new Date().getTime() + 30 * 60000);
                status.delayedUntil = delayedTime;
            }

            // Try to update via API
            const response = await apiService.updateMedicationStatus(status);

            if (!response.success) {
                // If API call fails, cache the update
                await storageService.addPendingUpdate(status);
                Alert.alert(
                    'Offline',
                    'Update saved locally and will sync when connection is restored.'
                );
            }

            // Show success message
            let message = '';
            switch (action) {
                case 'done':
                    message = 'Medication administered successfully';
                    break;
                case 'delayed':
                    message = 'Medication delayed by 30 minutes';
                    break;
                case 'cancelled':
                    message = 'Medication cancelled';
                    break;
            }

            Alert.alert('Success', message, [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error updating medication status:', error);
            Alert.alert('Error', 'Failed to update medication status');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Loading patient details...</Text>
            </View>
        );
    }

    if (!patient) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Patient not found</Text>
            </View>
        );
    }

    const pendingMedications = patient.medications.filter(
        (med) => new Date(med.nextDueTime) <= new Date()
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Patient Details</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Patient Photo */}
                <View style={styles.photoSection}>
                    {patient.photoUrl ? (
                        <Image source={{ uri: patient.photoUrl }} style={styles.patientPhoto} />
                    ) : (
                        <View style={[styles.patientPhoto, styles.photoPlaceholder]}>
                            <Text style={styles.photoPlaceholderText}>
                                {patient.firstName[0]}
                                {patient.lastName[0]}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Patient Information */}
                <View style={styles.infoSection}>
                    <Text style={styles.patientName}>
                        {patient.firstName} {patient.lastName}
                    </Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Room:</Text>
                        <Text style={styles.infoValue}>{patient.roomNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Bed:</Text>
                        <Text style={styles.infoValue}>{patient.bedNumber}</Text>
                    </View>
                </View>

                {/* Medications */}
                <View style={styles.medicationsSection}>
                    <Text style={styles.sectionTitle}>Medications</Text>

                    {pendingMedications.length > 0 ? (
                        pendingMedications.map((medication) => (
                            <View key={medication.id} style={styles.medicationCard}>
                                <View style={styles.medicationHeader}>
                                    <View style={styles.dueBadge}>
                                        <Text style={styles.dueBadgeText}>DUE NOW</Text>
                                    </View>
                                </View>

                                <Text style={styles.medicationName}>{medication.name}</Text>
                                <View style={styles.medicationDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Dosage:</Text>
                                        <Text style={styles.detailValue}>{medication.dosage}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Frequency:</Text>
                                        <Text style={styles.detailValue}>{medication.frequency}</Text>
                                    </View>
                                    {medication.instructions && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Instructions:</Text>
                                            <Text style={styles.detailValue}>
                                                {medication.instructions}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.doneButton]}
                                        onPress={() =>
                                            handleMedicationAction(medication.id, 'done')
                                        }
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.buttonText}>Done</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.delayButton]}
                                        onPress={() =>
                                            handleMedicationAction(medication.id, 'delayed')
                                        }
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.buttonText}>Delay 30 min</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => {
                                            Alert.alert(
                                                'Cancel Medication',
                                                'Are you sure you want to cancel this medication?',
                                                [
                                                    { text: 'No', style: 'cancel' },
                                                    {
                                                        text: 'Yes',
                                                        style: 'destructive',
                                                        onPress: () =>
                                                            handleMedicationAction(medication.id, 'cancelled'),
                                                    },
                                                ]
                                            );
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noPendingCard}>
                            <Text style={styles.noPendingText}>
                                No medications due at this time
                            </Text>
                        </View>
                    )}

                    {/* All Medications Schedule */}
                    {patient.medications.filter(
                        (med) => new Date(med.nextDueTime) > new Date()
                    ).length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
                                    Upcoming Schedule
                                </Text>
                                {patient.medications
                                    .filter((med) => new Date(med.nextDueTime) > new Date())
                                    .map((medication) => (
                                        <View key={medication.id} style={styles.upcomingCard}>
                                            <Text style={styles.upcomingName}>{medication.name}</Text>
                                            <Text style={styles.upcomingDosage}>
                                                {medication.dosage} - {medication.frequency}
                                            </Text>
                                            <Text style={styles.upcomingTime}>
                                                Next dose:{' '}
                                                {new Date(medication.nextDueTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Text>
                                        </View>
                                    ))}
                            </>
                        )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#4A90E2',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    photoSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    patientPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoPlaceholder: {
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10,
    },
    patientName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
    medicationsSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    medicationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#ff6b6b',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    medicationHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    dueBadge: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    dueBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    medicationName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    medicationDetails: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        width: 100,
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    doneButton: {
        backgroundColor: '#4CAF50',
    },
    delayButton: {
        backgroundColor: '#FFA500',
    },
    cancelButton: {
        backgroundColor: '#ff4444',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    noPendingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
    },
    noPendingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    upcomingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    upcomingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    upcomingDosage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    upcomingTime: {
        fontSize: 13,
        color: '#4A90E2',
        fontWeight: '500',
    },
});
