import { apiService } from './api';
import { storageService } from './storage';

class SyncService {
    private isSyncing = false;

    /**
     * Attempt to sync all pending medication status updates
     */
    async syncPendingUpdates(): Promise<void> {
        if (this.isSyncing) {
            return; // Already syncing
        }

        this.isSyncing = true;

        try {
            const pendingUpdates = await storageService.getPendingUpdates();

            if (pendingUpdates.length === 0) {
                return;
            }

            console.log(`Syncing ${pendingUpdates.length} pending updates...`);

            // Process updates sequentially
            for (let i = 0; i < pendingUpdates.length; i++) {
                const update = pendingUpdates[i];

                try {
                    const response = await apiService.updateMedicationStatus(update);

                    if (response.success) {
                        // Successfully synced, remove from pending
                        await storageService.removePendingUpdate(i);
                        console.log(`Synced update for patient ${update.patientId}`);
                    } else {
                        console.warn(`Failed to sync update for patient ${update.patientId}`);
                        // Keep in pending queue for next sync attempt
                    }
                } catch (error) {
                    console.error(`Error syncing update:`, error);
                    // Keep in pending queue for next sync attempt
                }
            }

            console.log('Sync completed');
        } catch (error) {
            console.error('Error during sync:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Start automatic sync interval
     */
    startAutoSync(intervalMinutes: number = 5): number {
        return setInterval(() => {
            this.syncPendingUpdates();
        }, intervalMinutes * 60 * 1000) as unknown as number;
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync(interval: number): void {
        clearInterval(interval);
    }
}

export const syncService = new SyncService();
