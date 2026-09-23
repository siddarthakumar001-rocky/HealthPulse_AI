/**
 * HealthPulse AI - Offline Sync & Queue Manager
 * Provides offline-first resilience for rural PHC centers with intermittent internet connectivity.
 * Buffers inventory updates, patient footfalls, and sensor telemetry in LocalStorage.
 * Automatically synchronizes with the central HealthPulse AI backend once connectivity is restored.
 */

import { phcService } from '@/services/phcService';

export interface OfflineRecord {
  id: string;
  type: 'FOOTFALL' | 'INVENTORY' | 'TELEMETRY';
  facilityCode: string;
  data: any;
  timestamp: string;
}

const STORAGE_KEY = 'healthpulse_offline_queue';

class OfflineSyncManager {
  private queue: OfflineRecord[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(status: { isOnline: boolean; pendingCount: number }) => void> = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private loadQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e) {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.notifyListeners();
    this.syncAll();
  }

  private handleOffline() {
    this.isOnline = false;
    this.notifyListeners();
  }

  public subscribe(callback: (status: { isOnline: boolean; pendingCount: number }) => void) {
    this.listeners.push(callback);
    callback({ isOnline: this.isOnline, pendingCount: this.queue.length });
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    const status = { isOnline: this.isOnline, pendingCount: this.queue.length };
    this.listeners.forEach(cb => cb(status));
  }

  public getStatus() {
    return {
      isOnline: this.isOnline,
      pendingCount: this.queue.length,
      records: [...this.queue]
    };
  }

  public enqueue(type: 'FOOTFALL' | 'INVENTORY' | 'TELEMETRY', facilityCode: string, data: any) {
    const record: OfflineRecord = {
      id: `OFFLINE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      facilityCode,
      data,
      timestamp: new Date().toISOString()
    };
    this.queue.push(record);
    this.saveQueue();

    // If online, attempt immediate sync
    if (this.isOnline) {
      this.syncAll();
    }

    return record;
  }

  public async syncAll(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.queue.length === 0) return { success: true, syncedCount: 0 };
    if (!this.isOnline) return { success: false, syncedCount: 0 };

    try {
      // Group records by facility
      const recordsToSync = [...this.queue];
      const facilityCode = recordsToSync[0]?.facilityCode || 'PHC-001';

      await phcService.syncOfflineQueue(facilityCode, recordsToSync);

      this.queue = [];
      this.saveQueue();
      return { success: true, syncedCount: recordsToSync.length };
    } catch (error) {
      console.error('Offline queue synchronization failed:', error);
      return { success: false, syncedCount: 0 };
    }
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineSyncManager = new OfflineSyncManager();
