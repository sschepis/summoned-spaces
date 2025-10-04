/**
 * Holographic Memory Decoder
 * Handles decoding of holographic resonant fragments back to text
 */

import { holographicEncodingDecode } from '../../../resolang/build/resolang.js';
import { toUint8Array } from '../utils/uint8-converter';
import type { ResonantFragment, CachedBeaconData } from './types';

export class MemoryDecoder {
  /**
   * Decode fragment using holographic field
   */
  decodeWithHolographicField(fragment: ResonantFragment): string | null {
    if (!fragment.holographicField) {
      return null;
    }

    const coeffs = fragment.coeffs;
    const primes = Array.from(coeffs.keys()).sort((a, b) => a - b);
    let decodedText = '';
    
    // Reconstruct text from prime coefficients
    for (let i = 0; i < primes.length; i++) {
      const prime = primes[i];
      const amplitude = coeffs.get(prime) || 0;
      
      const x = i * 0.1;
      
      if (typeof fragment.holographicField === 'object' && fragment.holographicField !== null) {
        try {
          const y = holographicEncodingDecode(fragment.holographicField as never, x, x);
          const charCode = Math.round(Math.abs(y * amplitude) * 255) % 256;
          
          if (charCode > 0 && charCode < 128) {
            decodedText += String.fromCharCode(charCode);
          }
        } catch {
          // Skip if holographic decoding fails
        }
      }
    }
    
    return decodedText.length > 0 ? decodedText : null;
  }

  /**
   * Decode fragment using prime-based reconstruction
   */
  decodeWithPrimes(fragment: ResonantFragment): string | null {
    if (!fragment.coeffs || fragment.coeffs.size === 0) {
      return null;
    }

    const coeffs = fragment.coeffs;
    const primes = Array.from(coeffs.keys()).sort((a, b) => a - b);
    let decodedText = '';
    
    for (let i = 0; i < primes.length; i++) {
      const prime = primes[i];
      const amplitude = coeffs.get(prime) || 0;
      
      // Multiple decoding strategies
      const strategies = [
        () => Math.round(amplitude * 255) % 128,
        () => (prime % 95) + 32,
        () => Math.round((amplitude * 127 + prime % 95) / 2) % 95 + 32
      ];
      
      for (const strategy of strategies) {
        const charCode = strategy();
        if (charCode >= 32 && charCode <= 126) {
          decodedText += String.fromCharCode(charCode);
          break;
        }
      }
    }
    
    return decodedText.length > 0 ? decodedText : null;
  }

  /**
   * Convert CachedBeacon to ResonantFragment
   */
  convertToResonantFragment(data: unknown): ResonantFragment {
    if (this.isResonantFragment(data)) {
      return data;
    }
    
    if (this.isCachedBeacon(data)) {
      try {
        const primeIndices: number[] = JSON.parse(data.prime_indices);
        
        // Convert fingerprint
        let fingerprintBytes: Uint8Array;
        if (typeof data.fingerprint === 'string') {
          fingerprintBytes = toUint8Array(data.fingerprint);
        } else if (data.fingerprint instanceof Uint8Array) {
          fingerprintBytes = data.fingerprint;
        } else {
          fingerprintBytes = new Uint8Array(0);
        }
        
        // Create coefficients map
        const coeffs = new Map<number, number>();
        for (let i = 0; i < primeIndices.length; i++) {
          const prime = primeIndices[i];
          const amplitude = fingerprintBytes.length > i ?
            (fingerprintBytes[i] / 255.0) :
            Math.random() * 0.5;
          coeffs.set(prime, amplitude);
        }
        
        // Calculate center
        const centerX = primeIndices.length / 2.0;
        const centerY = primeIndices.reduce((sum, prime) => sum + prime, 0) / (primeIndices.length * 1000.0);
        
        // Calculate entropy
        const entropy = this.calculateBytesEntropy(Array.from(fingerprintBytes));
        
        // Calculate prime resonance
        const primeResonance = this.calculatePrimeResonance(coeffs);
        
        return {
          coeffs,
          center: [centerX, centerY],
          entropy,
          primeResonance
        };
      } catch (error) {
        console.error("Error converting CachedBeacon to ResonantFragment:", error);
      }
    }
    
    return {
      coeffs: new Map(),
      center: [0, 0],
      entropy: 0
    };
  }

  /**
   * Type guard for ResonantFragment
   */
  private isResonantFragment(data: unknown): data is ResonantFragment {
    return (
      typeof data === 'object' &&
      data !== null &&
      'coeffs' in data &&
      'center' in data &&
      'entropy' in data
    );
  }

  /**
   * Type guard for CachedBeacon
   */
  private isCachedBeacon(data: unknown): data is CachedBeaconData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'prime_indices' in data &&
      'fingerprint' in data &&
      'epoch' in data
    );
  }

  /**
   * Calculate entropy from byte array
   */
  private calculateBytesEntropy(bytes: number[]): number {
    if (bytes.length === 0) return 0;

    const freq = new Map<number, number>();
    for (const byte of bytes) {
      freq.set(byte, (freq.get(byte) || 0) + 1);
    }
    
    let entropy = 0;
    for (const [, count] of freq) {
      const prob = count / bytes.length;
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    }
    
    return entropy / 8; // Normalize to [0,1]
  }

  /**
   * Calculate prime resonance
   */
  private calculatePrimeResonance(coeffs: Map<number, number>): number {
    if (coeffs.size === 0) return 0;

    let resonance = 0;
    for (const [prime, amplitude] of coeffs) {
      resonance += amplitude * Math.sin(prime * Math.PI / 100.0);
    }
    return resonance / coeffs.size;
  }
}