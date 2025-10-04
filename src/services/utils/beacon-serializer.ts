/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Beacon Serialization Utilities
 * Centralized functions for converting beacons to/from JSON-safe formats
 */

import { toUint8Array, uint8ArrayToArray } from './uint8-converter';

/**
 * Beacon structure with Uint8Array fields
 */
export interface BeaconWithBinary {
  fingerprint: Uint8Array;
  signature: Uint8Array;
  index?: number[];
  epoch?: number;
  originalText?: string;
  [key: string]: any;
}

/**
 * JSON-safe beacon structure (Uint8Arrays converted to arrays)
 */
export interface SerializableBeacon {
  fingerprint: number[];
  signature: number[];
  index?: number[];
  epoch?: number;
  originalText?: string;
  prime_indices?: string;
  [key: string]: any;
}

/**
 * Convert beacon to JSON-safe format
 * Converts Uint8Arrays to regular arrays and removes non-serializable fields
 */
export function serializeBeacon(beacon: BeaconWithBinary): SerializableBeacon {
  const serializable: SerializableBeacon = {
    ...beacon,
    fingerprint: uint8ArrayToArray(beacon.fingerprint),
    signature: uint8ArrayToArray(beacon.signature),
  };

  // Add decoder-compatible fields if index is present
  if (beacon.index) {
    serializable.prime_indices = JSON.stringify(beacon.index);
  }

  // Preserve originalText if present (critical for decoding)
  if (beacon.originalText) {
    serializable.originalText = beacon.originalText;
  }

  // Remove non-serializable complex objects
  delete serializable.coeffs;
  delete serializable.center;
  delete serializable.entropy;
  delete serializable.primeResonance;
  delete serializable.holographicField;

  return serializable;
}

/**
 * Convert JSON-safe beacon back to binary format
 * Restores Uint8Arrays from arrays
 */
export function deserializeBeacon(serializable: SerializableBeacon): BeaconWithBinary {
  const beacon: BeaconWithBinary = {
    ...serializable,
    fingerprint: toUint8Array(serializable.fingerprint),
    signature: toUint8Array(serializable.signature),
  };

  return beacon;
}

/**
 * Validate beacon structure
 */
export function validateBeaconStructure(beacon: any): beacon is BeaconWithBinary {
  return (
    typeof beacon === 'object' &&
    beacon !== null &&
    'fingerprint' in beacon &&
    'signature' in beacon &&
    (beacon.fingerprint instanceof Uint8Array || Array.isArray(beacon.fingerprint)) &&
    (beacon.signature instanceof Uint8Array || Array.isArray(beacon.signature))
  );
}

/**
 * Prepare beacon for WebSocket transmission
 * Ensures all fields are properly serialized
 */
export function prepareBeaconForTransmission(beacon: BeaconWithBinary): SerializableBeacon {
  const serialized = serializeBeacon(beacon);

  // Log serialization details for debugging
  console.log('[Beacon Serializer] Prepared beacon for transmission:', {
    indexLength: serialized.index?.length,
    fingerprintLength: serialized.fingerprint.length,
    signatureLength: serialized.signature.length,
    epoch: serialized.epoch,
    hasOriginalText: !!serialized.originalText
  });

  return serialized;
}

/**
 * Extract original text from beacon (try multiple locations)
 */
export function extractOriginalText(beacon: any): string | null {
  // Check originalText field
  if (typeof beacon.originalText === 'string') {
    return beacon.originalText;
  }

  // Check metadata field
  if (typeof beacon.metadata === 'string') {
    try {
      const parsed = JSON.parse(beacon.metadata);
      if (typeof parsed.originalText === 'string') {
        return parsed.originalText;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check content field
  if (typeof beacon.content === 'string') {
    return beacon.content;
  }

  // Check data field
  if (typeof beacon.data === 'string') {
    return beacon.data;
  }

  return null;
}

/**
 * Create minimal beacon for testing
 */
export function createTestBeacon(text: string): BeaconWithBinary {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  return {
    fingerprint: new Uint8Array([1, 2, 3, 4]),
    signature: textBytes,
    index: [2, 3, 5, 7, 11],
    epoch: Date.now(),
    originalText: text
  };
}