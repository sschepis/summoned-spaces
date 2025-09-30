// Quantum Consensus Protocol (QCP)
// Uses coherence measurements for distributed state validation

import { NetworkNode, NodeID } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";
import { calculateStateHash } from "./hsp-protocol";
import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";

// Consensus types
export enum ConsensusType {
  COHERENCE_BASED = 0,    // Use coherence measurements
  MAJORITY_VOTE = 1,      // Simple majority
  WEIGHTED_VOTE = 2,      // Weight by entanglement strength
  BYZANTINE_FAULT = 3     // Byzantine fault tolerant
}

// Vote on a state
export class StateVote implements Serializable {
  nodeId: NodeID;
  stateHash: string;
  coherenceScore: f64;
  timestamp: f64;
  signature: string;
  
  constructor(
    nodeId: NodeID,
    stateHash: string,
    coherenceScore: f64
  ) {
    this.nodeId = nodeId;
    this.stateHash = stateHash;
    this.coherenceScore = coherenceScore;
    this.timestamp = Date.now() as f64;
    this.signature = this.generateSignature();
  }
  
  private generateSignature(): string {
    // Simplified signature using node ID and state hash
    return `${this.nodeId}-${this.stateHash}-${this.coherenceScore}`;
  }
  
  verify(): boolean {
    // In real implementation, verify cryptographic signature
    return this.signature == this.generateSignature();
  }
  
  toString(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addStringField("nodeId", this.nodeId)
      .addStringField("stateHash", this.stateHash)
      .addNumberField("coherenceScore", this.coherenceScore)
      .addNumberField("timestamp", this.timestamp)
      .endObject()
      .build();
  }
}

// Consensus round
export class ConsensusRound {
  roundId: string;
  proposedState: PrimeState;
  proposedHash: string;
  votes: Map<NodeID, StateVote>;
  startTime: f64;
  timeout: f64;
  requiredVotes: u32;
  consensusType: ConsensusType;
  
  constructor(
    proposedState: PrimeState,
    requiredVotes: u32,
    timeout: f64 = 5000,
    consensusType: ConsensusType = ConsensusType.COHERENCE_BASED
  ) {
    this.roundId = this.generateRoundId();
    this.proposedState = proposedState;
    this.proposedHash = calculateStateHash(proposedState);
    this.votes = new Map<NodeID, StateVote>();
    this.startTime = Date.now() as f64;
    this.timeout = timeout;
    this.requiredVotes = requiredVotes;
    this.consensusType = consensusType;
  }
  
