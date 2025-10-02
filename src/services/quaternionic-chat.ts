/* eslint-disable @typescript-eslint/no-explicit-any */
// Import ResoLang WASM functions
import * as ResoLang from '../../resolang/build/resolang.js';

// Type aliases for ResoLang WASM types (using any for WASM interop)
type ResoLangQuaternion = any;
type ResoLangQuaternionicResonanceField = any;
type ResoLangQuaternionicAgent = any;
type ResoLangEntangledQuaternionPair = any;
type ResoLangQuaternionicSynchronizer = any;
type ResoLangTwistDynamics = any;

export interface QuaternionicMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  phaseAlignment: number;
  entropyLevel: number;
  quaternion: ResoLangQuaternion;
  isQuantumDelivered: boolean;
  twistAngle: number;
}

export interface QuaternionicChatRoom {
  id: string;
  participants: string[];
  resonanceField: ResoLangQuaternionicResonanceField;
  messages: QuaternionicMessage[];
  phaseAlignments: Map<string, number>;
  avgEntropy: number;
}

export interface UserQuaternionicAgent {
  userId: string;
  prime: number;
  quaternion: ResoLangQuaternion;
  agent: ResoLangQuaternionicAgent;
  entanglements: Map<string, ResoLangEntangledQuaternionPair>;
}

/**
 * QuaternionicChatService - Implements quaternionically-enhanced symbolic non-local communication
 * Based on the mathematical framework from QuaternionNonlocal.pdf
 */
class QuaternionicChatService {
  private userAgents: Map<string, UserQuaternionicAgent> = new Map();
  private chatRooms: Map<string, QuaternionicChatRoom> = new Map();
  private synchronizer: ResoLangQuaternionicSynchronizer = null as any;
  private twistDynamics: ResoLangTwistDynamics = null as any;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // ResoLang WASM should be ready after import
      // Create global synchronizer and twist dynamics
      
      // Create global synchronizer and twist dynamics
      this.synchronizer = ResoLang.createQuaternionicSynchronizer();
      this.twistDynamics = ResoLang.createTwistDynamics();
      
