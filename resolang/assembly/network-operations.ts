// network-operations.ts
// Network operations for quantum holographic memory system
// Implements core network functionality using Resolang primitives

import {
  ResonantFragment,
  EntangledNode,
  Attractor,
  setCurrentNode,
  currentNode,
  PI,
  Prime
} from "resolang";

import {
  tensor,
  collapse,
  rotatePhase,
  linkEntanglement,
  route,
  coherence,
  entropy
} from "resolang";

import { stabilize, teleport, observe } from "resolang";
import { entropyRate, align, toFixed } from "resolang";

// Extended EntangledNode with additional properties for network operations
export class NetworkNode extends EntangledNode {
  entangled: Array<NetworkNode>;
  identity: NodeIdentity;
  
  constructor(id: string, p1: Prime, p2: Prime, p3: Prime) {
    super(id, p1, p2, p3);
    this.entangled = new Array<NetworkNode>();
    this.identity = new NodeIdentity(p1, p2, p3);
  }
  
  static fromEntangledNode(node: EntangledNode): NetworkNode {
    const netNode = new NetworkNode(node.id, node.pri[0], node.pri[1], node.pri[2]);
    netNode.phaseRing = node.phaseRing;
    netNode.coherence = node.coherence;
    return netNode;
  }
}

// Node identity for network operations
export class NodeIdentity {
  primes: Array<Prime>;
  eigenPhase: f64;
  
  constructor(p1: Prime, p2: Prime, p3: Prime) {
    this.primes = new Array<Prime>();
    this.primes.push(p1);
    this.primes.push(p2);
    this.primes.push(p3);
    // Calculate eigenphase from primes
    this.eigenPhase = (f64(p1) + f64(p2) + f64(p3)) * PI / 1000.0;
  }
}

// Helper function to calculate resonance for a fragment
function calculateResonance(fragment: ResonantFragment): f64 {
  let resonance = 0.0;
  const keys = fragment.coeffs.keys();
  for (let i = 0; i < keys.length; i++) {
    const amplitude = fragment.coeffs.get(keys[i]);
    resonance += amplitude * Math.sin(f64(keys[i]) * PI / 100.0);
  }
  return resonance / f64(keys.length);
}

// Network operation results
export class NetworkResult {
  success: bool;
  data: ResonantFragment | null;
  metadata: Map<string, f64>;
  
  constructor(success: bool, data: ResonantFragment | null = null) {
    this.success = success;
    this.data = data;
    this.metadata = new Map<string, f64>();
  }
  
  addMetadata(key: string, value: f64): void {
    this.metadata.set(key, value);
  }
}

// Memory encoding operations
export class MemoryEncoder {
  /**
   * Encode memory content into a holographic fragment
   * @param content The content to encode
   * @param nodeIdentity The node performing the encoding
   * @returns NetworkResult with encoded fragment
   */
  static encodeMemory(content: string, nodeIdentity: NetworkNode): NetworkResult {
    // Create base fragment from content
    const fragment = ResonantFragment.encode(content);
    
    // Apply node's prime signature
    const primes = nodeIdentity.identity.primes;
    let resonantFragment = fragment;
    
    // Tensor with each prime for holographic encoding
    for (let i = 0; i < primes.length; i++) {
      // Create a fragment with prime coefficient
      const coeffs = new Map<Prime, f64>();
      coeffs.set(primes[i], f64(primes[i]) / 1000.0);
      const primeFragment = new ResonantFragment(coeffs, 0.0, 0.0, f64(primes[i]) / 1000.0);
      resonantFragment = tensor(resonantFragment, primeFragment);
    }
    
    // Apply phase modulation based on node's eigenphase
    const eigenPhase = nodeIdentity.identity.eigenPhase;
    // Since rotatePhase works on nodes, we'll simulate the effect on the fragment
    resonantFragment.entropy *= Math.cos(eigenPhase);
    
    const resonance = calculateResonance(resonantFragment);
    
    const result = new NetworkResult(true, resonantFragment);
    result.addMetadata("entropy", resonantFragment.entropy);
    result.addMetadata("resonance", resonance);
    result.addMetadata("checksum", resonance); // Use resonance as checksum
    
    return result;
  }
  
  /**
   * Verify memory integrity
   * @param fragment The fragment to verify
   * @param checksum The expected checksum
   * @returns true if memory is intact
   */
  static verifyMemory(fragment: ResonantFragment, checksum: f64): bool {
    const resonance = calculateResonance(fragment);
    return Math.abs(resonance - checksum) < 0.001; // Allow small floating point differences
  }
}

