/**
 * High-Performance Fixed-Capacity Circular Ring Buffer using Float32Array
 * Prevents garbage collection churn during high-frequency IoT telemetry streaming (10Hz - 100Hz).
 */
export class TelemetryRingBuffer {
  private buffer: Float32Array;
  private capacity: number;
  private head: number = 0;
  private count: number = 0;

  constructor(capacity = 128) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity);
  }

  public push(value: number): void {
    this.buffer[this.head] = value;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  public getArray(): number[] {
    const result: number[] = [];
    if (this.count === 0) return result;

    let start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(start + i) % this.capacity]);
    }
    return result;
  }

  public getLatest(): number {
    if (this.count === 0) return 0;
    const lastIdx = (this.head - 1 + this.capacity) % this.capacity;
    return this.buffer[lastIdx];
  }

  public getAverage(): number {
    if (this.count === 0) return 0;
    let sum = 0;
    for (let i = 0; i < this.count; i++) {
      sum += this.buffer[i];
    }
    return Math.round((sum / this.count) * 10) / 10;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getUsageCount(): number {
    return this.count;
  }

  public clear(): void {
    this.buffer.fill(0);
    this.head = 0;
    this.count = 0;
  }
}

/**
 * Storage Manager Utility for auditing and pruning stale LocalStorage telemetry
 */
export const storageManager = {
  auditAndPrune: () => {
    try {
      const keysToPrune = ["telemetry_cache_", "debug_logs_", "temp_chunk_"];
      let freedBytes = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && keysToPrune.some((p) => key.startsWith(p))) {
          const val = localStorage.getItem(key);
          if (val) freedBytes += val.length * 2;
          localStorage.removeItem(key);
        }
      }
      return freedBytes;
    } catch (e) {
      console.warn("[StorageManager] Pruning skipped:", e);
      return 0;
    }
  },
};
