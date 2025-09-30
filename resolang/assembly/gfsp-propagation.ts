// Gossip-Free State Propagation (GFSP)
// Uses quantum teleportation and holographic properties instead of flooding

import { NetworkNode, NodeID, EntanglementStrength } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";
import {
  StateFragment,
  HolographicStateEncoder,
  FragmentDistributor,
  encodeState,
  calculateStateHash
} from "./hsp-protocol";
import {
  QuantumTeleportationEngine,
  TeleportationSession,
  initiateTeleportation,
  performTeleportation,
  completeTeleportation
} from "./qstp-protocol";
import {
  EntanglementGraphRouter,
  RoutePath,
  RouteType,
  createRouter
} from "./egr-router";
import {
  PRNSyncOrchestrator,
  SyncStrategy,
  SyncSession
} from "./prn-sync-manager";
import { Serializable } from "./core/interfaces";
import { JSONSerializable, JSONBuilder } from "./core/serialization";

// Propagation strategy
export enum PropagationStrategy {
  TELEPORT_CASCADE = 0,    // Cascade through strong links
  HOLOGRAPHIC_SPREAD = 1,  // Spread fragments holographically
  RESONANCE_WAVE = 2,      // Use phase resonance
  ADAPTIVE = 3             // Choose based on topology
}

// Propagation metrics
export class PropagationMetrics extends JSONSerializable {
  nodesReached: u32;
  propagationTime: f64;
  teleportationsUsed: u32;
  fragmentsDistributed: u32;
  averageHops: f64;
  coverage: f64;  // Percentage of network reached
  
  constructor() {
    super();
    this.nodesReached = 0;
    this.propagationTime = 0.0;
    this.teleportationsUsed = 0;
    this.fragmentsDistributed = 0;
    this.averageHops = 0.0;
    this.coverage = 0.0;
  }
  
  protected buildJSON(builder: JSONBuilder): void {
    builder
      .addIntegerField("nodesReached", this.nodesReached)
      .addNumberField("propagationTime", this.propagationTime)
      .addIntegerField("teleportationsUsed", this.teleportationsUsed)
      .addIntegerField("fragmentsDistributed", this.fragmentsDistributed)
      .addNumberField("averageHops", this.averageHops)
      .addNumberField("coverage", this.coverage);
  }
  
  protected getTypeName(): string {
    return "PropagationMetrics";
  }
}

// Propagation session
export class PropagationSession {
  sessionId: string;
  sourceNode: NodeID;
  state: PrimeState;
  stateHash: string;
  strategy: PropagationStrategy;
  startTime: f64;
  targetNodes: Set<NodeID>;
  reachedNodes: Set<NodeID>;
  pendingNodes: Set<NodeID>;
  metrics: PropagationMetrics;
  
  constructor(
    sourceNode: NodeID,
    state: PrimeState,
    strategy: PropagationStrategy = PropagationStrategy.ADAPTIVE
  ) {
    this.sessionId = this.generateSessionId();
    this.sourceNode = sourceNode;
    this.state = state;
    this.stateHash = calculateStateHash(state);
    this.strategy = strategy;
    this.startTime = Date.now() as f64;
    this.targetNodes = new Set<NodeID>();
    this.reachedNodes = new Set<NodeID>();
    this.pendingNodes = new Set<NodeID>();
    this.metrics = new PropagationMetrics();
  }
  
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `propagation-${timestamp}-${random}`;
  }
  
  addTarget(nodeId: NodeID): void {
    this.targetNodes.add(nodeId);
    this.pendingNodes.add(nodeId);
  }
  
  markReached(nodeId: NodeID): void {
    this.reachedNodes.add(nodeId);
    this.pendingNodes.delete(nodeId);
    this.metrics.nodesReached++;
  }
  
  updateMetrics(): void {
    this.metrics.propagationTime = (Date.now() as f64) - this.startTime;
    if (this.targetNodes.size > 0) {
      this.metrics.coverage = f64(this.reachedNodes.size) / f64(this.targetNodes.size);
    }
  }
  
  isComplete(): boolean {
    return this.pendingNodes.size == 0 || this.metrics.propagationTime > 10000; // 10s timeout
  }
}

// Teleportation cascade manager
export class TeleportationCascade {
  qtpEngine: QuantumTeleportationEngine;
  router: EntanglementGraphRouter;
  maxCascadeDepth: u32;
  minCascadeStrength: f64;
  
  constructor(
    qtpEngine: QuantumTeleportationEngine,
    router: EntanglementGraphRouter,
    maxDepth: u32 = 5,
    minStrength: f64 = 0.7
  ) {
    this.qtpEngine = qtpEngine;
    this.router = router;
    this.maxCascadeDepth = maxDepth;
    this.minCascadeStrength = minStrength;
  }
  
