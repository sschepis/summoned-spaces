// Holographic State Protocol (HSP) Implementation
// Encodes quantum computational states as prime-coefficient representations

import { Prime, Phase, Amplitude } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";
import { ResonantFragment } from "resolang";
import { Serializable, StateProtocolMessage } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";

// HSP Message types
export enum HSPMessageType {
  STATE_ANNOUNCE = 0,
  STATE_REQUEST = 1,
  STATE_FRAGMENT = 2
}

// State fragment for holographic encoding
export class StateFragment implements Serializable {
  prime: Prime;
  amplitude: Amplitude;
  phase: Phase;
  coherence: f64;
  
  constructor(prime: Prime, amplitude: Amplitude, phase: Phase, coherence: f64) {
    this.prime = prime;
    this.amplitude = amplitude;
    this.phase = phase;
    this.coherence = coherence;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addNumberField("prime", this.prime)
      .addNumberField("amplitude", this.amplitude)
      .addNumberField("phase", this.phase)
      .addNumberField("coherence", this.coherence)
      .endObject()
      .build();
  }
  
  // Serialize to JSON string
  toString(): string {
    return this.toJSON();
  }
}

// HSP Protocol Message
export class HSPMessage extends StateProtocolMessage {
  fragments: Array<StateFragment>;
  signature: string;
  
  constructor(
    type: HSPMessageType,
    nodeId: string,
    stateHash: string,
    fragments: Array<StateFragment> = new Array<StateFragment>()
  ) {
    super(type, nodeId, stateHash);
    this.fragments = fragments;
    this.signature = "";
  }
  
  getType(): string {
    switch (this.messageType) {
      case HSPMessageType.STATE_ANNOUNCE: return "STATE_ANNOUNCE";
      case HSPMessageType.STATE_REQUEST: return "STATE_REQUEST";
      case HSPMessageType.STATE_FRAGMENT: return "STATE_FRAGMENT";
      default: return "UNKNOWN";
    }
  }
  
  // Add a fragment to the message
  addFragment(fragment: StateFragment): void {
    this.fragments.push(fragment);
  }
  
  validate(): boolean {
    return super.validate() && this.fragments.length > 0;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    
    // Build fragments array JSON
    let fragmentsJson = "[";
    for (let i = 0; i < this.fragments.length; i++) {
      if (i > 0) fragmentsJson += ",";
      fragmentsJson += this.fragments[i].toJSON();
    }
    fragmentsJson += "]";
    
    builder.startObject()
      .addNumberField("type", this.messageType)
      .addStringField("nodeId", this.nodeId)
      .addStringField("stateHash", this.stateHash)
      .addRawField("fragments", fragmentsJson)
      .addNumberField("timestamp", this.timestamp)
      .addStringField("signature", this.signature)
      .endObject();
    
    return builder.build();
  }
  
  toString(): string {
    return this.toJSON();
  }
  
  // Serialize message to JSON
  serialize(): string {
    return this.toJSON();
  }
}

// Holographic State Encoder
export class HolographicStateEncoder {
  redundancyFactor: f64;
  coherenceThreshold: f64;
  
  constructor(redundancy: f64 = 3.0, coherenceThreshold: f64 = 0.85) {
    this.redundancyFactor = redundancy;
    this.coherenceThreshold = coherenceThreshold;
  }
  
  // Encode a quantum state into holographic fragments
  encode(state: PrimeState): Array<StateFragment> {
    const fragments = new Array<StateFragment>();
    const primes = state.amplitudes.keys();
    
    // Calculate total coherence for normalization
    let totalCoherence: f64 = 0.0;
    for (let i = 0; i < primes.length; i++) {
      const amplitude = state.amplitudes.get(primes[i]);
      totalCoherence += amplitude * amplitude;
    }
    
    // Create fragments with redundancy
    for (let i = 0; i < primes.length; i++) {
      const prime = primes[i];
      const amplitude = state.amplitudes.get(prime);
      
      // Calculate phase from prime properties
      const phase = this.calculatePhase(prime, i, primes.length);
      
      // Calculate fragment coherence
      const coherence = (amplitude * amplitude) / totalCoherence;
      
      // Create primary fragment
      fragments.push(new StateFragment(prime, amplitude, phase, coherence));
      
      // Add redundant fragments with phase shifts
      const redundantCount = i32(this.redundancyFactor);
      for (let r = 1; r < redundantCount; r++) {
        const phaseShift = (2.0 * Math.PI * f64(r)) / f64(redundantCount);
        const redundantPhase = (phase + phaseShift) % (2.0 * Math.PI);
        fragments.push(new StateFragment(
          prime,
          amplitude,
          redundantPhase,
          coherence * 0.9  // Slightly lower coherence for redundant fragments
        ));
      }
    }
    
    return fragments;
  }
  
  // Decode holographic fragments back to quantum state
  decode(fragments: Array<StateFragment>): PrimeState | null {
    if (fragments.length == 0) return null;
    
    // Group fragments by prime
    const primeGroups = new Map<Prime, Array<StateFragment>>();
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      if (!primeGroups.has(fragment.prime)) {
        primeGroups.set(fragment.prime, new Array<StateFragment>());
      }
      primeGroups.get(fragment.prime).push(fragment);
    }
    
