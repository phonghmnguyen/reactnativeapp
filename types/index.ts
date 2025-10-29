export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'nurse' | 'admin';
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    scheduledTime: Date;
    nextDueTime: Date;
    instructions?: string;
}

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    roomNumber: string;
    bedNumber: string;
    medications: Medication[];
    hasPendingMedication: boolean;
}

export interface MedicationStatus {
    patientId: string;
    medicationId: string;
    status: 'done' | 'delayed' | 'cancelled';
    timestamp: Date;
    delayedUntil?: Date;
    notes?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface CachedData<T> {
    data: T;
    timestamp: Date;
    expiresAt: Date;
}
