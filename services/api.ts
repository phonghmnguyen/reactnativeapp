import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    MedicationStatus,
    Patient,
} from '@/types';

// API Configuration
// TO USE THE FASTAPI BACKEND:
// 1. Start backend: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
// 2. For Android Emulator: use 'http://10.0.2.2:8000'
// 3. For iOS Simulator: use 'http://localhost:8000'
// 4. For Physical Device: use your computer's IP (e.g., 'http://192.168.1.100:8000')
// 5. Set useMockData = false in the ApiService class (line 147)

const API_BASE_URL = 'http://10.0.2.2:8000'; // Special IP for Android Emulator

// Mock data for development
const MOCK_PATIENTS: Patient[] = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        photoUrl: 'https://i.pravatar.cc/150?img=12',
        roomNumber: '101',
        bedNumber: 'A',
        hasPendingMedication: true,
        medications: [
            {
                id: 'm1',
                name: 'Aspirin',
                dosage: '100mg',
                frequency: 'Twice daily',
                scheduledTime: new Date(new Date().getTime() - 5 * 60000), // 5 minutes ago
                nextDueTime: new Date(new Date().getTime() - 5 * 60000),
                instructions: 'Take with food',
            },
            {
                id: 'm2',
                name: 'Metformin',
                dosage: '500mg',
                frequency: 'Three times daily',
                scheduledTime: new Date(new Date().setHours(14, 0, 0, 0)),
                nextDueTime: new Date(new Date().setHours(14, 0, 0, 0)),
                instructions: 'Take before meals',
            },
        ],
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        photoUrl: 'https://i.pravatar.cc/150?img=5',
        roomNumber: '102',
        bedNumber: 'B',
        hasPendingMedication: false,
        medications: [
            {
                id: 'm3',
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                scheduledTime: new Date(new Date().setHours(8, 0, 0, 0)),
                nextDueTime: new Date(new Date().setHours(8, 0, 0, 0)),
                instructions: 'Take in the morning',
            },
        ],
    },
    {
        id: '3',
        firstName: 'Robert',
        lastName: 'Johnson',
        photoUrl: 'https://i.pravatar.cc/150?img=33',
        roomNumber: '103',
        bedNumber: 'A',
        hasPendingMedication: true,
        medications: [
            {
                id: 'm4',
                name: 'Warfarin',
                dosage: '5mg',
                frequency: 'Once daily',
                scheduledTime: new Date(new Date().getTime() - 2 * 60000), // 2 minutes ago
                nextDueTime: new Date(new Date().getTime() - 2 * 60000),
                instructions: 'Take at the same time each day',
            },
        ],
    },
    {
        id: '4',
        firstName: 'Emily',
        lastName: 'Brown',
        photoUrl: 'https://i.pravatar.cc/150?img=9',
        roomNumber: '104',
        bedNumber: 'C',
        hasPendingMedication: false,
        medications: [
            {
                id: 'm5',
                name: 'Levothyroxine',
                dosage: '50mcg',
                frequency: 'Once daily',
                scheduledTime: new Date(new Date().setHours(7, 0, 0, 0)),
                nextDueTime: new Date(new Date().setHours(7, 0, 0, 0)),
                instructions: 'Take on empty stomach',
            },
        ],
    },
    {
        id: '5',
        firstName: 'Michael',
        lastName: 'Davis',
        photoUrl: 'https://i.pravatar.cc/150?img=15',
        roomNumber: '105',
        bedNumber: 'A',
        hasPendingMedication: true,
        medications: [
            {
                id: 'm6',
                name: 'Atorvastatin',
                dosage: '20mg',
                frequency: 'Once daily',
                scheduledTime: new Date(new Date().getTime() - 10 * 60000), // 10 minutes ago
                nextDueTime: new Date(new Date().getTime() - 10 * 60000),
                instructions: 'Take in the evening',
            },
        ],
    },
    {
        id: '6',
        firstName: 'Sarah',
        lastName: 'Wilson',
        photoUrl: 'https://i.pravatar.cc/150?img=20',
        roomNumber: '106',
        bedNumber: 'B',
        hasPendingMedication: false,
        medications: [
            {
                id: 'm7',
                name: 'Omeprazole',
                dosage: '20mg',
                frequency: 'Once daily',
                scheduledTime: new Date(new Date().setHours(9, 0, 0, 0)),
                nextDueTime: new Date(new Date().setHours(9, 0, 0, 0)),
                instructions: 'Take before breakfast',
            },
        ],
    },
];

