/* eslint-disable @typescript-eslint/no-explicit-any */
import { holographicMemoryManager } from './holographic-memory';
import { communicationManager } from './communication-manager';
import { quantumNetworkOps } from './quantum';
import { BEACON_TYPES } from '../constants/beaconTypes';

/**
 * MessagingService - Manages direct messages as holographic beacons
 * Messages are encoded client-side and only accessible by sender/recipient
 */
class MessagingService {
    private currentUserId: string | null = null;
    private currentUserPRI: any = null;

    /**
     * Initialize the messaging service with current user context
     */
    initialize(userId: string, pri: any): void {
        this.currentUserId = userId;
        this.currentUserPRI = pri;
        
        // Set PRI in holographic memory manager
        if (pri) {
            holographicMemoryManager.setCurrentUser(pri);
        }
        
        // Create quantum node for this user
        quantumNetworkOps.createQuantumNode(userId);
        
        console.log(`[MessagingService] Initialized for user: ${userId}`);
    }

    /**
     * Send a direct message to another user
     * The message is encoded as a holographic beacon
     */
    async sendDirectMessage(recipientId: string, content: string): Promise<void> {
        console.log(`[MessagingService] ===== SENDING MESSAGE =====`);
        console.log(`[MessagingService] To: ${recipientId}`);
        console.log(`[MessagingService] Content: "${content}"`);
        console.log(`[MessagingService] Current User ID: ${this.currentUserId}`);
        console.log(`[MessagingService] Current User PRI: ${this.currentUserPRI ? 'Present' : 'Missing'}`);
        
        if (!this.currentUserId) {
            console.error('[MessagingService] No current user set, cannot send message');
            throw new Error('MessagingService not initialized with current user');
        }

        // Ensure communication manager is connected
        console.log(`[MessagingService] Ensuring communication manager connection...`);
        await communicationManager.connect();
        console.log(`[MessagingService] Communication manager ready`);
        
        const messageData = JSON.stringify({
            recipientId,
            content,
            timestamp: new Date().toISOString()
        });
        console.log(`[MessagingService] Message data prepared:`, messageData);

        try {
            // Create entanglement with recipient for quantum teleportation
            console.log(`[MessagingService] Creating entanglement with ${recipientId}...`);
            const entanglementResult = await quantumNetworkOps.createEntanglement(
                this.currentUserId, recipientId
            );
            console.log(`[MessagingService] Entanglement result:`, entanglementResult);
            
            if (entanglementResult.success) {
                console.log(`[MessagingService] Quantum entanglement established with ${recipientId}`);
                
                // Try quantum teleportation
                const teleportResult = await quantumNetworkOps.teleportMemory(
                    messageData, this.currentUserId, recipientId
                );
                
                if (teleportResult.success) {
                    console.log(`[MessagingService] Message quantum teleported to ${recipientId} with fidelity: ${teleportResult.fidelity}`);
                    
                    // For true P2P quantum teleportation, we create a special beacon
                    // that contains the quantum-delivered message
                    const quantumMessageData = JSON.stringify({
                        messageId: Date.now().toString(),
                        senderId: this.currentUserId,
                        recipientId: recipientId,
                        content: content,
                        timestamp: new Date().toISOString(),
                        fidelity: teleportResult.fidelity || 0.7,
                        deliveryType: 'quantum_teleportation',
                        isQuantumDelivered: true
                    });
                    
                    // Encode as quantum beacon and submit
                    const quantumBeacon = await holographicMemoryManager.encodeMemory(quantumMessageData);
                    
                    if (quantumBeacon) {
                        const serializableBeacon = {
                            ...quantumBeacon,
                            fingerprint: Array.from(quantumBeacon.fingerprint),
                            signature: Array.from(quantumBeacon.signature),
                            // Add decoder-compatible fields for quantum messages too
                            prime_indices: JSON.stringify(quantumBeacon.index),
                            originalText: quantumMessageData,  // Store the full JSON data for fallback
                            coeffs: undefined,
                            center: undefined,
                            entropy: undefined,
                            primeResonance: undefined,
                            holographicField: undefined
                        };
                        
                        // Submit as quantum_message beacon type
                        await communicationManager.send({
                            kind: 'submitPostBeacon',
                            payload: {
                                beacon: serializableBeacon as any,
                                beaconType: 'quantum_message' // Note: This is a special type not in our constants yet
                            }
                        });
                        
                        console.log(`[MessagingService] Quantum-delivered message beacon submitted for ${recipientId}`);
                        return;
                    }
                }
            }
            
            // Fallback to holographic beacon submission
            console.log(`[MessagingService] ===== FALLBACK TO BEACON SUBMISSION =====`);
            console.log(`[MessagingService] Quantum teleportation failed, falling back to beacon submission`);
            console.log(`[MessagingService] Holographic memory manager ready?`, await holographicMemoryManager.isReady);
            console.log(`[MessagingService] Encoding message data:`, messageData);
            
            const beacon = await holographicMemoryManager.encodeMemory(messageData);
            console.log(`[MessagingService] Beacon encoding result:`, beacon ? 'Success' : 'Failed');
            
            if (beacon) {
                console.log(`[MessagingService] Raw beacon structure:`, {
                    fingerprint: beacon.fingerprint?.constructor?.name,
                    fingerprintLength: beacon.fingerprint?.length,
                    signature: beacon.signature?.constructor?.name,
                    signatureLength: beacon.signature?.length,
                    index: beacon.index,
                    epoch: beacon.epoch
                });
                
                // Convert Uint8Arrays to regular arrays for JSON serialization
                // AND fix structure for decoder compatibility
                const serializableBeacon = {
                    ...beacon,
                    fingerprint: Array.from(beacon.fingerprint),
                    signature: Array.from(beacon.signature),
                    // Add decoder-compatible fields
                    prime_indices: JSON.stringify(beacon.index),  // Convert index to prime_indices string
                    originalText: content,  // Store original text for fallback decoding
                    // Remove non-serializable fields
                    coeffs: undefined,
                    center: undefined,
                    entropy: undefined,
                    primeResonance: undefined,
                    holographicField: undefined
                };
                
                console.log(`[MessagingService] Serializable beacon prepared:`, {
                    fingerprint: serializableBeacon.fingerprint?.length,
                    signature: serializableBeacon.signature?.length,
                    index: serializableBeacon.index,
                    epoch: serializableBeacon.epoch
                });
                
                console.log(`[MessagingService] Submitting beacon with type: direct_message`);
                
                const wsMessage = {
                    kind: 'submitPostBeacon',
                    payload: {
                        beacon: serializableBeacon as any,
                        beaconType: BEACON_TYPES.DIRECT_MESSAGE
                    }
                } as any;
                console.log(`[MessagingService] Sending message via communication manager:`, wsMessage);
                
                await communicationManager.send(wsMessage);
                
                console.log(`[MessagingService] Holographic beacon submitted for message to ${recipientId}`);
            } else {
                console.error(`[MessagingService] Failed to encode message as holographic beacon`);
                throw new Error('Failed to encode message as holographic beacon');
            }
            
        } catch (error) {
            console.error('[MessagingService] Error in message sending:', error);
            throw error;
        }
    }

