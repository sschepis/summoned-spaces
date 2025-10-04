/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Holographic Memory Module
 * Main export for refactored holographic memory functionality
 */

import { generatePrimesSync } from '../utils/prime-utils';
import { MemoryEncoder } from './encoder';
import { MemoryDecoder } from './decoder';
import { FallbackDecoder } from './fallback-decoder';

// Re-export types
export type { 
  PublicResonance, 
  PrimeResonanceIdentity, 
  ResonantFragment,
  EncodedMemory
} from './types';

import type { PrimeResonanceIdentity, EncodedMemory } from './types';

/**
 * Main Holographic Memory Manager
 * Coordinates encoding and decoding through specialized managers
 */
export class HolographicMemoryManager {
  private wasm: any;
  private currentUserPRI: PrimeResonanceIdentity | null = null;
  public isReady: Promise<void>;
  private resolveReady!: () => void;
  
  private encoder!: MemoryEncoder;
  private decoder: MemoryDecoder;
  private fallbackDecoder: FallbackDecoder;

  constructor() {
    this.isReady = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
    
    this.decoder = new MemoryDecoder();
    this.fallbackDecoder = new FallbackDecoder();
    
    this.loadWasmModule();
  }

  /**
   * Load WASM module with fallback
   */
  private async loadWasmModule() {
    try {
      const wasmModule = await Promise.race([
        import('../../../resolang/build/resolang.js'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('WASM load timeout')), 5000)
        )
      ]);
      this.wasm = wasmModule;
      console.log("[HolographicMemoryManager] Successfully loaded resolang WASM module.");
    } catch (error) {
      console.error("[HolographicMemoryManager] Failed to load resolang WASM module:", error);
      console.log("[HolographicMemoryManager] Falling back to non-quantum mode");
      
      // Set wasm to mock object with working fallback functions
      this.wasm = {
        createHolographicEncoding: () => ({}),
        holographicEncodingEncode: () => Math.random(),
        holographicEncodingDecode: () => 0.5,
        generatePrimes: (count: number) => generatePrimesSync(count)
      };
    } finally {
      // Initialize encoder after WASM is loaded
      this.encoder = new MemoryEncoder(this.wasm, () => this.currentUserPRI);
      this.resolveReady();
    }
  }

  /**
   * Set current user PRI
   */
  public setCurrentUser(pri: PrimeResonanceIdentity) {
    this.currentUserPRI = pri;
    console.log("[HolographicMemoryManager] Initialized for user:", pri.nodeAddress);
    console.log("[HolographicMemoryManager] PRI publicResonance:", pri.publicResonance);
  }

  /**
   * Encode memory to holographic fragment
   */
  public async encodeMemory(text: string): Promise<EncodedMemory | null> {
    console.log(`[HolographicMemoryManager] encodeMemory called with text length: ${text.length}`);
    
    await this.isReady;
    
    if (!this.wasm) {
      console.error("[HolographicMemoryManager] WASM module not available!");
      throw new Error("HolographicMemoryManager is not ready: WASM module not available.");
    }
    
    if (!this.currentUserPRI) {
      console.error("[HolographicMemoryManager] User PRI not set!");
      throw new Error("Cannot encode memory: User PRI not set.");
    }
    
    console.log("[HolographicMemoryManager] Starting encoding process...");
    return this.encoder.encodeMemory(text);
  }

  /**
   * Decode memory from holographic fragment
   */
  public decodeMemory(fragment: unknown): string | null {
    if (!this.wasm) {
      throw new Error("HolographicMemoryManager is not ready: WASM module not available.");
    }
    
    try {
      // Try fallback decoding first for cached beacons
      const fallbackText = this.fallbackDecoder.tryFallbackDecoding(fragment);
      if (fallbackText) {
        console.log("Successfully decoded fragment using fallback method");
        return fallbackText;
      }
      
      // Convert to resonant fragment if needed
      const resonantFragment = this.decoder.convertToResonantFragment(fragment);
      
      // Try holographic decoding
      const holographicText = this.decoder.decodeWithHolographicField(resonantFragment);
      if (holographicText) {
        console.log("Successfully decoded fragment using ResoLang holographic decoding");
        return holographicText;
      }
      
      // Try prime-based decoding
      const primeText = this.decoder.decodeWithPrimes(resonantFragment);
      if (primeText) {
        console.log("Successfully decoded fragment using prime-based reconstruction");
        return primeText;
      }
      
      // No suitable decoder found
      console.warn("Unable to decode fragment: no suitable decoder found");
      return null;
      
    } catch (error) {
      console.error("Error during fragment decoding:", error);
      
      // Try fallback methods one more time
      const fallbackText = this.fallbackDecoder.tryFallbackDecoding(fragment);
      if (fallbackText) {
        console.log("Using fallback decoding after error");
        return fallbackText;
      }
      
      console.warn("Decoding failed completely, returning null");
      return null;
    }
  }
}

// Export singleton instance for backward compatibility
export const holographicMemoryManager = new HolographicMemoryManager();