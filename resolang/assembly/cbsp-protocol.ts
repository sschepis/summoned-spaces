import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";
// Coherence-Based Sync Protocol (CBSP) Implementation
// Uses phase-locking and coherence measurements for automatic state synchronization

import { NetworkNode, NodeID, Phase } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";

// CBSP Message types
export enum CBSPMessageType {
  PHASE_SYNC = 0,
  COHERENCE_MEASURE = 1,
  SYNC_COMMIT = 2
}

// Phase vector for synchronization
export class PhaseVector implements Serializable {
  nodeId: NodeID;
  phases: Array<Phase>;
  timestamp: f64;
  
  constructor(nodeId: NodeID, phases: Array<Phase>) {
    this.nodeId = nodeId;
    this.phases = phases;
    this.timestamp = Date.now() as f64;
  }
  
  // Calculate weighted average with another phase vector
  weightedAverage(other: PhaseVector, weight: f64): PhaseVector {
    const avgPhases = new Array<Phase>();
    const minLength = Math.min(this.phases.length, other.phases.length);
    
    for (let i = 0; i < minLength; i++) {
      // Circular mean for phases
      const x1 = Math.cos(this.phases[i]);
      const y1 = Math.sin(this.phases[i]);
      const x2 = Math.cos(other.phases[i]);
      const y2 = Math.sin(other.phases[i]);
      
      const avgX = (1.0 - weight) * x1 + weight * x2;
      const avgY = (1.0 - weight) * y1 + weight * y2;
      
      const avgPhase = Math.atan2(avgY, avgX);
      avgPhases.push(avgPhase);
    }
    
    return new PhaseVector(this.nodeId, avgPhases);
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    
    // Build phases array
    let phasesJson = "[";
    for (let i = 0; i < this.phases.length; i++) {
      if (i > 0) phasesJson += ",";
      phasesJson += this.phases[i].toString();
    }
    phasesJson += "]";
    
    return builder
      .startObject()
      .addStringField("nodeId", this.nodeId)
      .addRawField("phases", phasesJson)
      .addNumberField("timestamp", this.timestamp)
      .endObject()
      .build();
  }
  
  toString(): string {
    return this.toJSON();
  }
}

// Coherence measurement between nodes
export class CoherenceMeasurement implements Serializable {
  nodeId1: NodeID;
  nodeId2: NodeID;
  coherence: f64;
  timestamp: f64;
  
  constructor(nodeId1: NodeID, nodeId2: NodeID, coherence: f64) {
    this.nodeId1 = nodeId1;
    this.nodeId2 = nodeId2;
    this.coherence = coherence;
    this.timestamp = Date.now() as f64;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addStringField("nodeId1", this.nodeId1)
      .addStringField("nodeId2", this.nodeId2)
      .addNumberField("coherence", this.coherence)
      .addNumberField("timestamp", this.timestamp)
      .endObject()
      .build();
  }
  
  toString(): string {
    return this.toJSON();
  }
}

// CBSP Protocol Message
export class CBSPMessage {
  type: CBSPMessageType;
  nodeId: NodeID;
  phaseVector: PhaseVector | null;
  coherenceMap: Map<NodeID, f64>;
  syncGeneration: u32;
  deltaEntropy: f64;
  timestamp: f64;
  
  constructor(
    type: CBSPMessageType,
    nodeId: NodeID,
    syncGeneration: u32
  ) {
    this.type = type;
    this.nodeId = nodeId;
    this.phaseVector = null;
    this.coherenceMap = new Map<NodeID, f64>();
    this.syncGeneration = syncGeneration;
    this.deltaEntropy = 0.0;
    this.timestamp = Date.now() as f64;
  }
  
  setPhaseVector(phaseVector: PhaseVector): void {
    this.phaseVector = phaseVector;
  }
  
  addCoherence(nodeId: NodeID, coherence: f64): void {
    this.coherenceMap.set(nodeId, coherence);
  }
  
