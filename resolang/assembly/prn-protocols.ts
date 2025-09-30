// prn-protocols.ts - Prime Resonance Network Protocol Implementations

import { NetworkNode, NodeID, Prime, Phase, EntanglementStrength } from "../../resonnet/assembly/prn-node";
import { ResonantFragment, EntangledNode } from "resolang";
import { teleport } from "resolang";
import { route } from "resolang";
import { entropyRate } from "resolang";

// Protocol message types
export enum ProtocolType {
  EIP_REQUEST = 0,
  EIP_RESPONSE = 1,
  MTP_INITIATE = 2,
  MTP_CONFIRM = 3,
  RRP_DISCOVER = 4,
  RRP_ROUTE = 5,
  SYNC_PHASE = 6,
  HEARTBEAT = 7
}

// Base protocol message structure
export class ProtocolMessage {
  type: ProtocolType;
  sourceId: NodeID;
  targetId: NodeID;
  timestamp: f64;
  payload: string;

  constructor(type: ProtocolType, source: NodeID, target: NodeID, payload: string = "") {
    this.type = type;
    this.sourceId = source;
    this.targetId = target;
    this.timestamp = Date.now() as f64;
    this.payload = payload;
  }

  serialize(): string {
    return `{"type":${this.type},"source":"${this.sourceId}","target":"${this.targetId}","timestamp":${this.timestamp},"payload":"${this.payload}"}`;
  }
}

// Entanglement Initialization Protocol (EIP)
export class EntanglementInitProtocol {
  minCoherence: f64;
  maxRetries: i32;

  constructor(minCoherence: f64 = 0.85, maxRetries: i32 = 3) {
    this.minCoherence = minCoherence;
    this.maxRetries = maxRetries;
  }

  // Initiate entanglement between two nodes
  initiateEntanglement(source: NetworkNode, target: NetworkNode): ProtocolMessage | null {
    // Check if nodes are already entangled
    if (source.entanglementMap.has(target.id)) {
      console.log(`Nodes ${source.id} and ${target.id} are already entangled`);
      return null;
    }

    // Compute initial coherence
    const coherence = source.computeCoherence(target);
    if (coherence < this.minCoherence) {
      console.log(`Coherence ${coherence} below minimum ${this.minCoherence}`);
      return null;
    }

    // Create entanglement request
    const payload = `{"coherence":${coherence},"pri":"${source.pri.toString()}"}`;
    return new ProtocolMessage(ProtocolType.EIP_REQUEST, source.id, target.id, payload);
  }

  // Process entanglement request
  processEntanglementRequest(target: NetworkNode, message: ProtocolMessage): ProtocolMessage {
    // Parse request payload (simplified parsing)
    const coherence = 0.9; // In real implementation, parse from payload
    
    // Check target node conditions
    const targetStable = target.stabilizeNode();
    const targetEntropy = target.getCurrentEntropy(0);
    
    if (!targetStable || targetEntropy > 0.5) {
      const rejectPayload = `{"accepted":false,"reason":"Node unstable"}`;
      return new ProtocolMessage(ProtocolType.EIP_RESPONSE, target.id, message.sourceId, rejectPayload);
    }

    // Accept entanglement
    const acceptPayload = `{"accepted":true,"strength":${coherence},"pri":"${target.pri.toString()}"}`;
    return new ProtocolMessage(ProtocolType.EIP_RESPONSE, target.id, message.sourceId, acceptPayload);
  }

  // Complete entanglement based on response
  completeEntanglement(source: NetworkNode, target: NetworkNode, strength: EntanglementStrength): boolean {
    return source.entangleWith(target, strength);
  }
}

// Memory Teleportation Protocol (MTP)
export class MemoryTeleportProtocol {
  minEntanglementStrength: f64;
  maxFragmentSize: i32;

  constructor(minStrength: f64 = 0.5, maxSize: i32 = 1024) {
    this.minEntanglementStrength = minStrength;
    this.maxFragmentSize = maxSize;
  }

  // Initiate memory teleportation
  initiateTeleportation(
    source: NetworkNode, 
    targetId: NodeID, 
    fragment: ResonantFragment
  ): ProtocolMessage | null {
    // Check entanglement strength
    const strength = source.entanglementMap.get(targetId);
    if (!strength || strength < this.minEntanglementStrength) {
      console.log(`Insufficient entanglement strength with ${targetId}`);
      return null;
    }

    // Check fragment size (simplified - count coefficients)
    if (fragment.coeffs.size > this.maxFragmentSize) {
      console.log(`Fragment too large: ${fragment.coeffs.size} > ${this.maxFragmentSize}`);
      return null;
    }

    // Prepare teleportation
    const payload = fragment.toString();
    return new ProtocolMessage(ProtocolType.MTP_INITIATE, source.id, targetId, payload);
  }

