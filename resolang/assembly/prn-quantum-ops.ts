import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";
/**
 * Quantum Operations for Prime Resonance Network
 * Implements quantum-inspired operations on network nodes
 */

import { NetworkNode, Prime, Phase, Amplitude } from '../../resonnet/assembly/prn-node';
import { ResonantFragment } from "resolang";
import { PrimeState } from "resolang";
import { superpose, measure, collapse } from "resolang";
import { teleport } from "resolang";

// Quantum operation types
export enum QuantumOp {
  SUPERPOSE = 0,
  MEASURE = 1,
  COLLAPSE = 2,
  TELEPORT = 3,
  ENTANGLE = 4,
  PHASE_SHIFT = 5
}

// Result of a quantum operation
export class QuantumResult implements Serializable {
  success: boolean;
  operation: QuantumOp;
  nodeId: string;
  data: Map<string, f64>;
  
  constructor(success: boolean, op: QuantumOp, nodeId: string) {
    this.success = success;
    this.operation = op;
    this.nodeId = nodeId;
    this.data = new Map<string, f64>();
  }
  
  addData(key: string, value: f64): void {
    this.data.set(key, value);
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject()
      .addBooleanField("success", this.success)
      .addNumberField("operation", this.operation)
      .addStringField("nodeId", this.nodeId);
    
    // Build data object JSON
    let dataJson = "{";
    let first = true;
    const keys = this.data.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = this.data.get(key);
      if (!first) dataJson += ",";
      dataJson += `"${key}":${value}`;
      first = false;
    }
    dataJson += "}";
    
    builder.addRawField("data", dataJson)
      .endObject();
    
    return builder.build();
  }
  
  toString(): string {
    return this.toJSON();
  }
}

// Quantum operation executor
export class QuantumExecutor {
  node: NetworkNode;
  
  constructor(node: NetworkNode) {
    this.node = node;
  }
  
  // Execute a superposition operation
  executeSuperpose(primes: Array<Prime>, amplitudes: Array<Amplitude>): QuantumResult {
    const result = new QuantumResult(true, QuantumOp.SUPERPOSE, this.node.id);
    
    // Create prime states for superposition
    const states = new Array<PrimeState>();
    for (let i = 0; i < primes.length; i++) {
      const state = new PrimeState();
      state.amplitudes.set(primes[i], amplitudes[i]);
      states.push(state);
    }
    
    // Perform superposition
    const superposed = superpose(states);
    
    // Update node's quantum state
    const primeKeys = superposed.amplitudes.keys();
    for (let i = 0; i < primeKeys.length; i++) {
      const prime = primeKeys[i];
      const amplitude = superposed.amplitudes.get(prime);
      result.addData(prime.toString(), amplitude);
    }
    
    // Store the superposed state in the node
    this.node.quantumState = superposed;
    result.success = true;
    
    return result;
  }
  
  // Execute a measurement operation
  executeMeasure(): QuantumResult {
    const result = new QuantumResult(true, QuantumOp.MEASURE, this.node.id);
    
    if (!this.node.quantumState) {
      result.success = false;
      return result;
    }
    
    // Measure the quantum state - we know it's not null from the check above
    const quantumState = this.node.quantumState!;
    const measuredPrime = measure(quantumState);
    result.addData("measuredPrime", f64(measuredPrime));
    
    // Collapse the state
    const collapsed = collapse(quantumState, measuredPrime);
    this.node.quantumState = collapsed;
    
    // Add collapsed state info
    const amplitude = collapsed.amplitudes.get(measuredPrime);
    result.addData("collapsedAmplitude", amplitude);
    
    return result;
  }
  
  // Execute a teleportation operation
  executeTeleport(fragment: ResonantFragment, targetNodeId: string): QuantumResult {
    const result = new QuantumResult(true, QuantumOp.TELEPORT, this.node.id);
    
    // Check if target is entangled
    const entanglementStrength = this.node.entanglementMap.get(targetNodeId);
    if (!entanglementStrength || entanglementStrength < 0.5) {
      result.success = false;
      result.addData("reason", 0.0); // Not entangled
      return result;
    }
    
    // Perform teleportation
    const success = this.node.teleportMemory(fragment, targetNodeId);
    result.success = success;
    result.addData("entanglementStrength", entanglementStrength);
    
    return result;
  }
  
  // Execute a phase shift operation
  executePhaseShift(phaseShift: Phase): QuantumResult {
    const result = new QuantumResult(true, QuantumOp.PHASE_SHIFT, this.node.id);
    
    // Apply phase shift to all phases in the ring
    const phases = this.node.entangledNode.phaseRing;
    for (let i = 0; i < phases.length; i++) {
      phases[i] = (phases[i] + phaseShift) % (2.0 * Math.PI);
      result.addData(`phase_${i}`, phases[i]);
    }
    
    // Update the node's phase ring directly
    this.node.entangledNode.phaseRing = phases;
    
    return result;
  }
}

// Export functions for WASM
export function createQuantumExecutor(node: NetworkNode): QuantumExecutor {
  return new QuantumExecutor(node);
}

export function executeQuantumOp(
  executor: QuantumExecutor,
  operation: QuantumOp,
  params: string
): string {
  console.log(`Executing quantum operation ${operation} with params: ${params}`);
  
  let result: QuantumResult;
  
  switch (operation) {
    case QuantumOp.SUPERPOSE: {
      // Parse params for primes and amplitudes
      // Simplified parsing - in production use proper JSON parser
      const primes: Array<Prime> = [2, 3, 5]; // Example
      const amplitudes: Array<Amplitude> = [0.5, 0.3, 0.2];
      result = executor.executeSuperpose(primes, amplitudes);
      break;
    }
    
    case QuantumOp.MEASURE: {
      result = executor.executeMeasure();
      break;
    }
    
    case QuantumOp.PHASE_SHIFT: {
      // Parse phase shift from params
      const phaseShift: Phase = Math.PI / 4; // Example: 45 degrees
      result = executor.executePhaseShift(phaseShift);
      break;
    }
    
    default:
      result = new QuantumResult(false, operation, executor.node.id);
      break;
  }
  
  return result.toString();
}

// Batch quantum operations
export function executeBatchOps(
  executor: QuantumExecutor,
  operations: Array<QuantumOp>,
  paramsList: Array<string>
): string {
  const results = new Array<QuantumResult>();
  
  for (let i = 0; i < operations.length; i++) {
    const resultStr = executeQuantumOp(executor, operations[i], paramsList[i]);
    // Store results for batch response
  }
  
  return `{"batchSize":${operations.length},"completed":${results.length}}`;
}