// PRN Network Manager - Manages multiple nodes in a single WASM instance
import { NetworkNode, createNetworkNode, Prime } from '../../resonnet/assembly/prn-node';
import { ResonantFragment } from "resolang";

// Global node registry
const nodeRegistry = new Map<string, NetworkNode>();

// Initialize a new node
export function createNode(nodeId: string): boolean {
  if (nodeRegistry.has(nodeId)) {
    console.log(`Node ${nodeId} already exists`);
    return false;
  }
  
  const node = createNetworkNode(nodeId);
  nodeRegistry.set(nodeId, node);
  console.log(`Created node: ${nodeId}`);
  return true;
}

// Connect two nodes by their IDs
export function connectNodesByID(nodeId1: string, nodeId2: string, strength: f64 = 0.9): boolean {
  const node1 = nodeRegistry.get(nodeId1);
  const node2 = nodeRegistry.get(nodeId2);
  
  if (!node1 || !node2) {
    console.log(`Cannot connect: one or both nodes not found`);
    return false;
  }
  
  console.log(`Connecting nodes: ${nodeId1} <-> ${nodeId2} with strength ${strength}`);
  return node1.entangleWith(node2, strength);
}

// Get node status
export function getNodeStatus(nodeId: string): string {
  const node = nodeRegistry.get(nodeId);
  if (!node) {
    return '{"error":"Node not found"}';
  }
  
  return node.exportState();
}

// Send heartbeat to a node
export function sendHeartbeat(nodeId: string): boolean {
  const node = nodeRegistry.get(nodeId);
  if (!node) {
    return false;
  }
  
  // Update coherence based on entanglements
  if (node.entanglementMap.size > 0) {
    let totalStrength = 0.0;
    const strengths = node.entanglementMap.values();
    for (let i = 0; i < strengths.length; i++) {
      totalStrength += strengths[i];
    }
    node.entangledNode.coherence = Math.min(0.99, 0.5 + totalStrength / f64(node.entanglementMap.size) * 0.5);
  }
  
  return node.isActive;
}

// Get all node IDs
export function getAllNodeIds(): Array<string> {
  return nodeRegistry.keys();
}

// Get network status
export function getNetworkStatus(): string {
  let json = '{"nodes":[';
  const nodeIds = nodeRegistry.keys();
  let first = true;
  
  for (let i = 0; i < nodeIds.length; i++) {
    if (!first) json += ',';
    const node = nodeRegistry.get(nodeIds[i]);
    if (node) {
      json += node.exportState();
    }
    first = false;
  }
  
  json += ']}';
  return json;
}

// Synchronize phases between two nodes
export function synchronizePhases(nodeId1: string, nodeId2: string): boolean {
  const node1 = nodeRegistry.get(nodeId1);
  const node2 = nodeRegistry.get(nodeId2);
  
  if (!node1 || !node2) {
    return false;
  }
  
  // Average the phase rings
  const phases1 = node1.entangledNode.phaseRing;
  const phases2 = node2.entangledNode.phaseRing;
  
  for (let i = 0; i < phases1.length && i < phases2.length; i++) {
    const avgPhase = (phases1[i] + phases2[i]) / 2.0;
    phases1[i] = avgPhase;
    phases2[i] = avgPhase;
  }
  
  return true;
}

// Broadcast memory fragment from a node
export function broadcastMemory(sourceId: string, fragment: ResonantFragment): i32 {
  const source = nodeRegistry.get(sourceId);
  if (!source) {
    return 0;
  }
  
  let successCount = 0;
  const targets = source.entanglementMap.keys();
  
  for (let i = 0; i < targets.length; i++) {
    if (source.teleportMemory(fragment, targets[i])) {
      successCount++;
    }
  }
  
  return successCount;
}

// Handle incoming message for a node
export function handleNodeMessage(nodeId: string, messageType: string, payload: string): string {
  const node = nodeRegistry.get(nodeId);
  if (!node) {
    return '{"error":"Node not found"}';
  }
  
  // Simple message handling
  if (messageType === "heartbeat") {
    // Update coherence based on entanglements
    if (node.entanglementMap.size > 0) {
      let totalStrength = 0.0;
      const strengths = node.entanglementMap.values();
      for (let i = 0; i < strengths.length; i++) {
        totalStrength += strengths[i];
      }
      node.entangledNode.coherence = Math.min(0.99, 0.5 + totalStrength / f64(node.entanglementMap.size) * 0.5);
    }
    return `{"status":"ok","coherence":${node.entangledNode.coherence}}`;
  } else if (messageType === "status") {
    return node.exportState();
  }
  
  return '{"error":"Unknown message type"}';
}