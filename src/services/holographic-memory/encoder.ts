/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Holographic Memory Encoder
 * Handles encoding of text into holographic resonant fragments
 */

import {
  createHolographicEncoding,
  holographicEncodingEncode,
  generatePrimes
} from '../../../resolang/build/resolang.js';
import type { ResonantFragment, EncodedMemory, PrimeResonanceIdentity } from './types';

export class MemoryEncoder {
  constructor(
    private wasm: any,
    private getCurrentUserPRI: () => PrimeResonanceIdentity | null
  ) {}

  /**
   * Encode text into holographic memory fragment
   */
  async encodeMemory(text: string): Promise<EncodedMemory | null> {
    console.log(`[MemoryEncoder] Encoding text of length: ${text.length}`);
    
    const currentUserPRI = this.getCurrentUserPRI();
    if (!currentUserPRI) {
      throw new Error("Cannot encode memory: User PRI not set.");
    }
    
    try {
      // Create holographic encoding instance
      const encoder = createHolographicEncoding();
      
      // Calculate spatial entropy
      const spatialEntropy = this.calculateSpatialEntropy(text);
      
      // Create coefficients map using prime numbers
      const coeffs = new Map<number, number>();
      const primes = this.wasm.generatePrimes ?
        this.wasm.generatePrimes(text.length + 10) :
        generatePrimes(text.length + 10);
      
      // Encode each character using holographic encoding
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const prime = primes[i];
        
        const x = i * 0.1; // Spatial coordinate X
        const y = charCode / 255.0; // Normalized character value
        const entropy = spatialEntropy * (i + 1) / text.length;
        
        const amplitude = holographicEncodingEncode(encoder, x, y, entropy);
        coeffs.set(prime, amplitude);
      }
      
      // Calculate center and entropy
      const centerX = text.length / 2.0;
      const centerY = this.calculateCenterY(coeffs);
      const totalEntropy = this.calculateShannonEntropy(coeffs);
      
      // Create resonant fragment
      const fragment: ResonantFragment = {
        coeffs,
        center: [centerX, centerY],
        entropy: totalEntropy,
        primeResonance: this.calculatePrimeResonance(coeffs),
        holographicField: encoder
      };
      
      // Generate beacon metadata
      const beaconData = this.generateBeaconData(fragment, text, currentUserPRI);
      
      console.log(`Successfully encoded text "${text}" using ResoLang`);
      return {
        ...fragment,
        ...beaconData,
        originalText: text
      };
    } catch (error) {
      console.error("Error during ResoLang encoding:", error);
      throw error;
    }
  }

  /**
   * Calculate spatial entropy based on character distribution
   */
  private calculateSpatialEntropy(text: string): number {
    const charFreq = new Map<string, number>();
    for (const char of text) {
      charFreq.set(char, (charFreq.get(char) || 0) + 1);
    }
    
    let entropy = 0;
    for (const [, freq] of charFreq) {
      const prob = freq / text.length;
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    }
    
    return entropy / Math.log2(256); // Normalize to [0,1]
  }

  /**
   * Calculate center Y coordinate from coefficients
   */
  private calculateCenterY(coeffs: Map<number, number>): number {
    let sum = 0;
    let weightSum = 0;
    
    for (const [prime, amplitude] of coeffs) {
      sum += prime * amplitude * amplitude;
      weightSum += amplitude * amplitude;
    }
    
    return weightSum > 0 ? sum / weightSum / 1000.0 : 0;
  }

  /**
   * Calculate Shannon entropy from coefficients
   */
  private calculateShannonEntropy(coeffs: Map<number, number>): number {
    let totalAmplitudeSquared = 0;
    for (const [, amplitude] of coeffs) {
      totalAmplitudeSquared += amplitude * amplitude;
    }
    
    if (totalAmplitudeSquared === 0) return 0;
    
    let entropy = 0;
    for (const [, amplitude] of coeffs) {
      const prob = (amplitude * amplitude) / totalAmplitudeSquared;
      if (prob > 0) {
        entropy -= prob * Math.log(prob);
      }
    }
    
    return entropy;
  }

  /**
   * Calculate prime resonance from coefficients
   */
  private calculatePrimeResonance(coeffs: Map<number, number>): number {
    let resonance = 0;
    for (const [prime, amplitude] of coeffs) {
      resonance += amplitude * Math.sin(prime * Math.PI / 100.0);
    }
    return coeffs.size > 0 ? resonance / coeffs.size : 0;
  }

  /**
   * Generate beacon data for storage
   */
  private generateBeaconData(
    fragment: ResonantFragment,
    text: string,
    pri: PrimeResonanceIdentity
  ): { index: number[]; epoch: number; fingerprint: Uint8Array; signature: Uint8Array } {
    // Generate prime indices from coefficients
    const index = Array.from(fragment.coeffs.keys());
    
    // Current epoch (timestamp)
    const epoch = Date.now();
    
    // Generate fingerprint using entropy and center
    const fingerprintData = new Float64Array([
      fragment.entropy,
      fragment.center[0],
      fragment.center[1],
      fragment.primeResonance || 0
    ]);
    const fingerprint = new Uint8Array(fingerprintData.buffer);
    
    // Generate signature containing full text for decoding
    const textBytes = new TextEncoder().encode(text);
    const priBytes = new TextEncoder().encode(JSON.stringify(pri.publicResonance));
    
    // Format: [text_length_as_4_bytes][full_text][pri_hash_as_32_bytes]
    const textLength = textBytes.length;
    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, textLength, true);
    
    const signature = new Uint8Array([
      ...lengthBytes,
      ...textBytes, // Full text
      ...priBytes.slice(0, 32) // PRI validation hash
    ]);
    
    return { index, epoch, fingerprint, signature };
  }
}