  // Process incoming teleportation
  processTeleportation(target: NetworkNode, message: ProtocolMessage): ProtocolMessage {
    // Check if target can accept the memory
    const currentFragments = target.holographicField.length;
    const maxFragments = 100; // Configuration parameter
    
    if (currentFragments >= maxFragments) {
      const rejectPayload = `{"accepted":false,"reason":"Memory full"}`;
      return new ProtocolMessage(ProtocolType.MTP_CONFIRM, target.id, message.sourceId, rejectPayload);
    }

    // Check coherence and entropy
    if (!target.stabilizeNode()) {
      const rejectPayload = `{"accepted":false,"reason":"Node unstable"}`;
      return new ProtocolMessage(ProtocolType.MTP_CONFIRM, target.id, message.sourceId, rejectPayload);
    }

    // Accept teleportation
    const acceptPayload = `{"accepted":true,"fragmentId":"${Date.now()}"}`;
    return new ProtocolMessage(ProtocolType.MTP_CONFIRM, target.id, message.sourceId, acceptPayload);
  }

  // Execute the actual teleportation
  executeTeleportation(
    source: NetworkNode,
    target: NetworkNode,
    fragment: ResonantFragment
  ): boolean {
    // Use the teleport function from functionalBlocks
    const success = teleport(fragment, target.entangledNode);
    
    if (success) {
      target.addMemoryFragment(fragment);
      console.log(`Teleported fragment from ${source.id} to ${target.id}`);
    }
    
    return success;
  }
}

// Resonance Routing Protocol (RRP)
export class ResonanceRoutingProtocol {
  maxHops: i32;
  routingTable: Map<string, Array<NodeID>>; // targetId -> path

  constructor(maxHops: i32 = 5) {
    this.maxHops = maxHops;
    this.routingTable = new Map<string, Array<NodeID>>();
  }

  // Discover route to a target node
  discoverRoute(
    source: NetworkNode,
    targetId: NodeID,
    visitedNodes: Set<NodeID> = new Set<NodeID>()
  ): Array<NodeID> | null {
    // Check if we've reached the target
    if (source.id == targetId) {
      const path = new Array<NodeID>();
      path.push(source.id);
      return path;
    }

    // Check if we've already visited this node or exceeded max hops
    if (visitedNodes.has(source.id) || visitedNodes.size >= this.maxHops) {
      return null;
    }

    // Mark this node as visited
    visitedNodes.add(source.id);

    // Check direct entanglements first
    if (source.entanglementMap.has(targetId)) {
      const path = new Array<NodeID>();
      path.push(source.id);
      path.push(targetId);
      return path;
    }

    // Check cached routes
    const cacheKey = `${source.id}-${targetId}`;
    if (this.routingTable.has(cacheKey)) {
      return this.routingTable.get(cacheKey);
    }

    // Explore neighbors (in real implementation, this would be async)
    const neighbors = source.entanglementMap.keys();
    let bestPath: Array<NodeID> | null = null;
    let bestStrength: f64 = 0;

    for (let i = 0; i < neighbors.length; i++) {
      const neighborId = neighbors[i];
      const strength = source.entanglementMap.get(neighborId);
      
      if (strength && strength > bestStrength) {
        // In real implementation, we'd recursively search through neighbors
        // For now, we'll just consider direct neighbors
        const path = new Array<NodeID>();
        path.push(source.id);
        path.push(neighborId);
        
        if (neighborId == targetId) {
          bestPath = path;
          bestStrength = strength;
        }
      }
    }

    // Cache the route if found
    if (bestPath) {
      this.routingTable.set(cacheKey, bestPath);
    }

    return bestPath;
  }

  // Create routing message
  createRoutingMessage(source: NetworkNode, targetId: NodeID, path: Array<NodeID>): ProtocolMessage {
    let pathStr = "[";
    for (let i = 0; i < path.length; i++) {
      if (i > 0) pathStr += ",";
      pathStr += `"${path[i]}"`;
    }
    pathStr += "]";
    
    const payload = `{"path":${pathStr},"hops":${path.length}}`;
    return new ProtocolMessage(ProtocolType.RRP_ROUTE, source.id, targetId, payload);
  }