    // Check if we have enough fragments for reconstruction
    const minFragments = Math.sqrt(f64(primeGroups.size));
    if (f64(fragments.length) < minFragments) {
      return null;
    }
    
    // Reconstruct state from fragments
    const amplitudes = new Map<Prime, Amplitude>();
    const primes = primeGroups.keys();
    
    for (let i = 0; i < primes.length; i++) {
      const prime = primes[i];
      const group = primeGroups.get(prime);
      
      // Average amplitude and coherence from redundant fragments
      let avgAmplitude: f64 = 0.0;
      let avgCoherence: f64 = 0.0;
      
      for (let j = 0; j < group.length; j++) {
        avgAmplitude += group[j].amplitude;
        avgCoherence += group[j].coherence;
      }
      
      avgAmplitude /= f64(group.length);
      avgCoherence /= f64(group.length);
      
      // Only include if coherence is above threshold
      if (avgCoherence >= this.coherenceThreshold) {
        amplitudes.set(prime, avgAmplitude);
      }
    }
    
    return new PrimeState(amplitudes);
  }
  
  // Calculate phase based on prime properties
  private calculatePhase(prime: Prime, index: i32, total: i32): Phase {
    // Use golden ratio and prime properties for phase distribution
    const phi = 1.618033988749895;
    const basePhase = (f64(prime) * phi) % (2.0 * Math.PI);
    const indexPhase = (2.0 * Math.PI * f64(index)) / f64(total);
    return (basePhase + indexPhase) % (2.0 * Math.PI);
  }
  
  // Calculate state hash using prime-based hashing
  calculateStateHash(state: PrimeState): string {
    let hash: u64 = 0;
    const primes = state.amplitudes.keys();
    
    for (let i = 0; i < primes.length; i++) {
      const prime = primes[i];
      const amplitude = state.amplitudes.get(prime);
      
      // Combine prime and amplitude into hash
      const ampInt = u64(amplitude * 1000000);  // Convert to integer representation
      hash = hash * 31 + u64(prime);
      hash = hash * 31 + ampInt;
      hash = hash % 0xFFFFFFFFFFFFFFFF;  // Keep within u64 bounds
    }
    
    return hash.toString();
  }
}

// Fragment distribution strategy
export class FragmentDistributor {
  // Distribute fragments across network based on entanglement topology
  distributeFragments(
    fragments: Array<StateFragment>,
    entanglementMap: Map<string, f64>
  ): Map<string, Array<StateFragment>> {
    const distribution = new Map<string, Array<StateFragment>>();
    const nodeIds = entanglementMap.keys();
    
    if (nodeIds.length == 0) return distribution;
    
    // Sort nodes by entanglement strength
    const sortedNodes = new Array<string>();
    const strengths = new Array<f64>();
    
    for (let i = 0; i < nodeIds.length; i++) {
      sortedNodes.push(nodeIds[i]);
      strengths.push(entanglementMap.get(nodeIds[i]));
    }
    
    // Simple bubble sort by strength
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      for (let j = 0; j < sortedNodes.length - i - 1; j++) {
        if (strengths[j] < strengths[j + 1]) {
          // Swap
          const tempNode = sortedNodes[j];
          sortedNodes[j] = sortedNodes[j + 1];
          sortedNodes[j + 1] = tempNode;
          
          const tempStrength = strengths[j];
          strengths[j] = strengths[j + 1];
          strengths[j + 1] = tempStrength;
        }
      }
    }
    
    // Distribute fragments weighted by entanglement strength
    let totalStrength: f64 = 0.0;
    for (let i = 0; i < strengths.length; i++) {
      totalStrength += strengths[i];
    }
    
    let fragmentIndex = 0;
    for (let i = 0; i < sortedNodes.length && fragmentIndex < fragments.length; i++) {
      const nodeId = sortedNodes[i];
      const strength = strengths[i];
      
      // Calculate how many fragments this node should get
      const fragmentShare = Math.ceil(
        f64(fragments.length) * (strength / totalStrength)
      );
      
      const nodeFragments = new Array<StateFragment>();
      for (let j = 0; j < fragmentShare && fragmentIndex < fragments.length; j++) {
        nodeFragments.push(fragments[fragmentIndex++]);
      }
      
      if (nodeFragments.length > 0) {
        distribution.set(nodeId, nodeFragments);
      }
    }
    
    // Distribute any remaining fragments to strongest nodes
    let nodeIndex = 0;
    while (fragmentIndex < fragments.length) {
      const nodeId = sortedNodes[nodeIndex % sortedNodes.length];
      if (!distribution.has(nodeId)) {
        distribution.set(nodeId, new Array<StateFragment>());
      }
      distribution.get(nodeId).push(fragments[fragmentIndex++]);
      nodeIndex++;
    }
    
    return distribution;
  }
}

// Export convenience functions
export function encodeState(state: PrimeState): Array<StateFragment> {
  const encoder = new HolographicStateEncoder();
  return encoder.encode(state);
}

export function decodeFragments(fragments: Array<StateFragment>): PrimeState | null {
  const encoder = new HolographicStateEncoder();
  return encoder.decode(fragments);
}

export function calculateStateHash(state: PrimeState): string {
  const encoder = new HolographicStateEncoder();
  return encoder.calculateStateHash(state);
}