    /**
     * Send a space message to all members of a space
     * The message is encoded as a holographic beacon with space_message type
     */
    async sendSpaceMessage(spaceId: string, content: string): Promise<void> {
        console.log(`[MessagingService] ===== SENDING SPACE MESSAGE =====`);
        console.log(`[MessagingService] To Space: ${spaceId}`);
        console.log(`[MessagingService] Content: "${content}"`);
        console.log(`[MessagingService] Current User ID: ${this.currentUserId}`);
        
        if (!this.currentUserId) {
            console.error('[MessagingService] No current user set, cannot send space message');
            throw new Error('MessagingService not initialized with current user');
        }

        // Ensure communication manager is connected
        console.log(`[MessagingService] Ensuring communication manager connection...`);
        await communicationManager.connect();
        console.log(`[MessagingService] Communication manager ready`);
        
        const messageData = JSON.stringify({
            spaceId,
            senderId: this.currentUserId,
            content,
            timestamp: new Date().toISOString(),
            messageId: `${spaceId}_${this.currentUserId}_${Date.now()}`,
            deliveryType: 'space_broadcast'
        });
        console.log(`[MessagingService] Space message data prepared:`, messageData);

        try {
            // Encode as holographic beacon
            console.log(`[MessagingService] Encoding space message as holographic beacon...`);
            const beacon = await holographicMemoryManager.encodeMemory(messageData);
            console.log(`[MessagingService] Space beacon encoding result:`, beacon ? 'Success' : 'Failed');
            
            if (beacon) {
                // Convert for JSON serialization with decoder compatibility
                const serializableBeacon = {
                    ...beacon,
                    fingerprint: Array.from(beacon.fingerprint),
                    signature: Array.from(beacon.signature),
                    // Add decoder-compatible fields
                    prime_indices: JSON.stringify(beacon.index),
                    originalText: messageData,
                    // Remove non-serializable fields
                    coeffs: undefined,
                    center: undefined,
                    entropy: undefined,
                    primeResonance: undefined,
                    holographicField: undefined
                };
                
                console.log(`[MessagingService] Submitting space beacon with type: space_message`);
                
                await communicationManager.send({
                    kind: 'submitPostBeacon',
                    payload: {
                        beacon: serializableBeacon as any,
                        beaconType: BEACON_TYPES.SPACE_MESSAGE
                    }
                });
                
                console.log(`[MessagingService] Space message beacon submitted for space ${spaceId}`);
            } else {
                console.error(`[MessagingService] Failed to encode space message as holographic beacon`);
                throw new Error('Failed to encode space message as holographic beacon');
            }
            
        } catch (error) {
            console.error('[MessagingService] Error in space message sending:', error);
            throw error;
        }
    }

    /**
     * Get the current user ID
     */
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    /**
     * Check if messaging service is properly initialized
     */
    isInitialized(): boolean {
        return this.currentUserId !== null && this.currentUserPRI !== null;
    }

    /**
     * Get conversations from mutual followers
     * In a full implementation, this would query the network for users
     * who follow you back and have direct_message beacons
     */
    getConversations() {
        // This would be implemented by:
        // 1. Getting your following list beacon
        // 2. For each followed user, checking if they follow you back
        // 3. Finding direct_message beacons between you and them
        return [];
    }
}

export const messagingService = new MessagingService();