class ApiService {
    private token: string | null = null;
    private useMockData = false; // Set to false when backend is ready

    /**
     * Login to the system
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        if (this.useMockData) {
            // Mock login - simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Simple mock authentication
            if (credentials.username === 'nurse' && credentials.password === 'nurse123') {
                const response: LoginResponse = {
                    success: true,
                    user: {
                        id: '1',
                        username: 'nurse',
                        firstName: 'Mary',
                        lastName: 'Johnson',
                        role: 'nurse',
                    },
                    token: 'mock-jwt-token-12345',
                    message: 'Login successful',
                };
                this.token = response.token!;
                return response;
            } else {
                return {
                    success: false,
                    message: 'Invalid username or password',
                };
            }
        }

        // Real API call (when backend is ready)
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data: LoginResponse = await response.json();
            if (data.success && data.token) {
                this.token = data.token;
            }
            return data;
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please check your connection.',
            };
        }
    }

    /**
     * Fetch all patients
     */
    async getPatients(): Promise<ApiResponse<Patient[]>> {
        if (this.useMockData) {
            // Mock API call - simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Update hasPendingMedication based on current time
            const now = new Date();
            const updatedPatients = MOCK_PATIENTS.map((patient) => {
                const hasPendingMedication = patient.medications.some(
                    (med) => med.nextDueTime <= now
                );
                return {
                    ...patient,
                    hasPendingMedication,
                };
            });

            return {
                success: true,
                data: updatedPatients,
            };
        }

        // Real API call (when backend is ready)
        try {
            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
            });

            const data: ApiResponse<Patient[]> = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch patients',
            };
        }
    }

    /**
     * Get a specific patient by ID
     */
    async getPatient(patientId: string): Promise<ApiResponse<Patient>> {
        if (this.useMockData) {
            await new Promise((resolve) => setTimeout(resolve, 300));

            const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
            if (patient) {
                const now = new Date();
                const hasPendingMedication = patient.medications.some(
                    (med) => med.nextDueTime <= now
                );
                return {
                    success: true,
                    data: {
                        ...patient,
                        hasPendingMedication,
                    },
                };
            }
            return {
                success: false,
                error: 'Patient not found',
            };
        }

        // Real API call (when backend is ready)
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
            });

            const data: ApiResponse<Patient> = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch patient',
            };
        }
    }

    /**
     * Update medication status
     */
    async updateMedicationStatus(
        status: MedicationStatus
    ): Promise<ApiResponse<void>> {
        if (this.useMockData) {
            await new Promise((resolve) => setTimeout(resolve, 400));

            console.log('Medication status updated:', status);

            // Update the mock patient's medication time
            const patient = MOCK_PATIENTS.find((p) => p.id === status.patientId);
            if (patient) {
                const medication = patient.medications.find(
                    (m) => m.id === status.medicationId
                );
                if (medication) {
                    if (status.status === 'delayed' && status.delayedUntil) {
                        medication.nextDueTime = status.delayedUntil;
                    } else if (status.status === 'done') {
                        // Set next dose time based on frequency (simplified)
                        const hoursToAdd = medication.frequency.includes('Three')
                            ? 8
                            : medication.frequency.includes('Twice')
                                ? 12
                                : 24;
                        medication.nextDueTime = new Date(
                            new Date().getTime() + hoursToAdd * 60 * 60 * 1000
                        );
                    }
                }
            }

            return {
                success: true,
                message: 'Status updated successfully',
            };
        }

        // Real API call (when backend is ready)
        try {
            const response = await fetch(`${API_BASE_URL}/medications/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify(status),
            });

            const data: ApiResponse<void> = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to update medication status',
            };
        }
    }

    /**
     * Logout
     */
    logout(): void {
        this.token = null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.token !== null;
    }

    /**
     * Get current token
     */
    getToken(): string | null {
        return this.token;
    }

    /**
     * Set token (for restoring from storage)
     */
    setToken(token: string): void {
        this.token = token;
    }
}

export const apiService = new ApiService();