  // Execute cascade propagation
  executeCascade(
    sourceNode: NetworkNode,
    state: PrimeState,
    session: PropagationSession
  ): void {
    const visited = new Set<NodeID>();
    const queue = new Array<CascadeNode>();
    
    // Start with source node
    queue.push(new CascadeNode(sourceNode.id, 0, 1.0));
    visited.add(sourceNode.id);
    
    while (queue.length > 0 && !session.isComplete()) {
      const current = queue.shift()!;
      
      if (current.depth >= this.maxCascadeDepth) {
        continue;
      }
      
      // Find strong entanglements for teleportation
      const neighbors = this.getStrongNeighbors(current.nodeId);
      
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        
        if (visited.has(neighbor.nodeId)) {
          continue;
        }
        
        visited.add(neighbor.nodeId);
        
        // Check if we can teleport
        const cascadeStrength = current.strength * neighbor.strength;
        if (cascadeStrength >= this.minCascadeStrength) {
          // Simulate teleportation
          if (this.teleportToNode(sourceNode, neighbor.nodeId, state)) {
            session.markReached(neighbor.nodeId);
            session.metrics.teleportationsUsed++;
            
            // Add to cascade queue
            queue.push(new CascadeNode(
              neighbor.nodeId,
              current.depth + 1,
              cascadeStrength
            ));
          }
        }
      }
    }
  }
  
  private getStrongNeighbors(nodeId: NodeID): Array<NeighborInfo> {
    // In real implementation, get from network graph
    // For now, return empty array
    return new Array<NeighborInfo>();
  }
  
  private teleportToNode(
    source: NetworkNode,
    targetId: NodeID,
    state: PrimeState
  ): boolean {
    // In real implementation, perform actual teleportation
    // For now, simulate success based on probability
    return Math.random() > 0.2;
  }
}

// Cascade node info
class CascadeNode {
  nodeId: NodeID;
  depth: u32;
  strength: f64;
  
  constructor(nodeId: NodeID, depth: u32, strength: f64) {
    this.nodeId = nodeId;
    this.depth = depth;
    this.strength = strength;
  }
}

// Neighbor info
class NeighborInfo {
  nodeId: NodeID;
  strength: EntanglementStrength;
  
  constructor(nodeId: NodeID, strength: EntanglementStrength) {
    this.nodeId = nodeId;
    this.strength = strength;
  }
}

// Holographic spread manager
export class HolographicSpread {
  encoder: HolographicStateEncoder;
  distributor: FragmentDistributor;
  minFragmentsPerNode: u32;
  redundancyFactor: f64;
  
  constructor(
    minFragments: u32 = 3,
    redundancy: f64 = 2.0
  ) {
    this.encoder = new HolographicStateEncoder(redundancy);
    this.distributor = new FragmentDistributor();
    this.minFragmentsPerNode = minFragments;
    this.redundancyFactor = redundancy;
  }
  
  // Execute holographic spread
  executeSpread(
    sourceNode: NetworkNode,
    state: PrimeState,
    session: PropagationSession
  ): void {
    // Encode state into fragments
    const fragments = this.encoder.encode(state);
    
    // Build entanglement map for distribution
    const entanglementMap = new Map<string, f64>();
    const targetArray = new Array<NodeID>();
    const targetIterator = session.targetNodes.values();
    for (let i = 0; i < targetIterator.length; i++) {
      targetArray.push(targetIterator[i]);
    }
    
    for (let i = 0; i < targetArray.length; i++) {
      const targetId = targetArray[i];
      // In real implementation, get actual entanglement strength
      const strength = 0.5 + Math.random() * 0.5; // Simulate
      entanglementMap.set(targetId, strength);
    }
    
    // Distribute fragments
    const distribution = this.distributor.distributeFragments(
      fragments,
      entanglementMap
    );
    
    // Mark nodes that received fragments as reached
    const nodeIds = distribution.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const nodeFragments = distribution.get(nodeId);
      
      if (nodeFragments && nodeFragments.length >= this.minFragmentsPerNode) {
        session.markReached(nodeId);
        session.metrics.fragmentsDistributed += u32(nodeFragments.length);
      }
    }
  }
}

// Resonance wave propagation
export class ResonanceWave {
  phaseSpeed: f64;
  coherenceThreshold: f64;
  waveDecay: f64;
  
  constructor(
    phaseSpeed: f64 = 1.0,
    coherenceThreshold: f64 = 0.7,
    waveDecay: f64 = 0.9
  ) {
    this.phaseSpeed = phaseSpeed;
    this.coherenceThreshold = coherenceThreshold;
    this.waveDecay = waveDecay;
  }
  