  serialize(): string {
    let json = "{";
    json += `"type":${this.type},`;
    json += `"nodeId":"${this.nodeId}",`;
    
    if (this.phaseVector) {
      json += `"phaseVector":${this.phaseVector.toString()},`;
    }
    
    json += `"coherenceMap":{`;
    const nodeIds = this.coherenceMap.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      if (i > 0) json += ",";
      const nodeId = nodeIds[i];
      const coherence = this.coherenceMap.get(nodeId);
      json += `"${nodeId}":${coherence}`;
    }
    json += "},";
    
    json += `"syncGeneration":${this.syncGeneration},`;
    json += `"deltaEntropy":${this.deltaEntropy},`;
    json += `"timestamp":${this.timestamp}`;
    json += "}";
    
    return json;
  }
}

// Phase synchronization engine
export class PhaseSynchronizer {
  coherenceThreshold: f64;
  convergenceThreshold: f64;
  maxRounds: i32;
  
  constructor(
    coherenceThreshold: f64 = 0.85,
    convergenceThreshold: f64 = 0.01,
    maxRounds: i32 = 5
  ) {
    this.coherenceThreshold = coherenceThreshold;
    this.convergenceThreshold = convergenceThreshold;
    this.maxRounds = maxRounds;
  }
  
  // Extract phase vector from node
  extractPhaseVector(node: NetworkNode): PhaseVector {
    const phases = new Array<Phase>();
    
    // Get phases from the node's phase ring
    for (let i = 0; i < node.entangledNode.phaseRing.length; i++) {
      phases.push(node.entangledNode.phaseRing[i]);
    }
    
    return new PhaseVector(node.id, phases);
  }
  
  // Calculate consensus phase from multiple nodes
  calculateConsensusPhase(
    phaseVectors: Array<PhaseVector>,
    weights: Array<f64>
  ): PhaseVector | null {
    if (phaseVectors.length == 0) return null;
    
    // Normalize weights
    let totalWeight: f64 = 0.0;
    for (let i = 0; i < weights.length; i++) {
      totalWeight += weights[i];
    }
    
    if (totalWeight == 0.0) return null;
    
    // Start with first vector
    let consensus = phaseVectors[0];
    
    // Weighted average with remaining vectors
    for (let i = 1; i < phaseVectors.length && i < weights.length; i++) {
      const normalizedWeight = weights[i] / totalWeight;
      consensus = consensus.weightedAverage(phaseVectors[i], normalizedWeight);
    }
    
    return consensus;
  }
  
  // Apply phase adjustment to node
  applyPhaseAdjustment(
    node: NetworkNode,
    targetPhases: Array<Phase>
  ): void {
    // Update the node's phase ring
    for (let i = 0; i < targetPhases.length && i < node.entangledNode.phaseRing.length; i++) {
      node.entangledNode.phaseRing[i] = targetPhases[i];
    }
    
    // Update phase sync time
    node.updatePhaseSync(Date.now() as f64);
  }
  
  // Measure phase difference between two vectors
  measurePhaseDifference(
    phases1: Array<Phase>,
    phases2: Array<Phase>
  ): f64 {
    let totalDiff: f64 = 0.0;
    const minLength = Math.min(phases1.length, phases2.length);
    
    if (minLength == 0) return Math.PI;  // Maximum difference
    
    for (let i = 0; i < minLength; i++) {
      // Calculate circular distance
      let diff = Math.abs(phases1[i] - phases2[i]);
      if (diff > Math.PI) {
        diff = 2.0 * Math.PI - diff;
      }
      totalDiff += diff;
    }
    
    return totalDiff / f64(minLength);
  }
}

// Coherence-based synchronization manager
export class CoherenceSyncManager {
  synchronizer: PhaseSynchronizer;
  syncGeneration: u32;
  phaseHistory: Map<NodeID, Array<PhaseVector>>;
  coherenceHistory: Map<string, Array<f64>>;
  
  constructor() {
    this.synchronizer = new PhaseSynchronizer();
    this.syncGeneration = 0;
    this.phaseHistory = new Map<NodeID, Array<PhaseVector>>();
    this.coherenceHistory = new Map<string, Array<f64>>();
  }
  