  private generateRoundId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `round-${timestamp}-${random}`;
  }
  
  addVote(vote: StateVote): boolean {
    if (!vote.verify()) {
      return false;
    }
    
    // Check if vote is for the proposed state
    if (vote.stateHash != this.proposedHash) {
      return false;
    }
    
    this.votes.set(vote.nodeId, vote);
    return true;
  }
  
  isComplete(): boolean {
    return this.votes.size >= this.requiredVotes || this.isTimedOut();
  }
  
  isTimedOut(): boolean {
    return (Date.now() as f64) - this.startTime > this.timeout;
  }
  
  getResult(): ConsensusResult {
    const result = new ConsensusResult(this.roundId, this.proposedHash);
    
    if (this.isTimedOut()) {
      result.status = ConsensusStatus.TIMEOUT;
      return result;
    }
    
    switch (this.consensusType) {
      case ConsensusType.COHERENCE_BASED:
        return this.calculateCoherenceConsensus();
        
      case ConsensusType.MAJORITY_VOTE:
        return this.calculateMajorityConsensus();
        
      case ConsensusType.WEIGHTED_VOTE:
        return this.calculateWeightedConsensus();
        
      case ConsensusType.BYZANTINE_FAULT:
        return this.calculateByzantineConsensus();
        
      default:
        result.status = ConsensusStatus.FAILED;
        return result;
    }
  }
  
  private calculateCoherenceConsensus(): ConsensusResult {
    const result = new ConsensusResult(this.roundId, this.proposedHash);
    
    // Calculate average coherence score
    let totalCoherence: f64 = 0.0;
    let validVotes: u32 = 0;
    
    const votes = this.votes.values();
    for (let i = 0; i < votes.length; i++) {
      const vote = votes[i];
      if (vote.coherenceScore > 0.0) {
        totalCoherence += vote.coherenceScore;
        validVotes++;
      }
    }
    
    if (validVotes == 0) {
      result.status = ConsensusStatus.FAILED;
      return result;
    }
    
    const avgCoherence = totalCoherence / f64(validVotes);
    result.coherenceScore = avgCoherence;
    
    // Consensus achieved if average coherence > 0.85
    if (avgCoherence >= 0.85) {
      result.status = ConsensusStatus.ACCEPTED;
      result.confidence = avgCoherence;
    } else {
      result.status = ConsensusStatus.REJECTED;
    }
    
    return result;
  }
  
  private calculateMajorityConsensus(): ConsensusResult {
    const result = new ConsensusResult(this.roundId, this.proposedHash);
    
    const totalVotes = this.votes.size;
    const threshold = totalVotes / 2 + 1;
    
    if (this.votes.size >= threshold) {
      result.status = ConsensusStatus.ACCEPTED;
      result.confidence = f64(this.votes.size) / f64(this.requiredVotes);
    } else {
      result.status = ConsensusStatus.REJECTED;
    }
    
    return result;
  }
  
  private calculateWeightedConsensus(): ConsensusResult {
    const result = new ConsensusResult(this.roundId, this.proposedHash);
    
    // Weight votes by coherence score
    let weightedSum: f64 = 0.0;
    let totalWeight: f64 = 0.0;
    
    const votes = this.votes.values();
    for (let i = 0; i < votes.length; i++) {
      const vote = votes[i];
      const weight = vote.coherenceScore;
      weightedSum += weight;
      totalWeight += 1.0;  // Maximum possible weight per vote
    }
    
    if (totalWeight == 0.0) {
      result.status = ConsensusStatus.FAILED;
      return result;
    }
    
    const weightedAverage = weightedSum / totalWeight;
    result.confidence = weightedAverage;
    
    // Accept if weighted average > 0.67 (2/3 threshold)
    if (weightedAverage >= 0.67) {
      result.status = ConsensusStatus.ACCEPTED;
    } else {
      result.status = ConsensusStatus.REJECTED;
    }
    
    return result;
  }
  
  private calculateByzantineConsensus(): ConsensusResult {
    const result = new ConsensusResult(this.roundId, this.proposedHash);
    
    // Byzantine fault tolerance: need > 2/3 votes
    const totalNodes = this.requiredVotes;
    const byzantineThreshold = (totalNodes * 2) / 3 + 1;
    
    // Count high-coherence votes (coherence > 0.8)
    let highCoherenceVotes: u32 = 0;
    const votes = this.votes.values();
    
    for (let i = 0; i < votes.length; i++) {
      if (votes[i].coherenceScore > 0.8) {
        highCoherenceVotes++;
      }
    }
    
    if (highCoherenceVotes >= byzantineThreshold) {
      result.status = ConsensusStatus.ACCEPTED;
      result.confidence = f64(highCoherenceVotes) / f64(totalNodes);
    } else {
      result.status = ConsensusStatus.REJECTED;
    }
    
    return result;
  }
}

// Consensus status
export enum ConsensusStatus {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2,
  TIMEOUT = 3,
  FAILED = 4
}

// Consensus result
export class ConsensusResult implements Serializable {
  roundId: string;
  stateHash: string;
  status: ConsensusStatus;
  confidence: f64;
  coherenceScore: f64;
  timestamp: f64;
  
