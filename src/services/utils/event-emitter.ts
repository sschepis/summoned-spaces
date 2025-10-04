/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple Event Emitter
 * A lightweight event bus for cross-service communication.
 */

type Listener = (...args: unknown[]) => void;

class EventEmitter {
  private events: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);

    // Return a function to unsubscribe
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener): void {
    if (!this.events.has(event)) {
      return;
    }
    const listeners = this.events.get(event)!;
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.events.has(event)) {
      return;
    }
    this.events.get(event)!.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  once(event: string, listener: Listener): () => void {
    const onceListener: Listener = (...args: unknown[]) => {
      this.off(event, onceListener);
      listener(...args);
    };
    return this.on(event, onceListener);
  }
}

export const serviceEventEmitter = new EventEmitter();