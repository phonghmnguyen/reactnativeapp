import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';
import { syncService } from '@/services/sync';
import type { Patient } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = width > 600 ? 3 : 2; // Use grid for tablets
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - (GRID_COLUMNS + 1) * CARD_MARGIN * 2) / GRID_COLUMNS;

interface PatientCardProps {
    patient: Patient;
    onPress: () => void;
}

function PatientCard({ patient, onPress }: PatientCardProps) {
    const opacity = useSharedValue(1);

    // Flashing animation for patients with pending medications
    useEffect(() => {
        if (patient.hasPendingMedication) {
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            opacity.value = 1;
        }
    }, [patient.hasPendingMedication]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const pendingMedications = patient.medications.filter(
        (med) => new Date(med.nextDueTime) <= new Date()
    );

    return (
        <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
            <Animated.View
                style={[
                    styles.card,
                    patient.hasPendingMedication && styles.cardPending,
                    animatedStyle,
                ]}
            >
                {/* Patient Photo */}
                <View style={styles.photoContainer}>
                    {patient.photoUrl ? (
                        <Image source={{ uri: patient.photoUrl }} style={styles.photo} />
                    ) : (
                        <View style={[styles.photo, styles.photoPlaceholder]}>
                            <Text style={styles.photoPlaceholderText}>
                                {patient.firstName[0]}
                                {patient.lastName[0]}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Patient Info */}
                <View style={styles.cardContent}>
                    <Text style={styles.patientName}>
                        {patient.firstName} {patient.lastName}
                    </Text>
                    <Text style={styles.roomInfo}>
                        Room {patient.roomNumber} - Bed {patient.bedNumber}
                    </Text>

                    {patient.hasPendingMedication && (
                        <View style={styles.alertBadge}>
                            <Text style={styles.alertText}>
                                {pendingMedications.length} Medication
                                {pendingMedications.length > 1 ? 's' : ''} Due
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function PatientsScreen() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    const fetchPatients = async (showLoader = true) => {
        if (showLoader) setIsLoading(true);

        try {
            // Try to get cached data first
            const cached = await storageService.getCachedPatients();
            if (cached && showLoader) {
                setPatients(cached);
            }

            // Fetch fresh data from API
            const response = await apiService.getPatients();
            if (response.success && response.data) {
                setPatients(response.data);
                // Cache the data
                await storageService.cachePatients(response.data);
            } else if (!cached) {
                Alert.alert('Error', 'Failed to load patients');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            Alert.alert('Error', 'An error occurred while loading patients');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchPatients(false);
    }, []);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await storageService.clearAll();
                    apiService.logout();
                    router.replace('/login');
                },
            },
        ]);
    };

    useEffect(() => {
        fetchPatients();

        // Start sync service
        syncService.syncPendingUpdates();

        // Poll for updates every 30 seconds
        const interval = setInterval(() => {
            fetchPatients(false);
        }, 30000);

        // Sync pending updates every 5 minutes
        const syncInterval = syncService.startAutoSync(5);

        return () => {
            clearInterval(interval);
            syncService.stopAutoSync(syncInterval);
        };
    }, []);

    // Refresh when screen comes back into focus
    useFocusEffect(
        useCallback(() => {
            fetchPatients(false);
        }, [])
    );

    const handlePatientPress = (patient: Patient) => {
        router.push({
            pathname: '/patient/[id]',
            params: { id: patient.id },
        });
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading patients...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Patients</Text>
                    <Text style={styles.headerSubtitle}>
                        {patients.filter((p) => p.hasPendingMedication).length} pending
                        medication{patients.filter((p) => p.hasPendingMedication).length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Patient Grid */}
            <FlatList
                data={patients}
                keyExtractor={(item) => item.id}
                numColumns={GRID_COLUMNS}
                renderItem={({ item }) => (
                    <PatientCard
                        patient={item}
                        onPress={() => handlePatientPress(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No patients found</Text>
                    </View>
                }
            />
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
    loadingText: {
        fontSize: 16,
        color: '#666',
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#ff4444',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: CARD_MARGIN,
    },
    cardContainer: {
        width: CARD_WIDTH,
        margin: CARD_MARGIN,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardPending: {
        borderWidth: 2,
        borderColor: '#ff6b6b',
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    photoPlaceholder: {
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    cardContent: {
        alignItems: 'center',
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    roomInfo: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    alertBadge: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    alertText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