  // Initiate synchronization round
  initiateSyncRound(nodes: Array<NetworkNode>): Map<NodeID, CBSPMessage> {
    this.syncGeneration++;
    const messages = new Map<NodeID, CBSPMessage>();
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const msg = new CBSPMessage(
        CBSPMessageType.PHASE_SYNC,
        node.id,
        this.syncGeneration
      );
      
      // Extract and set phase vector
      const phaseVector = this.synchronizer.extractPhaseVector(node);
      msg.setPhaseVector(phaseVector);
      
      // Store in history
      if (!this.phaseHistory.has(node.id)) {
        this.phaseHistory.set(node.id, new Array<PhaseVector>());
      }
      this.phaseHistory.get(node.id).push(phaseVector);
      
      // Calculate entropy change
      const currentEntropy = node.getCurrentEntropy(Date.now() as f64);
      const previousEntropy = node.getCurrentEntropy(Date.now() as f64 - 100.0);
      msg.deltaEntropy = currentEntropy - previousEntropy;
      
      messages.set(node.id, msg);
    }
    
    return messages;
  }
  
  // Process coherence measurements
  processCoherenceMeasurements(
    node: NetworkNode,
    neighbors: Array<NetworkNode>
  ): Map<NodeID, f64> {
    const coherenceMap = new Map<NodeID, f64>();
    
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      const coherence = node.computeCoherence(neighbor);
      coherenceMap.set(neighbor.id, coherence);
      
      // Store in history
      const pairKey = `${node.id}-${neighbor.id}`;
      if (!this.coherenceHistory.has(pairKey)) {
        this.coherenceHistory.set(pairKey, new Array<f64>());
      }
      this.coherenceHistory.get(pairKey).push(coherence);
    }
    
    return coherenceMap;
  }
  
  // Calculate phase adjustments for synchronization
  calculatePhaseAdjustments(
    node: NetworkNode,
    neighborPhases: Map<NodeID, PhaseVector>,
    coherenceMap: Map<NodeID, f64>
  ): Array<Phase> | null {
    const phaseVectors = new Array<PhaseVector>();
    const weights = new Array<f64>();
    
    // Add node's own phase with weight based on its coherence
    const ownPhase = this.synchronizer.extractPhaseVector(node);
    phaseVectors.push(ownPhase);
    weights.push(node.entangledNode.coherence);
    
    // Add neighbor phases weighted by coherence and entanglement
    const neighborIds = neighborPhases.keys();
    for (let i = 0; i < neighborIds.length; i++) {
      const neighborId = neighborIds[i];
      const phaseVector = neighborPhases.get(neighborId);
      const coherence = coherenceMap.get(neighborId);
      const entanglement = node.entanglementMap.get(neighborId);
      
      if (phaseVector && coherence && entanglement) {
        // Weight = coherence * entanglement strength
        const weight = coherence * entanglement;
        if (weight > 0.1) {  // Minimum weight threshold
          phaseVectors.push(phaseVector);
          weights.push(weight);
        }
      }
    }
    
    // Calculate consensus
    const consensus = this.synchronizer.calculateConsensusPhase(phaseVectors, weights);
    return consensus ? consensus.phases : null;
  }
  
  // Check convergence of synchronization
  checkConvergence(
    nodes: Array<NetworkNode>,
    previousCoherence: f64
  ): boolean {
    // Calculate average network coherence
    let totalCoherence: f64 = 0.0;
    let pairCount: i32 = 0;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const coherence = nodes[i].computeCoherence(nodes[j]);
        totalCoherence += coherence;
        pairCount++;
      }
    }
    
    if (pairCount == 0) return true;
    
    const avgCoherence = totalCoherence / f64(pairCount);
    const improvement = avgCoherence - previousCoherence;
    
    // Converged if improvement is below threshold
    return Math.abs(improvement) < this.synchronizer.convergenceThreshold;
  }
  
  // Get synchronization statistics
  getSyncStats(): string {
    let json = "{";
    json += `"generation":${this.syncGeneration},`;
    json += `"phaseHistorySize":${this.phaseHistory.size},`;
    json += `"coherenceHistorySize":${this.coherenceHistory.size}`;
    json += "}";
    return json;
  }
}