  // Route a message through the network
  routeMessage(
    source: NetworkNode,
    targetId: NodeID,
    message: ProtocolMessage
  ): boolean {
    const path = this.discoverRoute(source, targetId);
    
    if (!path || path.length == 0) {
      console.log(`No route found from ${source.id} to ${targetId}`);
      return false;
    }

    console.log(`Routing message from ${source.id} to ${targetId} via ${path.length} hops`);
    
    // In real implementation, this would send the message through the path
    return true;
  }

  // Clear routing cache
  clearCache(): void {
    this.routingTable.clear();
  }
}

// Phase Synchronization Protocol
export class PhaseSyncProtocol {
  syncInterval: f64;
  phaseTolerance: f64;

  constructor(syncInterval: f64 = 1000.0, phaseTolerance: f64 = 0.1) {
    this.syncInterval = syncInterval;
    this.phaseTolerance = phaseTolerance;
  }

  // Create phase sync message
  createSyncMessage(node: NetworkNode): ProtocolMessage {
    const phases = new Array<f64>();
    for (let i = 0; i < node.phaseRing.primes.length; i++) {
      phases.push(node.phaseRing.getPhase(i));
    }
    
    let phaseStr = "[";
    for (let i = 0; i < phases.length; i++) {
      if (i > 0) phaseStr += ",";
      phaseStr += phases[i].toString();
    }
    phaseStr += "]";
    
    const payload = `{"phases":${phaseStr},"timestamp":${node.lastSyncTime}}`;
    return new ProtocolMessage(ProtocolType.SYNC_PHASE, node.id, "broadcast", payload);
  }

  // Check if synchronization is needed
  needsSync(node: NetworkNode, currentTime: f64): boolean {
    return (currentTime - node.lastSyncTime) > this.syncInterval;
  }

  // Synchronize phases between nodes
  synchronizeNodes(node1: NetworkNode, node2: NetworkNode, currentTime: f64): boolean {
    // Check if nodes are entangled
    if (!node1.entanglementMap.has(node2.id)) {
      return false;
    }

    // Update phase synchronization
    node1.updatePhaseSync(currentTime);
    node2.updatePhaseSync(currentTime);

    // Check phase coherence
    const phaseCoherence = node1.phaseRing.isResonantWith(node2.phaseRing);
    
    if (!phaseCoherence) {
      console.log(`Phase decoherence detected between ${node1.id} and ${node2.id}`);
      return false;
    }

    return true;
  }
}

// Main protocol handler
export class ProtocolHandler {
  eip: EntanglementInitProtocol;
  mtp: MemoryTeleportProtocol;
  rrp: ResonanceRoutingProtocol;
  psp: PhaseSyncProtocol;

  constructor() {
    this.eip = new EntanglementInitProtocol();
    this.mtp = new MemoryTeleportProtocol();
    this.rrp = new ResonanceRoutingProtocol();
    this.psp = new PhaseSyncProtocol();
  }

  // Process incoming protocol message
  processMessage(node: NetworkNode, message: ProtocolMessage): ProtocolMessage | null {
    switch (message.type) {
      case ProtocolType.EIP_REQUEST:
        return this.eip.processEntanglementRequest(node, message);
      
      case ProtocolType.MTP_INITIATE:
        return this.mtp.processTeleportation(node, message);
      
      case ProtocolType.SYNC_PHASE:
        // Phase sync is handled differently
        return null;
      
      case ProtocolType.HEARTBEAT:
        // Simple acknowledgment
        return new ProtocolMessage(ProtocolType.HEARTBEAT, node.id, message.sourceId, "ACK");
      
      default:
        console.log(`Unknown protocol type: ${message.type}`);
        return null;
    }
  }

  // Send heartbeat message
  sendHeartbeat(source: NetworkNode, targetId: NodeID): ProtocolMessage {
    const payload = `{"entropy":${source.getCurrentEntropy(0)},"coherence":${source.entangledNode.coherence}}`;
    return new ProtocolMessage(ProtocolType.HEARTBEAT, source.id, targetId, payload);
  }
}

// Export main protocol functions
export function initializeProtocols(): ProtocolHandler {
  console.log("Initializing PRN protocols");
  return new ProtocolHandler();
}

export function handleProtocolMessage(
  handler: ProtocolHandler,
  node: NetworkNode,
  message: ProtocolMessage
): ProtocolMessage | null {
  return handler.processMessage(node, message);
}