// Entanglement management
export class EntanglementManager {
  /**
   * Create quantum entanglement between two nodes
   * @param node1 First node
   * @param node2 Second node
   * @returns NetworkResult with entanglement data
   */
  static entangle(node1: NetworkNode, node2: NetworkNode): NetworkResult {
    // Calculate phase alignment
    const phase1 = node1.identity.eigenPhase;
    const phase2 = node2.identity.eigenPhase;
    
    // Rotate phases for alignment
    rotatePhase(node1, phase2 - phase1);
    
    // Create entanglement if coherence is sufficient
    const avgCoherence = (node1.coherence + node2.coherence) / 2.0;
    if (avgCoherence > 0.7) {
      linkEntanglement(node1, node2);
      
      // Add to entangled arrays
      node1.entangled.push(node2);
      node2.entangled.push(node1);
      
      const result = new NetworkResult(true);
      result.addMetadata("strength", avgCoherence);
      result.addMetadata("sharedPhase", (phase1 + phase2) / 2.0);
      result.addMetadata("correlation", avgCoherence * 0.95); // Correlation factor
      
      return result;
    }
    
    return new NetworkResult(false);
  }
  
  /**
   * Check entanglement health
   * @param node1 First entangled node
   * @param node2 Second entangled node
   * @returns Health status
   */
  static checkEntanglementHealth(node1: NetworkNode, node2: NetworkNode): NetworkResult {
    // Check if nodes are actually entangled
    let isEntangled = false;
    for (let i = 0; i < node1.entangled.length; i++) {
      if (node1.entangled[i].id == node2.id) {
        isEntangled = true;
        break;
      }
    }
    
    if (!isEntangled) {
      return new NetworkResult(false);
    }
    
    // Calculate entanglement strength
    const coherenceDiff = Math.abs(node1.coherence - node2.coherence);
    const strength = (node1.coherence + node2.coherence) / 2.0 - coherenceDiff;
    
    const result = new NetworkResult(strength > 0.3);
    result.addMetadata("strength", strength);
    result.addMetadata("coherenceDiff", coherenceDiff);
    
    return result;
  }
}

// Quantum teleportation
export class QuantumTeleportation {
  /**
   * Teleport memory between entangled nodes
   * @param memory The memory fragment to teleport
   * @param sourceNode The source node
   * @param targetNode The target node
   * @returns NetworkResult with teleportation data
   */
  static teleportMemory(
    memory: ResonantFragment,
    sourceNode: NetworkNode,
    targetNode: NetworkNode
  ): NetworkResult {
    // Check entanglement
    const entanglementCheck = EntanglementManager.checkEntanglementHealth(sourceNode, targetNode);
    if (!entanglementCheck.success) {
      return new NetworkResult(false);
    }
    
    const entanglementStrength = entanglementCheck.metadata.get("strength") || 0.0;
    
    // Prepare quantum state by tensoring with source phase
    const sourceCoeffs = new Map<Prime, f64>();
    sourceCoeffs.set(2, sourceNode.identity.eigenPhase);
    const sourcePhaseFragment = new ResonantFragment(sourceCoeffs, 0.0, 0.0, sourceNode.identity.eigenPhase);
    const quantumState = tensor(memory, sourcePhaseFragment);
    
    // Apply collapse based on shared entanglement
    const collapsed = collapse(quantumState);
    
    // Reconstruct at target using target's phase
    const targetCoeffs = new Map<Prime, f64>();
    targetCoeffs.set(3, targetNode.identity.eigenPhase);
    const targetPhaseFragment = new ResonantFragment(targetCoeffs, 0.0, 0.0, targetNode.identity.eigenPhase);
    const reconstructed = tensor(collapsed, targetPhaseFragment);
    
    // Calculate fidelity
    const fidelity = targetNode.coherence * entanglementStrength;
    
    const result = new NetworkResult(fidelity > 0.8, reconstructed);
    result.addMetadata("fidelity", fidelity);
    result.addMetadata("entanglementStrength", entanglementStrength);
    
    return result;
  }
}

// Network consensus
export class QuantumConsensus {
  /**
   * Achieve consensus through quantum resonance
   * @param nodes Array of nodes participating in consensus
   * @param proposal The proposal fragment
   * @returns NetworkResult with consensus decision
   */
  static achieveConsensus(nodes: NetworkNode[], proposal: ResonantFragment): NetworkResult {
    if (nodes.length == 0) {
      return new NetworkResult(false);
    }
    
    // Create resonance field by accumulating votes
    const emptyCoeffs = new Map<Prime, f64>();
    let resonanceField = new ResonantFragment(emptyCoeffs, 0.0, 0.0, 0.0);
    
    let totalCoherence: f64 = 0.0;
    let participants: i32 = 0;
    
    // Each node contributes to the field
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Node evaluates proposal (simplified: based on coherence with proposal)
      const nodeCoeffs = new Map<Prime, f64>();
      // Add node's primes to coefficients
      for (let j = 0; j < node.identity.primes.length; j++) {
        nodeCoeffs.set(node.identity.primes[j], node.coherence);
      }
      const nodeFragment = new ResonantFragment(nodeCoeffs, 0.0, 0.0, node.coherence);
      
      const vote = tensor(proposal, nodeFragment);
      
      // Add to resonance field
      resonanceField = tensor(resonanceField, vote);
      totalCoherence += node.coherence;
      participants++;
    }
    