  // Execute resonance wave propagation
  executeWave(
    sourceNode: NetworkNode,
    state: PrimeState,
    session: PropagationSession
  ): void {
    const waveNodes = new Array<WaveNode>();
    const visited = new Set<NodeID>();
    
    // Initialize wave at source
    waveNodes.push(new WaveNode(sourceNode.id, 1.0, 0));
    visited.add(sourceNode.id);
    
    // Propagate wave through network
    while (waveNodes.length > 0 && !session.isComplete()) {
      const newWaveNodes = new Array<WaveNode>();
      
      for (let i = 0; i < waveNodes.length; i++) {
        const waveNode = waveNodes[i];
        
        // Get neighbors (in real implementation)
        const neighbors = this.getNeighborsWithCoherence(waveNode.nodeId);
        
        for (let j = 0; j < neighbors.length; j++) {
          const neighbor = neighbors[j];
          
          if (visited.has(neighbor.nodeId)) {
            continue;
          }
          
          // Calculate wave amplitude at neighbor
          const amplitude = waveNode.amplitude * neighbor.coherence * this.waveDecay;
          
          if (amplitude >= this.coherenceThreshold) {
            visited.add(neighbor.nodeId);
            session.markReached(neighbor.nodeId);
            
            // Add to next wave front
            newWaveNodes.push(new WaveNode(
              neighbor.nodeId,
              amplitude,
              waveNode.distance + 1
            ));
            
            // Update average hops
            const totalHops = session.metrics.averageHops * f64(session.metrics.nodesReached - 1);
            session.metrics.averageHops = (totalHops + f64(waveNode.distance + 1)) / f64(session.metrics.nodesReached);
          }
        }
      }
      
      waveNodes.length = 0;
      for (let i = 0; i < newWaveNodes.length; i++) {
        waveNodes.push(newWaveNodes[i]);
      }
    }
  }
  
  private getNeighborsWithCoherence(nodeId: NodeID): Array<NeighborCoherence> {
    // In real implementation, get from network
    // For now, return simulated neighbors
    const neighbors = new Array<NeighborCoherence>();
    const count = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < count; i++) {
      neighbors.push(new NeighborCoherence(
        `node-${Math.floor(Math.random() * 100)}`,
        0.7 + Math.random() * 0.3
      ));
    }
    
    return neighbors;
  }
}

// Wave node info
class WaveNode {
  nodeId: NodeID;
  amplitude: f64;
  distance: u32;
  
  constructor(nodeId: NodeID, amplitude: f64, distance: u32) {
    this.nodeId = nodeId;
    this.amplitude = amplitude;
    this.distance = distance;
  }
}

// Neighbor with coherence
class NeighborCoherence {
  nodeId: NodeID;
  coherence: f64;
  
  constructor(nodeId: NodeID, coherence: f64) {
    this.nodeId = nodeId;
    this.coherence = coherence;
  }
}

// Gossip-Free State Propagation Manager
export class GFSPManager {
  nodeId: NodeID;
  teleportCascade: TeleportationCascade;
  holographicSpread: HolographicSpread;
  resonanceWave: ResonanceWave;
  router: EntanglementGraphRouter;
  activeSessions: Map<string, PropagationSession>;
  
  constructor(
    nodeId: NodeID,
    router: EntanglementGraphRouter
  ) {
    this.nodeId = nodeId;
    this.router = router;
    
    const qtpEngine = new QuantumTeleportationEngine();
    this.teleportCascade = new TeleportationCascade(qtpEngine, router);
    this.holographicSpread = new HolographicSpread();
    this.resonanceWave = new ResonanceWave();
    
    this.activeSessions = new Map<string, PropagationSession>();
  }
  
  // Propagate state through network
  propagateState(
    sourceNode: NetworkNode,
    state: PrimeState,
    targetNodes: Array<NodeID>,
    strategy: PropagationStrategy = PropagationStrategy.ADAPTIVE
  ): PropagationSession {
    const session = new PropagationSession(sourceNode.id, state, strategy);
    
    // Add all target nodes
    for (let i = 0; i < targetNodes.length; i++) {
      session.addTarget(targetNodes[i]);
    }
    
    this.activeSessions.set(session.sessionId, session);
    
    // Execute propagation based on strategy
    switch (strategy) {
      case PropagationStrategy.TELEPORT_CASCADE:
        this.teleportCascade.executeCascade(sourceNode, state, session);
        break;
        
      case PropagationStrategy.HOLOGRAPHIC_SPREAD:
        this.holographicSpread.executeSpread(sourceNode, state, session);
        break;
        
      case PropagationStrategy.RESONANCE_WAVE:
        this.resonanceWave.executeWave(sourceNode, state, session);
        break;
        
      case PropagationStrategy.ADAPTIVE:
        this.executeAdaptivePropagation(sourceNode, state, session);
        break;
    }
    
    session.updateMetrics();
    return session;
  }
  
