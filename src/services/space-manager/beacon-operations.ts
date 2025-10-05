/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Space Beacon Operations
 * Handles beacon submission for space member lists
 */

import { communicationManager } from '../communication-manager';
import { holographicMemoryManager } from '../holographic-memory';
import { serializeBeacon } from '../utils/beacon-serializer';
import { BEACON_TYPES } from '../../constants/beaconTypes';
import type { SpaceMember } from './types';

export class SpaceBeaconOperations {
  /**
   * Submit space member list beacon to server
   */
  async submitSpaceMemberBeacon(spaceId: string, members: SpaceMember[]): Promise<void> {
    const listData = JSON.stringify({
      spaceId,
      members,
      version: Date.now()
    });

    const beacon = await holographicMemoryManager.encodeMemory(listData);
    
    if (beacon) {
      const serializableBeacon = serializeBeacon(beacon as any);
      
      // Preserve originalText field - CRITICAL for beacon decoding
      (serializableBeacon as any).originalText = beacon.originalText;

      console.log(`[SpaceBeaconOps] Serializing beacon for space ${spaceId}:`, {
        indexLength: serializableBeacon.index?.length,
        fingerprintLength: serializableBeacon.fingerprint.length,
        signatureLength: serializableBeacon.signature.length,
        epoch: serializableBeacon.epoch
      });

      // Send via communication manager (SSE)
      try {
        await communicationManager.send({
          kind: 'submitPostBeacon',
          payload: {
            beacon: serializableBeacon as any,
            beaconType: BEACON_TYPES.SPACE_MEMBERS
          }
        });
        console.log(`[SpaceBeaconOps] Submitted membership beacon for space ${spaceId}`);
      } catch (error) {
        console.error('[SpaceBeaconOps] Failed to send beacon:', error);
        throw error;
      }
    } else {
      console.error(`[SpaceBeaconOps] Failed to encode beacon for space ${spaceId}`);
      throw new Error('Failed to encode beacon');
    }
  }
}