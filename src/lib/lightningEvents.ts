// Event emitter for lightning flashes
class LightningEventEmitter {
  private listeners: Set<(intensity: number) => void> = new Set();

  subscribe(callback: (intensity: number) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(intensity: number) {
    this.listeners.forEach(listener => listener(intensity));
  }
}

export const lightningEvents = new LightningEventEmitter();
