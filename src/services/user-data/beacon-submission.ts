/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * User Data Beacon Submission
 * Handles encoding and submitting user data beacons
 */

import type { HolographicMemoryManager } from '../holographic-memory';
import { communicationManager } from '../communication-manager';
import { beaconCacheManager } from '../beacon-cache';
import { serializeBeacon } from '../utils/beacon-serializer';
import { BEACON_TYPES } from '../../constants/beaconTypes';

export class BeaconSubmitter {
  constructor(
    private holographicMemoryManager: HolographicMemoryManager
  ) {}

  /**
   * Submit following list beacon
   */
  async submitFollowingListBeacon(followingList: string[], currentUserId: string | null): Promise<void> {
    console.log(`[BeaconSubmitter] Submitting following list beacon`);
    
    const listData = JSON.stringify({
      following: followingList
    });
    
    try {
      const beacon = await this.holographicMemoryManager.encodeMemory(listData);
      console.log(`[BeaconSubmitter] Beacon encoded:`, beacon ? 'Success' : 'Failed');
      
      if (beacon) {
        const serializableBeacon = serializeBeacon(beacon as any);
        
        console.log(`[BeaconSubmitter] Serializable beacon prepared:`, {
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
              beaconType: BEACON_TYPES.USER_FOLLOWING_LIST
            }
          });
        } catch (error) {
          console.error('[BeaconSubmitter] Failed to send beacon:', error);
        }

        // Invalidate cache
        if (currentUserId) {
          beaconCacheManager.invalidateUserBeacons(currentUserId);
        }
      } else {
        console.error(`[BeaconSubmitter] Failed to encode beacon`);
      }
    } catch (error) {
      console.error(`[BeaconSubmitter] Error encoding beacon:`, error);
    }
  }

  /**
   * Submit spaces list beacon
   */
  async submitSpacesListBeacon(spacesList: any[], currentUserId: string | null): Promise<void> {
    const listData = JSON.stringify({
      spaces: spacesList,
      version: Date.now()
    });
    
    const beacon = await this.holographicMemoryManager.encodeMemory(listData);
    
    if (beacon) {
      const serializableBeacon = serializeBeacon(beacon as any);
      
      // Send via communication manager (SSE)
      try {
        await communicationManager.send({
          kind: 'submitPostBeacon',
          payload: {
            beacon: serializableBeacon as any,
            beaconType: BEACON_TYPES.USER_SPACES_LIST
          }
        });
      } catch (error) {
        console.error('[BeaconSubmitter] Failed to send beacon:', error);
      }

      // Invalidate cache
      if (currentUserId) {
        beaconCacheManager.invalidateUserBeacons(currentUserId);
      }
    }
  }
}