  constructor(roundId: string, stateHash: string) {
    this.roundId = roundId;
    this.stateHash = stateHash;
    this.status = ConsensusStatus.PENDING;
    this.confidence = 0.0;
    this.coherenceScore = 0.0;
    this.timestamp = Date.now() as f64;
  }
  
  isAccepted(): boolean {
    return this.status == ConsensusStatus.ACCEPTED;
  }
  
  toString(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addStringField("roundId", this.roundId)
      .addStringField("stateHash", this.stateHash)
      .addIntegerField("status", this.status)
      .addNumberField("confidence", this.confidence)
      .addNumberField("coherenceScore", this.coherenceScore)
      .endObject()
      .build();
  }
}

// Quantum Consensus Manager
export class QuantumConsensusManager {
  nodeId: NodeID;
  activeRounds: Map<string, ConsensusRound>;
  completedRounds: Map<string, ConsensusResult>;
  consensusThreshold: f64;
  defaultTimeout: f64;
  maxActiveRounds: u32;
  
  constructor(
    nodeId: NodeID,
    consensusThreshold: f64 = 0.85,
    defaultTimeout: f64 = 5000,
    maxActiveRounds: u32 = 10
  ) {
    this.nodeId = nodeId;
    this.activeRounds = new Map<string, ConsensusRound>();
    this.completedRounds = new Map<string, ConsensusResult>();
    this.consensusThreshold = consensusThreshold;
    this.defaultTimeout = defaultTimeout;
    this.maxActiveRounds = maxActiveRounds;
  }
  
  // Propose a new state for consensus
  proposeState(
    state: PrimeState,
    participants: Array<NetworkNode>,
    consensusType: ConsensusType = ConsensusType.COHERENCE_BASED
  ): ConsensusRound {
    // Clean up old rounds
    this.cleanupOldRounds();
    
    // Calculate required votes based on consensus type
    let requiredVotes: u32 = 0;
    switch (consensusType) {
      case ConsensusType.BYZANTINE_FAULT:
        requiredVotes = u32((participants.length * 2) / 3 + 1);
        break;
      case ConsensusType.MAJORITY_VOTE:
        requiredVotes = u32(participants.length / 2 + 1);
        break;
      default:
        requiredVotes = u32(Math.max(3, participants.length * 0.67));
    }
    
    const round = new ConsensusRound(
      state,
      requiredVotes,
      this.defaultTimeout,
      consensusType
    );
    
    this.activeRounds.set(round.roundId, round);
    
    // Self-vote with our coherence measurement
    const selfCoherence = this.measureStateCoherence(state, participants);
    const selfVote = new StateVote(this.nodeId, round.proposedHash, selfCoherence);
    round.addVote(selfVote);
    
    return round;
  }
  
  // Submit vote for a consensus round
  submitVote(roundId: string, vote: StateVote): boolean {
    const round = this.activeRounds.get(roundId);
    if (!round || round.isComplete()) {
      return false;
    }
    
    return round.addVote(vote);
  }
  
  // Check and finalize consensus rounds
  checkConsensus(): Array<ConsensusResult> {
    const results = new Array<ConsensusResult>();
    const roundIds = this.activeRounds.keys();
    
    for (let i = 0; i < roundIds.length; i++) {
      const roundId = roundIds[i];
      const round = this.activeRounds.get(roundId);
      
      if (round && round.isComplete()) {
        const result = round.getResult();
        results.push(result);
        
        // Move to completed
        this.completedRounds.set(roundId, result);
        this.activeRounds.delete(roundId);
      }
    }
    
    return results;
  }
  
  // Measure coherence between proposed state and network
  private measureStateCoherence(
    state: PrimeState,
    participants: Array<NetworkNode>
  ): f64 {
    if (participants.length == 0) return 0.0;
    
    let totalCoherence: f64 = 0.0;
    let measurements: u32 = 0;
    
    // Measure coherence with each participant
    for (let i = 0; i < participants.length; i++) {
      const node = participants[i];
      
      // Simulate coherence measurement based on state similarity
      // In real implementation, this would use quantum coherence operators
      const coherence = this.calculatePairwiseCoherence(state, node);
      
      if (coherence > 0.0) {
        totalCoherence += coherence;
        measurements++;
      }
    }
    
    return measurements > 0 ? totalCoherence / f64(measurements) : 0.0;
  }
  
