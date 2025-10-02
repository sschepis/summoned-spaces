import { getDatabase } from './database';
// Import ResoLang directly on server side
import * as ResoLang from '../resolang/build/resolang.js';
class ServerQuaternionicChatService {
    userAgents = new Map();
    synchronizer = null;
    twistDynamics = null;
    isInitialized = false;
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Initialize synchronizer and twist dynamics
            this.synchronizer = ResoLang.createQuaternionicSynchronizer();
            this.twistDynamics = ResoLang.createTwistDynamics();
            this.isInitialized = true;
            console.log('Server QuaternionicChatService initialized');
        }
        catch (error) {
            console.error('Failed to initialize server quaternionic chat:', error);
            throw error;
        }
    }
    generateSplitPrime(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
        }
        let candidate = Math.abs(hash) % 10000 + 1000;
        const remainder = candidate % 12;
        if (remainder !== 1) {
            candidate += (1 - remainder + 12) % 12;
        }
        // Find a split prime that ResoLang can convert to quaternion
        let attempts = 0;
        while (attempts < 100) {
            if (ResoLang.isSplitPrime(candidate)) {
                // Test if ResoLang can create a quaternion from this prime
                try {
                    const testQuaternion = ResoLang.createQuaternionFromPrime(candidate);
                    if (testQuaternion) {
                        console.log(`Found valid split prime ${candidate} for user ${userId}`);
                        return candidate;
                    }
                }
                catch (error) {
                    // This prime doesn't work with ResoLang, try next
                }
            }
            candidate += 12; // Maintain p ≡ 1 mod 12
            attempts++;
        }
        // Fallback to known working primes
        const knownGoodPrimes = [13, 37, 61, 73, 97, 109, 157, 181, 193, 229, 241, 277, 313, 337, 349];
        const fallbackPrime = knownGoodPrimes[Math.abs(hash) % knownGoodPrimes.length];
        console.log(`Using fallback prime ${fallbackPrime} for user ${userId}`);
        return fallbackPrime;
    }
    async initializeUser(userId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (this.userAgents.has(userId)) {
            return this.userAgents.get(userId);
        }
        try {
            const prime = this.generateSplitPrime(userId);
            const quaternion = ResoLang.createQuaternionFromPrime(prime);
            if (!quaternion) {
                throw new Error(`Failed to create quaternion from prime ${prime}`);
            }
            const agent = ResoLang.createQuaternionicAgent(quaternion);
            const userAgent = {
                userId,
                prime,
                quaternion,
                agent,
                entanglements: new Map()
            };
            this.userAgents.set(userId, userAgent);
            console.log(`Server: Initialized quaternionic agent for user ${userId} with prime ${prime}`);
            return userAgent;
        }
        catch (error) {
            console.error(`Failed to initialize user ${userId}:`, error);
            throw error;
        }
    }
    async sendMessage(senderId, receiverId, content) {
        const senderAgent = this.userAgents.get(senderId);
        const receiverAgent = this.userAgents.get(receiverId);
        if (!senderAgent || !receiverAgent) {
            throw new Error('Sender or receiver agent not initialized');
        }
        try {
            ResoLang.encodeQuaternionicMessage(senderAgent.agent, content);
            const transmitted = ResoLang.transmitQuaternionicMessage(senderAgent.agent, receiverAgent.agent, content, this.synchronizer);
            const senderQuaternion = ResoLang.getQuaternionicAgentQuaternion(senderAgent.agent);
            const receiverQuaternion = ResoLang.getQuaternionicAgentQuaternion(receiverAgent.agent);
            const twistAngle = ResoLang.computeTwistAngleFromQuaternion(this.twistDynamics, senderQuaternion);
            const phaseDiff = ResoLang.measureQuaternionPhaseDifference(this.synchronizer, senderQuaternion, receiverQuaternion);
            const phaseAlignment = 1.0 - Math.abs(phaseDiff) / Math.PI;
            const entropy = this.calculateMessageEntropy(content);
            const shouldCollapse = ResoLang.checkTwistCollapse(this.twistDynamics, entropy, 0.3, 0.1);
            return {
                id: `qmsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                senderId,
                receiverId,
                content,
                timestamp: Date.now(),
                phaseAlignment,
                entropyLevel: entropy,
                quaternion: senderQuaternion,
                isQuantumDelivered: transmitted && shouldCollapse,
                twistAngle
            };
        }
        catch (error) {
            console.error('Error in server quaternionic message sending:', error);
            throw error;
        }
    }
    async synchronizeUsers(user1Id, user2Id) {
        const agent1 = this.userAgents.get(user1Id);
        const agent2 = this.userAgents.get(user2Id);
        if (!agent1 || !agent2) {
            return false;
        }
        try {
            const q1 = ResoLang.getQuaternionicAgentQuaternion(agent1.agent);
            const q2 = ResoLang.getQuaternionicAgentQuaternion(agent2.agent);
            return ResoLang.synchronizeQuaternions(this.synchronizer, q1, q2, user1Id, user2Id, 0.0, 0.1);
        }
        catch (error) {
            console.error('Error in server phase synchronization:', error);
            return false;
        }
    }
    getPhaseAlignment(user1Id, user2Id) {
        const agent1 = this.userAgents.get(user1Id);
        const agent2 = this.userAgents.get(user2Id);
        if (!agent1 || !agent2) {
            return 0;
        }
        try {
            const q1 = ResoLang.getQuaternionicAgentQuaternion(agent1.agent);
            const q2 = ResoLang.getQuaternionicAgentQuaternion(agent2.agent);
            const phaseDiff = ResoLang.measureQuaternionPhaseDifference(this.synchronizer, q1, q2);
            return 1.0 - Math.abs(phaseDiff) / Math.PI;
        }
        catch (error) {
            console.error('Error getting phase alignment:', error);
            return 0;
        }
    }
    calculateMessageEntropy(content) {
        const charFreq = new Map();
        for (const char of content) {
            charFreq.set(char, (charFreq.get(char) || 0) + 1);
        }
        let entropy = 0;
        const length = content.length;
        for (const freq of charFreq.values()) {
            const p = freq / length;
            entropy -= p * Math.log2(p);
        }
        return entropy / Math.log2(length || 1);
    }
}
const serverQuaternionicChatService = new ServerQuaternionicChatService();
export class QuaternionicChatManager {
    connectionManager;
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        console.log('QuaternionicChatManager initialized');
    }
    async handleJoinChatRoom(userId, roomId, participants) {
        try {
            // Initialize all participants
            for (const participantId of participants) {
                await serverQuaternionicChatService.initializeUser(participantId);
            }
            console.log(`User ${userId} joined quaternionic chat room ${roomId} with ${participants.length} participants`);
            console.log(`User ${userId} joined quaternionic chat room ${roomId}`);
            // Broadcast to all participants that room is ready
            const roomReadyMessage = {
                kind: 'quaternionicRoomReady',
                payload: {
                    roomId,
                    participants,
                    phaseAlignment: 1.0, // Initial perfect alignment
                    entropyLevel: 0.0
                }
            };
            this.broadcastToUsers(participants, roomReadyMessage);
        }
        catch (error) {
            console.error(`Failed to create quaternionic chat room ${roomId}:`, error);
            // Send error to requesting user
            const connections = this.connectionManager.getConnectionsByUserId(userId);
            connections.forEach(connection => {
                connection.send(JSON.stringify({
                    kind: 'error',
                    payload: { message: `Failed to join quaternionic chat room: ${error}` }
                }));
            });
        }
    }
    async handleQuaternionicMessage(senderId, receiverId, content, roomId) {
        try {
            // Initialize agents if they don't exist
            await serverQuaternionicChatService.initializeUser(senderId);
            await serverQuaternionicChatService.initializeUser(receiverId);
            // Send quaternionic message using the service
            const message = await serverQuaternionicChatService.sendMessage(senderId, receiverId, content);
            console.log(`Quaternionic message sent from ${senderId} to ${receiverId}, quantum delivery: ${message.isQuantumDelivered}`);
            // Store message in database
            await this.storeQuaternionicMessage(message);
            // Determine delivery method based on quantum transmission success
            if (message.isQuantumDelivered) {
                // Instant quantum delivery - notify immediately
                this.deliverQuantumMessage(message, roomId);
            }
            else {
                // Traditional WebSocket delivery with quantum metrics
                this.deliverTraditionalMessage(message, roomId);
            }
        }
        catch (error) {
            console.error(`Failed to send quaternionic message:`, error);
            const connections = this.connectionManager.getConnectionsByUserId(senderId);
            connections.forEach(connection => {
                connection.send(JSON.stringify({
                    kind: 'error',
                    payload: { message: `Failed to send quaternionic message: ${error}` }
                }));
            });
        }
    }
    async handlePhaseSynchronization(user1Id, user2Id) {
        try {
            // Initialize agents if they don't exist
            await serverQuaternionicChatService.initializeUser(user1Id);
            await serverQuaternionicChatService.initializeUser(user2Id);
            const synchronized = await serverQuaternionicChatService.synchronizeUsers(user1Id, user2Id);
            const phaseAlignment = serverQuaternionicChatService.getPhaseAlignment(user1Id, user2Id);
            console.log(`Phase synchronization between ${user1Id} and ${user2Id}: ${synchronized}, alignment: ${phaseAlignment.toFixed(3)}`);
            // Notify both users of synchronization result
            const syncMessage = {
                kind: 'phaseSynchronized',
                payload: {
                    user1Id,
                    user2Id,
                    synchronized,
                    phaseAlignment,
                    timestamp: Date.now()
                }
            };
            this.broadcastToUsers([user1Id, user2Id], syncMessage);
        }
        catch (error) {
            console.error(`Failed to synchronize phases between ${user1Id} and ${user2Id}:`, error);
        }
    }
    deliverQuantumMessage(message, roomId) {
        const deliveryMessage = {
            kind: 'quaternionicMessageReceived',
            payload: {
                messageId: message.id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                content: message.content,
                timestamp: message.timestamp,
                phaseAlignment: message.phaseAlignment,
                entropyLevel: message.entropyLevel,
                twistAngle: message.twistAngle,
                deliveryType: 'quantum',
                isInstant: true
            }
        };
        if (roomId) {
            // Broadcast to all room participants
            const room = quaternionicChatService.getChatRoom(roomId);
            if (room) {
                this.broadcastToUsers(room.participants, deliveryMessage);
            }
        }
        else {
            // Direct message delivery
            this.broadcastToUsers([message.receiverId], deliveryMessage);
        }
    }
    deliverTraditionalMessage(message, roomId) {
        const deliveryMessage = {
            kind: 'quaternionicMessageReceived',
            payload: {
                messageId: message.id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                content: message.content,
                timestamp: message.timestamp,
                phaseAlignment: message.phaseAlignment,
                entropyLevel: message.entropyLevel,
                twistAngle: message.twistAngle,
                deliveryType: 'traditional',
                isInstant: false
            }
        };
        if (roomId) {
            // Broadcast to all room participants
            const room = quaternionicChatService.getChatRoom(roomId);
            if (room) {
                this.broadcastToUsers(room.participants, deliveryMessage);
            }
        }
        else {
            // Direct message delivery
            this.broadcastToUsers([message.receiverId], deliveryMessage);
        }
    }
    async storeQuaternionicMessage(message) {
        const db = getDatabase();
        const sql = `
      INSERT INTO quaternionic_messages (
        message_id, sender_id, receiver_id, content, room_id,
        phase_alignment, entropy_level, twist_angle, 
        is_quantum_delivered, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        return new Promise((resolve, reject) => {
            db.run(sql, [
                message.id,
                message.senderId,
                message.receiverId,
                message.content,
                message.roomId || null,
                message.phaseAlignment,
                message.entropyLevel,
                message.twistAngle,
                message.isQuantumDelivered ? 1 : 0,
                new Date().toISOString()
            ], (err) => {
                if (err) {
                    console.error('Error storing quaternionic message:', err.message);
                    return reject(err);
                }
                console.log(`Quaternionic message ${message.id} stored in database`);
                resolve();
            });
        });
    }
    broadcastToUsers(userIds, message) {
        userIds.forEach(userId => {
            const connections = this.connectionManager.getConnectionsByUserId(userId);
            connections.forEach(connection => {
                try {
                    connection.send(JSON.stringify(message));
                }
                catch (error) {
                    console.error(`Failed to send message to user ${userId}:`, error);
                }
            });
        });
    }
    async getQuaternionicMessageHistory(roomId, limit = 50) {
        const db = getDatabase();
        const sql = `
      SELECT * FROM quaternionic_messages 
      WHERE room_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
        return new Promise((resolve, reject) => {
            db.all(sql, [roomId, limit], (err, rows) => {
                if (err) {
                    console.error('Error fetching quaternionic message history:', err.message);
                    return reject(err);
                }
                resolve(rows.reverse()); // Return in chronological order
            });
        });
    }
    async getRoomMetrics(roomId) {
        // For now, return simplified metrics since room management is simplified
        return {
            roomId,
            participantCount: 0,
            messageCount: 0,
            avgPhaseAlignment: 0.8,
            avgEntropy: 0.3,
            lastActivity: Date.now()
        };
    }
}