  // Adaptive propagation strategy
  private executeAdaptivePropagation(
    sourceNode: NetworkNode,
    state: PrimeState,
    session: PropagationSession
  ): void {
    // Analyze network topology
    const strongLinks = new Array<NodeID>();
    const weakLinks = new Array<NodeID>();
    
    const targets = new Array<NodeID>();
    const targetIterator = session.targetNodes.values();
    for (let i = 0; i < targetIterator.length; i++) {
      targets.push(targetIterator[i]);
    }
    for (let i = 0; i < targets.length; i++) {
      const targetId = targets[i];
      const route = this.router.findRoute(sourceNode.id, targetId);
      
      if (route && route.type == RouteType.TELEPORT) {
        strongLinks.push(targetId);
      } else {
        weakLinks.push(targetId);
      }
    }
    
    // Use teleport cascade for strong links
    if (strongLinks.length > 0) {
      const strongSession = new PropagationSession(
        sourceNode.id,
        state,
        PropagationStrategy.TELEPORT_CASCADE
      );
      
      for (let i = 0; i < strongLinks.length; i++) {
        strongSession.addTarget(strongLinks[i]);
      }
      
      this.teleportCascade.executeCascade(sourceNode, state, strongSession);
      
      // Merge results
      const reached = new Array<NodeID>();
      const reachedIterator = strongSession.reachedNodes.values();
      for (let i = 0; i < reachedIterator.length; i++) {
        reached.push(reachedIterator[i]);
      }
      for (let i = 0; i < reached.length; i++) {
        session.markReached(reached[i]);
      }
      session.metrics.teleportationsUsed = strongSession.metrics.teleportationsUsed;
    }
    
    // Use holographic spread for remaining nodes
    if (weakLinks.length > 0) {
      const weakSession = new PropagationSession(
        sourceNode.id,
        state,
        PropagationStrategy.HOLOGRAPHIC_SPREAD
      );
      
      for (let i = 0; i < weakLinks.length; i++) {
        if (!session.reachedNodes.has(weakLinks[i])) {
          weakSession.addTarget(weakLinks[i]);
        }
      }
      
      this.holographicSpread.executeSpread(sourceNode, state, weakSession);
      
      // Merge results
      const reached = new Array<NodeID>();
      const reachedIterator = weakSession.reachedNodes.values();
      for (let i = 0; i < reachedIterator.length; i++) {
        reached.push(reachedIterator[i]);
      }
      for (let i = 0; i < reached.length; i++) {
        session.markReached(reached[i]);
      }
      session.metrics.fragmentsDistributed = weakSession.metrics.fragmentsDistributed;
    }
    
    // Use resonance wave for any unreached nodes
    const unreached = new Array<NodeID>();
    const unreachedIterator = session.pendingNodes.values();
    for (let i = 0; i < unreachedIterator.length; i++) {
      unreached.push(unreachedIterator[i]);
    }
    if (unreached.length > 0) {
      const waveSession = new PropagationSession(
        sourceNode.id,
        state,
        PropagationStrategy.RESONANCE_WAVE
      );
      
      for (let i = 0; i < unreached.length; i++) {
        waveSession.addTarget(unreached[i]);
      }
      
      this.resonanceWave.executeWave(sourceNode, state, waveSession);
      
      // Merge results
      const reached = new Array<NodeID>();
      const reachedIterator = waveSession.reachedNodes.values();
      for (let i = 0; i < reachedIterator.length; i++) {
        reached.push(reachedIterator[i]);
      }
      for (let i = 0; i < reached.length; i++) {
        session.markReached(reached[i]);
      }
      session.metrics.averageHops = waveSession.metrics.averageHops;
    }
  }
  
  // Get propagation statistics
  getStats(): string {
    let totalSessions = 0;
    let avgCoverage = 0.0;
    let totalTeleports = 0;
    let totalFragments = 0;
    
    const sessions = this.activeSessions.values();
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      totalSessions++;
      avgCoverage += session.metrics.coverage;
      totalTeleports += session.metrics.teleportationsUsed;
      totalFragments += session.metrics.fragmentsDistributed;
    }
    
    if (totalSessions > 0) {
      avgCoverage /= f64(totalSessions);
    }
    
    return `{"activeSessions":${this.activeSessions.size},"avgCoverage":${avgCoverage},"totalTeleports":${totalTeleports},"totalFragments":${totalFragments}}`;
  }
}

// Export convenience functions
export function createGFSPManager(
  nodeId: NodeID,
  router: EntanglementGraphRouter
): GFSPManager {
  return new GFSPManager(nodeId, router);
}

export function propagateStateGossipFree(
  manager: GFSPManager,
  sourceNode: NetworkNode,
  state: PrimeState,
  targetNodes: Array<NodeID>
): PropagationSession {
  return manager.propagateState(sourceNode, state, targetNodes);
}