  // Calculate pairwise coherence
  private calculatePairwiseCoherence(
    state: PrimeState,
    node: NetworkNode
  ): f64 {
    // Simplified coherence based on node properties
    // In real implementation, compare quantum states
    const baseCoherence = node.entangledNode.coherence;
    
    // Adjust based on state complexity
    const stateSize = state.amplitudes.size;
    const complexityFactor = 1.0 / (1.0 + Math.log(f64(stateSize)));
    
    return baseCoherence * complexityFactor;
  }
  
  // Clean up old consensus rounds
  private cleanupOldRounds(): void {
    const roundIds = this.activeRounds.keys();
    let removed: u32 = 0;
    
    for (let i = 0; i < roundIds.length; i++) {
      const round = this.activeRounds.get(roundIds[i]);
      if (round && round.isTimedOut()) {
        const result = round.getResult();
        this.completedRounds.set(round.roundId, result);
        this.activeRounds.delete(roundIds[i]);
        removed++;
      }
    }
    
    // Limit completed rounds history
    if (this.completedRounds.size > this.maxActiveRounds * 2) {
      const completedIds = this.completedRounds.keys();
      const toRemove = this.completedRounds.size - this.maxActiveRounds;
      
      for (let i = 0; i < toRemove && i < completedIds.length; i++) {
        this.completedRounds.delete(completedIds[i]);
      }
    }
  }
  
  // Get consensus statistics
  getStats(): string {
    let accepted: u32 = 0;
    let rejected: u32 = 0;
    let timeout: u32 = 0;
    
    const results = this.completedRounds.values();
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      switch (result.status) {
        case ConsensusStatus.ACCEPTED:
          accepted++;
          break;
        case ConsensusStatus.REJECTED:
          rejected++;
          break;
        case ConsensusStatus.TIMEOUT:
          timeout++;
          break;
      }
    }
    
    return `{"activeRounds":${this.activeRounds.size},"completedRounds":${this.completedRounds.size},"accepted":${accepted},"rejected":${rejected},"timeout":${timeout}}`;
  }
}

// Consensus validator for state verification
export class ConsensusValidator {
  consensusManager: QuantumConsensusManager;
  validationCache: Map<string, boolean>;
  cacheTimeout: f64;
  
  constructor(
    consensusManager: QuantumConsensusManager,
    cacheTimeout: f64 = 60000
  ) {
    this.consensusManager = consensusManager;
    this.validationCache = new Map<string, boolean>();
    this.cacheTimeout = cacheTimeout;
  }
  
  // Validate a state has consensus
  validateState(stateHash: string): boolean {
    // Check cache
    if (this.validationCache.has(stateHash)) {
      return this.validationCache.get(stateHash);
    }
    
    // Check completed rounds
    const results = this.consensusManager.completedRounds.values();
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.stateHash == stateHash && result.isAccepted()) {
        this.validationCache.set(stateHash, true);
        return true;
      }
    }
    
    this.validationCache.set(stateHash, false);
    return false;
  }
  
  // Get consensus confidence for a state
  getStateConfidence(stateHash: string): f64 {
    const results = this.consensusManager.completedRounds.values();
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.stateHash == stateHash) {
        return result.confidence;
      }
    }
    return 0.0;
  }
  
  // Clear validation cache
  clearCache(): void {
    this.validationCache.clear();
  }
}

// Export convenience functions
export function createConsensusManager(nodeId: NodeID): QuantumConsensusManager {
  return new QuantumConsensusManager(nodeId);
}

export function createConsensusValidator(
  manager: QuantumConsensusManager
): ConsensusValidator {
  return new ConsensusValidator(manager);
}