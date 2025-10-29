import type { CachedData, MedicationStatus, Patient, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
    AUTH_TOKEN: '@medication_app:auth_token',
    USER_DATA: '@medication_app:user_data',
    PATIENTS_CACHE: '@medication_app:patients_cache',
    PENDING_UPDATES: '@medication_app:pending_updates',
} as const;

class StorageService {
    /**
     * Save authentication token
     */
    async saveAuthToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        } catch (error) {
            console.error('Error saving auth token:', error);
        }
    }

    /**
     * Get authentication token
     */
    async getAuthToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    /**
     * Remove authentication token
     */
    async removeAuthToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error removing auth token:', error);
        }
    }

    /**
     * Save user data
     */
    async saveUserData(user: User): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    /**
     * Get user data
     */
    async getUserData(): Promise<User | null> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    /**
     * Remove user data
     */
    async removeUserData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        } catch (error) {
            console.error('Error removing user data:', error);
        }
    }

    /**
     * Cache patients data with expiration
     */
    async cachePatients(
        patients: Patient[],
        expirationMinutes: number = 30
    ): Promise<void> {
        try {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + expirationMinutes * 60000);

            const cachedData: CachedData<Patient[]> = {
                data: patients,
                timestamp: now,
                expiresAt,
            };

            await AsyncStorage.setItem(
                STORAGE_KEYS.PATIENTS_CACHE,
                JSON.stringify(cachedData)
            );
        } catch (error) {
            console.error('Error caching patients:', error);
        }
    }

    /**
     * Get cached patients data
     */
    async getCachedPatients(): Promise<Patient[] | null> {
        try {
            const cached = await AsyncStorage.getItem(STORAGE_KEYS.PATIENTS_CACHE);
            if (!cached) return null;

            const cachedData: CachedData<Patient[]> = JSON.parse(cached);
            const now = new Date();
            const expiresAt = new Date(cachedData.expiresAt);

            // Check if cache is expired
            if (now > expiresAt) {
                await AsyncStorage.removeItem(STORAGE_KEYS.PATIENTS_CACHE);
                return null;
            }

            // Parse dates back to Date objects
            return cachedData.data.map((patient) => ({
                ...patient,
                medications: patient.medications.map((med) => ({
                    ...med,
                    scheduledTime: new Date(med.scheduledTime),
                    nextDueTime: new Date(med.nextDueTime),
                })),
            }));
        } catch (error) {
            console.error('Error getting cached patients:', error);
            return null;
        }
    }

    /**
     * Add pending medication status update to queue
     */
    async addPendingUpdate(status: MedicationStatus): Promise<void> {
        try {
            const pending = await this.getPendingUpdates();
            pending.push(status);
            await AsyncStorage.setItem(
                STORAGE_KEYS.PENDING_UPDATES,
                JSON.stringify(pending)
            );
        } catch (error) {
            console.error('Error adding pending update:', error);
        }
    }

    /**
     * Get all pending medication status updates
     */
    async getPendingUpdates(): Promise<MedicationStatus[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPDATES);
            if (!data) return [];

            const updates: MedicationStatus[] = JSON.parse(data);
            // Parse dates back to Date objects
            return updates.map((update) => ({
                ...update,
                timestamp: new Date(update.timestamp),
                delayedUntil: update.delayedUntil
                    ? new Date(update.delayedUntil)
                    : undefined,
            }));
        } catch (error) {
            console.error('Error getting pending updates:', error);
            return [];
        }
    }

    /**
     * Remove a specific pending update
     */
    async removePendingUpdate(index: number): Promise<void> {
        try {
            const pending = await this.getPendingUpdates();
            pending.splice(index, 1);
            await AsyncStorage.setItem(
                STORAGE_KEYS.PENDING_UPDATES,
                JSON.stringify(pending)
            );
        } catch (error) {
            console.error('Error removing pending update:', error);
        }
    }

    /**
     * Clear all pending updates
     */
    async clearPendingUpdates(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPDATES);
        } catch (error) {
            console.error('Error clearing pending updates:', error);
        }
    }

    /**
     * Clear all storage data (logout)
     */
    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.PATIENTS_CACHE,
                STORAGE_KEYS.PENDING_UPDATES,
            ]);
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}

export const storageService = new StorageService();
