// prn-node.ts - Prime Resonance Network Node Implementation
import { EntangledNode, linkEntanglement, PhaseLockRing, PrimeState, ResonantFragment, stabilize } from ".";
import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";
import { EntropyEvolution } from "./quantum/entropy-evolution";

// Type definitions for network-specific structures
export type NodeID = string;
export type Prime = u32;
export type Phase = f64;
export type Amplitude = f64;
export type EntanglementStrength = f64;

export class PrimeResonanceIdentity implements Serializable {
  gaussianPrime: Prime;
  eisensteinPrime: Prime;
  quaternionicPrime: Prime;

  constructor(p_g: Prime, p_e: Prime, p_q: Prime) {
    this.gaussianPrime = p_g;
    this.eisensteinPrime = p_e;
    this.quaternionicPrime = p_q;
  }

  toJSON(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addNumberField("gaussianPrime", this.gaussianPrime)
      .addNumberField("eisensteinPrime", this.eisensteinPrime)
      .addNumberField("quaternionicPrime", this.quaternionicPrime)
      .endObject()
      .build();
  }

  toString(): string {
    return this.toJSON();
  }
}

export class NetworkNode {
  id: NodeID;
  pri: PrimeResonanceIdentity;
  entangledNode: EntangledNode;
  holographicField: Array<ResonantFragment>;
  entanglementMap: Map<NodeID, EntanglementStrength>;
  phaseRing: PhaseLockRing;
  entropyEvolution: EntropyEvolution;
  isActive: boolean;
  quantumState: PrimeState | null;
  lastSyncTime: f64;

  constructor(id: NodeID, p1: Prime, p2: Prime, p3: Prime) {
    this.id = id;
    this.pri = new PrimeResonanceIdentity(p1, p2, p3);
    
    // Initialize all properties before any other use of 'this'
    this.holographicField = new Array<ResonantFragment>();
    this.entanglementMap = new Map<NodeID, EntanglementStrength>();
    
    // Initialize phase lock ring with the three primes
    const primes = new Array<Prime>();
    primes.push(p1);
    primes.push(p2);
    primes.push(p3);
    this.phaseRing = new PhaseLockRing(primes, "golden");
    
    // Initialize entropy evolution
    this.entropyEvolution = new EntropyEvolution(1.0, 0.03);
    
    this.isActive = true;
    this.lastSyncTime = 0.0;
    this.quantumState = null;
    
    // Now we can use other methods and properties
    this.entangledNode = EntangledNode.generateNode(p1, p2, p3);
    this.entangledNode.id = id;
  }

  // Add a memory fragment to the holographic field
  addMemoryFragment(fragment: ResonantFragment): void {
    this.holographicField.push(fragment);
    
    // Update node entropy based on fragment
    const fragmentEntropy = fragment.entropy;
    this.entropyEvolution.S0 = (this.entropyEvolution.S0 + fragmentEntropy) / 2.0;
  }

  // Establish entanglement with another node
  entangleWith(other: NetworkNode, strength: EntanglementStrength): boolean {
    if (strength < 0.0 || strength > 1.0) {
      return false;
    }

    // Check coherence requirement
    const coherence = this.computeCoherence(other);
    if (coherence < 0.85) {
      return false;
    }

    // Create bidirectional entanglement
    this.entanglementMap.set(other.id, strength);
    other.entanglementMap.set(this.id, strength);

    // Link the underlying entangled nodes
    linkEntanglement(this.entangledNode, other.entangledNode);

    return true;
  }

  // Compute coherence with another node
  computeCoherence(other: NetworkNode): f64 {
    // Use the coherence operator from prime-resonance
    const n = this.pri.gaussianPrime * other.pri.gaussianPrime;
    const primeState = new PrimeState();
    primeState.amplitudes.set(this.pri.gaussianPrime, 0.5);
    primeState.amplitudes.set(other.pri.gaussianPrime, 0.5);
    primeState.normalize();
    
    return coherenceOperator(primeState, n);
  }

  // Check if this node should collapse
  shouldCollapse(t: f64): boolean {
    // Calculate entropy gradient as -lambda * S(t)
    const currentEntropy = this.entropyEvolution.at(t);
    const entropyGradient = -this.entropyEvolution.lambda * currentEntropy;
    const coherence = this.entangledNode.coherence;
    
    // Collapse if ∇S_symbolic(t) < -λ and C(t) > δ
    return entropyGradient < -this.entropyEvolution.lambda && coherence > 0.9;
  }

  // Perform node stabilization
  stabilizeNode(): boolean {
    return stabilize(this.entangledNode);
  }

  // Teleport a memory fragment to another node
  teleportMemory(fragment: ResonantFragment, targetId: NodeID): boolean {
    const strength = this.entanglementMap.get(targetId);
    if (!strength || strength < 0.5) {
      return false;
    }

    // Find target node (in real implementation, this would be via network lookup)
    // For now, we'll just check if we're entangled
    return this.entanglementMap.has(targetId) as boolean;
  }

  // Update phase synchronization
  updatePhaseSync(t: f64): void {
    // Create new phase array based on time evolution
    const phases = new Array<Phase>();
    
    for (let i = 0; i < this.phaseRing.primes.length; i++) {
      const omega = 2.0 * Math.PI * f64(this.phaseRing.primes[i]) / 100.0;
      const basePhase = this.phaseRing.getPhase(i);
      const evolvedPhase = (basePhase + omega * t) % (2.0 * Math.PI);
      phases.push(evolvedPhase);
    }
    
    // Update the entangled node's phase ring
    this.entangledNode.phaseRing = phases;
    
    this.lastSyncTime = t;
  }