    // Collapse to consensus state
    const consensus = collapse(resonanceField);
    
    // Determine decision based on collapsed state
    const avgCoherence = totalCoherence / f64(participants);
    const consensusResonance = calculateResonance(consensus);
    const decision = consensusResonance > 0.5;
    
    const result = new NetworkResult(decision, consensus);
    result.addMetadata("confidence", avgCoherence);
    result.addMetadata("participants", f64(participants));
    result.addMetadata("resonance", consensusResonance);
    
    return result;
  }
}

// Anomaly detection
export class AnomalyDetector {
  /**
   * Detect anomalies in the quantum field
   * @param nodes Current network nodes
   * @param baselineEntropy Expected baseline entropy
   * @returns NetworkResult with detected anomalies
   */
  static detectAnomalies(nodes: EntangledNode[], baselineEntropy: f64): NetworkResult {
    const anomalyThreshold = 0.3; // Entropy deviation threshold
    let anomalyCount = 0;
    let totalDeviation = 0.0;
    
    const result = new NetworkResult(true);
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Calculate node's current entropy
      const nodeEntropy = entropyRate(node.phaseRing);
      const deviation = Math.abs(nodeEntropy - baselineEntropy);
      
      if (deviation > anomalyThreshold) {
        anomalyCount++;
        totalDeviation += deviation;
        
        // Store anomaly data
        result.addMetadata(`anomaly_${node.id}_deviation`, deviation);
        result.addMetadata(`anomaly_${node.id}_entropy`, nodeEntropy);
      }
    }
    
    result.success = anomalyCount == 0;
    result.addMetadata("anomalyCount", f64(anomalyCount));
    result.addMetadata("avgDeviation", anomalyCount > 0 ? totalDeviation / f64(anomalyCount) : 0.0);
    
    return result;
  }
}

// Self-healing operations
export class SelfHealing {
  /**
   * Attempt to heal network disruptions
   * @param affectedNodes Nodes affected by disruption
   * @param healthyNodes Nearby healthy nodes
   * @returns NetworkResult with healing status
   */
  static healNetwork(affectedNodes: NetworkNode[], healthyNodes: NetworkNode[]): NetworkResult {
    if (healthyNodes.length == 0) {
      return new NetworkResult(false);
    }
    
    let healedCount = 0;
    
    // Use healthy nodes to stabilize affected ones
    for (let i = 0; i < affectedNodes.length; i++) {
      const affected = affectedNodes[i];
      
      // Find best healthy node to help (highest coherence)
      let bestHealthy: NetworkNode | null = null;
      let bestCoherence = 0.0;
      
      for (let j = 0; j < healthyNodes.length; j++) {
        if (healthyNodes[j].coherence > bestCoherence) {
          bestHealthy = healthyNodes[j];
          bestCoherence = healthyNodes[j].coherence;
        }
      }
      
      if (bestHealthy != null) {
        // Attempt to stabilize and re-entangle
        const wasStabilized = stabilize(affected);
        
        if (wasStabilized) {
          // Re-establish entanglement
          const entangleResult = EntanglementManager.entangle(affected, bestHealthy!);
          if (entangleResult.success) {
            healedCount++;
          }
        }
      }
    }
    
    const result = new NetworkResult(healedCount > 0);
    result.addMetadata("healedCount", f64(healedCount));
    result.addMetadata("healingRate", f64(healedCount) / f64(affectedNodes.length));
    
    return result;
  }
}

// Export main network operation functions for easy access
export function encodeNetworkMemory(content: string, node: NetworkNode): NetworkResult {
  return MemoryEncoder.encodeMemory(content, node);
}

export function createEntanglement(node1: NetworkNode, node2: NetworkNode): NetworkResult {
  return EntanglementManager.entangle(node1, node2);
}

export function teleportNetworkMemory(
  memory: ResonantFragment,
  source: NetworkNode,
  target: NetworkNode
): NetworkResult {
  return QuantumTeleportation.teleportMemory(memory, source, target);
}

export function networkConsensus(nodes: NetworkNode[], proposal: ResonantFragment): NetworkResult {
  return QuantumConsensus.achieveConsensus(nodes, proposal);
}

export function detectNetworkAnomalies(nodes: NetworkNode[], baseline: f64): NetworkResult {
  return AnomalyDetector.detectAnomalies(nodes, baseline);
}

export function healNetworkDisruption(
  affected: NetworkNode[],
  healthy: NetworkNode[]
): NetworkResult {
  return SelfHealing.healNetwork(affected, healthy);
}