/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Uint8Array Conversion Utilities
 * Centralized functions for converting between Uint8Array and other formats
 */

// Type for Buffer-like objects from server
interface BufferLike {
  type: 'Buffer';
  data: number[];
}

// Type guard for BufferLike objects
function isBufferLike(value: unknown): value is BufferLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as { type: unknown }).type === 'Buffer' &&
    'data' in value &&
    Array.isArray((value as { data: unknown }).data)
  );
}

/**
 * Convert various formats to Uint8Array
 * Handles: Uint8Array, Buffer objects, base64 strings, regular arrays
 */
export function toUint8Array(value: unknown): Uint8Array {
  if (!value) {
    return new Uint8Array();
  }

  // Handle Uint8Array directly
  if (value instanceof Uint8Array) {
    return value;
  }

  // Handle Buffer-like objects from server ({"type":"Buffer","data":[...]})
  if (isBufferLike(value)) {
    return new Uint8Array(value.data);
  }

  // Handle base64 strings
  if (typeof value === 'string') {
    if (value.length === 0) {
      return new Uint8Array();
    }

    try {
      if (typeof globalThis.atob === 'function') {
        const binary = globalThis.atob(value);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }

      const bufferCtor = (globalThis as typeof globalThis & { Buffer?: { from(input: string, encoding: 'base64'): Uint8Array } }).Buffer;
      if (bufferCtor) {
        const buffer = bufferCtor.from(value, 'base64');
        return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      }
    } catch (error) {
      console.error('Failed to decode base64 data:', error);
    }
  }

  // Handle arrays directly
  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }

  console.warn('Unknown format for binary data:', typeof value, value);
  return new Uint8Array();
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  if (typeof btoa === 'function') {
    return btoa(String.fromCharCode(...uint8Array));
  }
  
  // Fallback for environments without btoa
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < uint8Array.length) {
    const a = uint8Array[i++];
    const b = i < uint8Array.length ? uint8Array[i++] : 0;
    const c = i < uint8Array.length ? uint8Array[i++] : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63) +
              chars.charAt((bitmap >> 12) & 63) +
              (i - 2 < uint8Array.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
              (i - 1 < uint8Array.length ? chars.charAt(bitmap & 63) : '=');
  }
  
  return result;
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return toUint8Array(base64);
}

/**
 * Convert Uint8Array to regular array
 */
export function uint8ArrayToArray(uint8Array: Uint8Array): number[] {
  return Array.from(uint8Array);
}

/**
 * Convert regular array to Uint8Array
 */
export function arrayToUint8Array(array: number[]): Uint8Array {
  return new Uint8Array(array);
}