      this.isInitialized = true;
      console.log('QuaternionicChatService initialized with ResoLang');
    } catch (error) {
      console.error('Failed to initialize QuaternionicChatService:', error);
      throw error;
    }
  }

  /**
   * Generate a split prime for a user ID (p ≡ 1 mod 12)
   */
  private generateSplitPrime(userId: string): number {
    // Hash user ID to get a deterministic seed
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    
    // Start from a large base and find next split prime
    let candidate = Math.abs(hash) % 10000 + 1000;
    
    // Ensure candidate ≡ 1 mod 12
    const remainder = candidate % 12;
    if (remainder !== 1) {
      candidate += (1 - remainder + 12) % 12;
    }
    
    // Find next prime that satisfies our condition
    while (!ResoLang.isSplitPrime(candidate)) {
      candidate += 12; // Maintain p ≡ 1 mod 12
    }
    
    return candidate;
  }

  /**
   * Initialize a user's quaternionic agent
   */
  async initializeUser(userId: string): Promise<UserQuaternionicAgent> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.userAgents.has(userId)) {
      return this.userAgents.get(userId)!;
    }

    try {
      // Generate split prime for user
      const prime = this.generateSplitPrime(userId);
      
      // Create quaternion from split prime
      const quaternion = ResoLang.createQuaternionFromPrime(prime);
      if (!quaternion) {
        throw new Error(`Failed to create quaternion from prime ${prime}`);
      }
      
      // Create quaternionic agent
      const agent = ResoLang.createQuaternionicAgent(quaternion);
      
      const userAgent: UserQuaternionicAgent = {
        userId,
        prime,
        quaternion,
        agent,
        entanglements: new Map()
      };
      
      this.userAgents.set(userId, userAgent);
      
      console.log(`Initialized quaternionic agent for user ${userId} with prime ${prime}`);
      return userAgent;
    } catch {
        console.warn(`Failed to initialize user ${userId} with quaternionic agent, they will not be able to use quantum chat features.`);
        // Return a dummy agent so the app doesn't crash
        return {
            userId,
            prime: 0,
            quaternion: null,
            agent: null,
            entanglements: new Map()
        };
    }
  }

  /**
   * Create a quaternionic chat room
   */
  async createChatRoom(roomId: string, participants: string[]): Promise<QuaternionicChatRoom> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Initialize all participants
      const userAgents = await Promise.all(
        participants.map(userId => this.initializeUser(userId))
      );
      
      // Create resonance field for the room
      const resonanceField = ResoLang.createQuaternionicResonanceField();
      
      // Add all participant primes to the resonance field
      for (const userAgent of userAgents) {
        const added = ResoLang.addPrimeToResonanceField(resonanceField, userAgent.prime);
        if (!added) {
          console.warn(`Failed to add prime ${userAgent.prime} to resonance field`);
        }
      }
      
      // Create entangled pairs between all participants
      for (let i = 0; i < userAgents.length; i++) {
        for (let j = i + 1; j < userAgents.length; j++) {
          const agent1 = userAgents[i];
          const agent2 = userAgents[j];
          
          const entangledPair = ResoLang.entangleQuaternionicAgents(
            agent1.agent, 
            agent2.agent, 
            0.95 // target fidelity
          );
          
          agent1.entanglements.set(agent2.userId, entangledPair);
          agent2.entanglements.set(agent1.userId, entangledPair);
          
          console.log(`Entangled agents ${agent1.userId} and ${agent2.userId}`);
        }
      }
      
      const chatRoom: QuaternionicChatRoom = {
        id: roomId,
        participants,
        resonanceField,
        messages: [],
        phaseAlignments: new Map(),
        avgEntropy: 0
      };
      
      this.chatRooms.set(roomId, chatRoom);
      
      console.log(`Created quaternionic chat room ${roomId} with ${participants.length} participants`);
      return chatRoom;
    } catch (error) {
      console.error(`Failed to create chat room ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Send a quaternionic message
   */
  async sendMessage(
    senderId: string, 
    receiverId: string, 
    content: string, 
    roomId?: string
  ): Promise<QuaternionicMessage> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const senderAgent = this.userAgents.get(senderId);
      const receiverAgent = this.userAgents.get(receiverId);
      
      if (!senderAgent || !receiverAgent) {
        throw new Error('Sender or receiver agent not initialized');
      }
      
      // Encode message in sender's agent
      ResoLang.encodeQuaternionicMessage(senderAgent.agent, content);
      
      // Attempt quaternionic transmission
      const transmitted = ResoLang.transmitQuaternionicMessage(
        senderAgent.agent,
        receiverAgent.agent,
        content,
        this.synchronizer
      );
      
      // Get sender's current quaternion state
      const senderQuaternion = ResoLang.getQuaternionicAgentQuaternion(senderAgent.agent);
      
      // Compute twist angle and check for collapse
      const twistAngle = ResoLang.computeTwistAngleFromQuaternion(this.twistDynamics, senderQuaternion);
      
      // Measure phase alignment between sender and receiver
      const receiverQuaternion = ResoLang.getQuaternionicAgentQuaternion(receiverAgent.agent);
      const phaseDiff = ResoLang.measureQuaternionPhaseDifference(
        this.synchronizer, 
        senderQuaternion, 
        receiverQuaternion
      );
      const phaseAlignment = 1.0 - Math.abs(phaseDiff) / Math.PI;
      
      // Calculate entropy (simplified)
      const entropy = this.calculateMessageEntropy(content);
      
      // Check for symbolic collapse
      const shouldCollapse = ResoLang.checkTwistCollapse(
        this.twistDynamics,
        entropy,
        0.3, // entropy threshold from paper
        0.1  // angle threshold
      );
      
      const message: QuaternionicMessage = {
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
      
      // Add to room if specified
      if (roomId && this.chatRooms.has(roomId)) {
        const room = this.chatRooms.get(roomId)!;
        room.messages.push(message);
        room.phaseAlignments.set(senderId, phaseAlignment);
        this.updateRoomEntropy(room);
      }
      
      console.log(`Quaternionic message sent: quantum=${transmitted}, collapse=${shouldCollapse}, phase=${phaseAlignment.toFixed(3)}`);
      
      return message;
    } catch (error) {
      console.error('Failed to send quaternionic message:', error);
      throw error;
    }
  }

  /**
   * Synchronize users' quaternions for better phase alignment
   */
  async synchronizeUsers(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      const agent1 = this.userAgents.get(user1Id);
      const agent2 = this.userAgents.get(user2Id);
      
      if (!agent1 || !agent2) {
        return false;
      }
      
      const q1 = ResoLang.getQuaternionicAgentQuaternion(agent1.agent);
      const q2 = ResoLang.getQuaternionicAgentQuaternion(agent2.agent);
      
      // Attempt synchronization
      const synchronized = ResoLang.synchronizeQuaternions(
        this.synchronizer,
        q1, q2,
        user1Id, user2Id,
        0.0, // target phase difference
        0.1  // tolerance
      );
      
      if (synchronized) {
        console.log(`Successfully synchronized users ${user1Id} and ${user2Id}`);
      }
      
      return synchronized;
    } catch (error) {
      console.error('Failed to synchronize users:', error);
      return false;
    }
  }

  /**
   * Get phase alignment between two users
   */
  getPhaseAlignment(user1Id: string, user2Id: string): number {
    try {
      const agent1 = this.userAgents.get(user1Id);
      const agent2 = this.userAgents.get(user2Id);
      
      if (!agent1 || !agent2) {
        return 0;
      }
      
      const q1 = ResoLang.getQuaternionicAgentQuaternion(agent1.agent);
      const q2 = ResoLang.getQuaternionicAgentQuaternion(agent2.agent);
      
      const phaseDiff = ResoLang.measureQuaternionPhaseDifference(this.synchronizer, q1, q2);
      return 1.0 - Math.abs(phaseDiff) / Math.PI;
    } catch (error) {
      console.error('Failed to get phase alignment:', error);
      return 0;
    }
  }

  /**
   * Get room entropy level
   */
  getRoomEntropy(roomId: string): number {
    const room = this.chatRooms.get(roomId);
    return room ? room.avgEntropy : 0;
  }

  /**
   * Get chat room
   */
  getChatRoom(roomId: string): QuaternionicChatRoom | undefined {
    return this.chatRooms.get(roomId);
  }

  /**
   * Get user agent
   */
  getUserAgent(userId: string): UserQuaternionicAgent | undefined {
    return this.userAgents.get(userId);
  }

  /**
   * Calculate message entropy (simplified implementation)
   */
  private calculateMessageEntropy(content: string): number {
    const charFreq = new Map<string, number>();
    for (const char of content) {
      charFreq.set(char, (charFreq.get(char) || 0) + 1);
    }
    
    let entropy = 0;
    const length = content.length;
    
    for (const freq of charFreq.values()) {
      const p = freq / length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy / Math.log2(length || 1); // Normalize
  }

  /**
   * Update room average entropy
   */
  private updateRoomEntropy(room: QuaternionicChatRoom): void {
    if (room.messages.length === 0) {
      room.avgEntropy = 0;
      return;
    }
    
    const totalEntropy = room.messages.reduce((sum, msg) => sum + msg.entropyLevel, 0);
    room.avgEntropy = totalEntropy / room.messages.length;
  }
}

export const quaternionicChatService = new QuaternionicChatService();