  // Get current entropy
  getCurrentEntropy(t: f64): f64 {
    return this.entropyEvolution.at(t);
  }

  // Export node state as JSON
  exportState(): string {
    let json = "{";
    json += `"id":"${this.id}",`;
    json += `"pri":{"gaussian":${this.pri.gaussianPrime},"eisenstein":${this.pri.eisensteinPrime},"quaternionic":${this.pri.quaternionicPrime}},`;
    json += `"coherence":${this.entangledNode.coherence},`;
    json += `"entropy":${this.getCurrentEntropy(0)},`;
    json += `"entanglements":[`;
    
    let first = true;
    const keys = this.entanglementMap.keys();
    for (let i = 0; i < keys.length; i++) {
      const nodeId = keys[i];
      const strength = this.entanglementMap.get(nodeId);
      if (!first) json += ",";
      json += `{"node":"${nodeId}","strength":${strength}}`;
      first = false;
    }
    
    json += "],";
    json += `"memoryFragments":${this.holographicField.length},`;
    json += `"isActive":${this.isActive}`;
    json += "}";
    
    return json;
  }
}

// Network node factory
export function createNetworkNode(id: string, primes: Array<Prime> | null = null): NetworkNode {
  let p1: Prime, p2: Prime, p3: Prime;
  
  if (primes && primes.length >= 3) {
    p1 = primes[0];
    p2 = primes[1];
    p3 = primes[2];
  } else {
    // Generate default primes if not provided
    p1 = 13;
    p2 = 31;
    p3 = 89;
  }
  
  return new NetworkNode(id, p1, p2, p3);
}

// Export functions for network operations
export function initializeNode(nodeId: string): NetworkNode {
  console.log(`Initializing PRN node: ${nodeId}`);
  return createNetworkNode(nodeId);
}

export function connectNodes(node1: NetworkNode, node2: NetworkNode, strength: f64 = 0.9): boolean {
  console.log(`Connecting nodes: ${node1.id} <-> ${node2.id} with strength ${strength}`);
  return node1.entangleWith(node2, strength);
}

export function broadcastMemory(source: NetworkNode, fragment: ResonantFragment): i32 {
  let successCount = 0;
  const targets = source.entanglementMap.keys();
  
  for (let i = 0; i < targets.length; i++) {
    if (source.teleportMemory(fragment, targets[i])) {
      successCount++;
    }
  }
  
  return successCount;
}

// Message handling exports
export function handleHeartbeat(node: NetworkNode, payload: string): string {
  // Update node's last activity timestamp
  node.isActive = true;
  
  // Return current node status
  const response = `{
    "nodeId":"${node.id}",
    "coherence":${node.entangledNode.coherence},
    "entropy":${node.getCurrentEntropy(0)},
    "entanglements":${node.entanglementMap.size},
    "memoryFragments":${node.holographicField.length}
  }`;
  
  return response;
}

export function handleEntanglementRequest(node: NetworkNode, payload: string): string {
  // Parse request (simplified - in production would use proper JSON parsing)
  const coherenceThreshold = 0.85;
  
  if (node.entangledNode.coherence >= coherenceThreshold) {
    return `{
      "accepted":true,
      "nodeId":"${node.id}",
      "pri":"${node.pri.toString()}",
      "coherence":${node.entangledNode.coherence}
    }`;
  } else {
    return `{
      "accepted":false,
      "reason":"Insufficient coherence",
      "currentCoherence":${node.entangledNode.coherence}
    }`;
  }
}

export function handleMemoryTransfer(node: NetworkNode, payload: string): string {
  // Accept memory fragment if node has capacity
  const maxFragments = 100;
  
  if (node.holographicField.length < maxFragments) {
    // In real implementation, would parse and add the fragment
    return `{
      "accepted":true,
      "nodeId":"${node.id}",
      "currentFragments":${node.holographicField.length}
    }`;
  } else {
    return `{
      "accepted":false,
      "reason":"Memory capacity exceeded"
    }`;
  }
}

export function handlePhaseSync(node: NetworkNode, payload: string): string {
  // Synchronize phases with network
  node.stabilizeNode();
  
  // Return current phase ring
  const phases = node.entangledNode.phaseRing;
  let phaseArray = "[";
  for (let i = 0; i < phases.length; i++) {
    if (i > 0) phaseArray += ",";
    phaseArray += phases[i].toString();
  }
  phaseArray += "]";
  
  return `{
    "nodeId":"${node.id}",
    "phases":${phaseArray},
    "synchronized":true
  }`;
}

export function handleMessage(nodePtr: NetworkNode, messageType: i32, payload: string): string {
  console.log(`Node ${nodePtr.id} handling message type ${messageType}`);
  
  switch (messageType) {
    case 0: // HEARTBEAT
      return handleHeartbeat(nodePtr, payload);
    case 1: // ENTANGLEMENT_REQUEST
      return handleEntanglementRequest(nodePtr, payload);
    case 2: // MEMORY_TRANSFER
      return handleMemoryTransfer(nodePtr, payload);
    case 3: // PHASE_SYNC
      return handlePhaseSync(nodePtr, payload);
    default:
      return '{"error":"Unknown message type"}';
  }
}

// Export function to get node by ID (for message routing)
export function getNodeStatus(node: NetworkNode): string {
  return node.exportState();
}