// Auto-sync trigger conditions
export class AutoSyncTrigger {
  coherenceDropThreshold: f64;
  entropyGradientThreshold: f64;
  periodicInterval: f64;
  lastSyncTime: f64;
  
  constructor(
    coherenceDrop: f64 = 0.15,
    entropyGradient: f64 = 0.1,
    interval: f64 = 100.0
  ) {
    this.coherenceDropThreshold = coherenceDrop;
    this.entropyGradientThreshold = entropyGradient;
    this.periodicInterval = interval;
    this.lastSyncTime = 0.0;
  }
  
  // Check if sync should be triggered
  shouldTriggerSync(
    node: NetworkNode,
    avgCoherence: f64,
    prevAvgCoherence: f64
  ): boolean {
    const currentTime = Date.now() as f64;
    
    // Check periodic trigger
    if (currentTime - this.lastSyncTime > this.periodicInterval) {
      return true;
    }
    
    // Check coherence drop
    const coherenceDrop = prevAvgCoherence - avgCoherence;
    if (coherenceDrop > this.coherenceDropThreshold) {
      return true;
    }
    
    // Check entropy gradient
    const entropyGradient = node.entropyEvolution.lambda * node.getCurrentEntropy(currentTime);
    if (Math.abs(entropyGradient) > this.entropyGradientThreshold) {
      return true;
    }
    
    // Check if node should collapse
    if (node.shouldCollapse(currentTime)) {
      return true;
    }
    
    return false;
  }
  
  // Update sync time
  updateSyncTime(): void {
    this.lastSyncTime = Date.now() as f64;
  }
}

// Export convenience functions
export function createSyncManager(): CoherenceSyncManager {
  return new CoherenceSyncManager();
}

export function triggerNetworkSync(
  nodes: Array<NetworkNode>,
  syncManager: CoherenceSyncManager
): boolean {
  // Initiate sync round
  const messages = syncManager.initiateSyncRound(nodes);
  
  // Process coherence measurements
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const neighbors = new Array<NetworkNode>();
    
    // Get entangled neighbors
    for (let j = 0; j < nodes.length; j++) {
      if (i != j && node.entanglementMap.has(nodes[j].id)) {
        neighbors.push(nodes[j]);
      }
    }
    
    const coherenceMap = syncManager.processCoherenceMeasurements(node, neighbors);
    
    // Store coherence in message
    const msg = messages.get(node.id);
    if (msg) {
      const nodeIds = coherenceMap.keys();
      for (let k = 0; k < nodeIds.length; k++) {
        const nodeId = nodeIds[k];
        const coherence = coherenceMap.get(nodeId);
        msg.addCoherence(nodeId, coherence);
      }
    }
  }
  
  // Calculate and apply phase adjustments
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const neighborPhases = new Map<NodeID, PhaseVector>();
    
    // Collect neighbor phase vectors
    const nodeIds = messages.keys();
    for (let j = 0; j < nodeIds.length; j++) {
      const nodeId = nodeIds[j];
      if (nodeId != node.id && node.entanglementMap.has(nodeId)) {
        const msg = messages.get(nodeId);
        if (msg && msg.phaseVector) {
          neighborPhases.set(nodeId, msg.phaseVector);
        }
      }
    }
    
    // Get coherence map from node's message
    const nodeMsg = messages.get(node.id);
    if (nodeMsg) {
      const adjustedPhases = syncManager.calculatePhaseAdjustments(
        node,
        neighborPhases,
        nodeMsg.coherenceMap
      );
      
      if (adjustedPhases) {
        syncManager.synchronizer.applyPhaseAdjustment(node, adjustedPhases);
      }
    }
  }
  
  return true;
}