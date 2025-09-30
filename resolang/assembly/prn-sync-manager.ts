// PRN Synchronization Manager
// Integrates HSP, QSTP, and CBSP protocols for comprehensive state synchronization

import { NetworkNode, NodeID, EntanglementStrength } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";
import { ResonantFragment } from "resolang";
import {
  HolographicStateEncoder,
  StateFragment,
  FragmentDistributor,
  HSPMessage,
  HSPMessageType,
  encodeState,
  decodeFragments,
  calculateStateHash
} from "./hsp-protocol";
import {
  QuantumTeleportationEngine,
  TeleportationSession,
  QSTPMessage,
  QSTPMessageType,
  initiateTeleportation,
  performTeleportation,
  completeTeleportation
} from "./qstp-protocol";
import {
  CoherenceSyncManager,
  AutoSyncTrigger,
  CBSPMessage,
  CBSPMessageType,
  createSyncManager,
  triggerNetworkSync
} from "./cbsp-protocol";

// Synchronization strategy
export enum SyncStrategy {
  TELEPORT_FIRST = 0,    // Try teleportation for strong links
  HOLOGRAPHIC_ONLY = 1,  // Use only HSP
  COHERENCE_ONLY = 2,    // Use only CBSP
  ADAPTIVE = 3           // Choose based on network conditions
}

// Sync session tracking
export class SyncSession {
  sessionId: string;
  strategy: SyncStrategy;
  sourceNode: NodeID;
  targetNodes: Array<NodeID>;
  state: PrimeState;
  stateHash: string;
  startTime: f64;
  completedNodes: Set<NodeID>;
  failedNodes: Set<NodeID>;
  
  constructor(
    sourceNode: NodeID,
    state: PrimeState,
    strategy: SyncStrategy = SyncStrategy.ADAPTIVE
  ) {
    this.sessionId = this.generateSessionId();
    this.strategy = strategy;
    this.sourceNode = sourceNode;
    this.targetNodes = new Array<NodeID>();
    this.state = state;
    this.stateHash = calculateStateHash(state);
    this.startTime = Date.now() as f64;
    this.completedNodes = new Set<NodeID>();
    this.failedNodes = new Set<NodeID>();
  }
  
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `sync-${timestamp}-${random}`;
  }
  
  addTarget(nodeId: NodeID): void {
    this.targetNodes.push(nodeId);
  }
  
  markCompleted(nodeId: NodeID): void {
    this.completedNodes.add(nodeId);
    this.failedNodes.delete(nodeId);
  }
  
  markFailed(nodeId: NodeID): void {
    this.failedNodes.add(nodeId);
    this.completedNodes.delete(nodeId);
  }
  
  getSuccessRate(): f64 {
    const total = this.targetNodes.length;
    if (total == 0) return 0.0;
    return f64(this.completedNodes.size) / f64(total);
  }
  
  getDuration(): f64 {
    return (Date.now() as f64) - this.startTime;
  }
}

// Main synchronization orchestrator
export class PRNSyncOrchestrator {
  hspEncoder: HolographicStateEncoder;
  qtpEngine: QuantumTeleportationEngine;
  cbspManager: CoherenceSyncManager;
  autoSyncTrigger: AutoSyncTrigger;
  fragmentDistributor: FragmentDistributor;
  
  activeSessions: Map<string, SyncSession>;
  nodeRegistry: Map<NodeID, NetworkNode>;
  
  // Configuration
  strongEntanglementThreshold: f64;
  minCoherenceForSync: f64;
  maxSyncRetries: i32;
  
  constructor(
    strongThreshold: f64 = 0.85,
    minCoherence: f64 = 0.85,
    maxRetries: i32 = 3
  ) {
    this.hspEncoder = new HolographicStateEncoder();
    this.qtpEngine = new QuantumTeleportationEngine(strongThreshold, minCoherence);
    this.cbspManager = createSyncManager();
    this.autoSyncTrigger = new AutoSyncTrigger();
    this.fragmentDistributor = new FragmentDistributor();
    
    this.activeSessions = new Map<string, SyncSession>();
    this.nodeRegistry = new Map<NodeID, NetworkNode>();
    
    this.strongEntanglementThreshold = strongThreshold;
    this.minCoherenceForSync = minCoherence;
    this.maxSyncRetries = maxRetries;
  }
  
  // Register a node with the orchestrator
  registerNode(node: NetworkNode): void {
    this.nodeRegistry.set(node.id, node);
  }
  
  // Initiate state synchronization
  syncState(
    sourceNode: NetworkNode,
    state: PrimeState,
    strategy: SyncStrategy = SyncStrategy.ADAPTIVE
  ): SyncSession {
    const session = new SyncSession(sourceNode.id, state, strategy);
    
    // Determine target nodes based on entanglement
    const entangledNodes = sourceNode.entanglementMap.keys();
    for (let i = 0; i < entangledNodes.length; i++) {
      session.addTarget(entangledNodes[i]);
    }
    
    this.activeSessions.set(session.sessionId, session);
    
    // Execute synchronization based on strategy
    switch (strategy) {
      case SyncStrategy.TELEPORT_FIRST:
        this.executeTeleportFirst(sourceNode, session);
        break;
      case SyncStrategy.HOLOGRAPHIC_ONLY:
        this.executeHolographic(sourceNode, session);
        break;
      case SyncStrategy.COHERENCE_ONLY:
        this.executeCoherence(sourceNode, session);
        break;
      case SyncStrategy.ADAPTIVE:
        this.executeAdaptive(sourceNode, session);
        break;
    }
    
    return session;
  }
  
  // Adaptive synchronization strategy
  private executeAdaptive(sourceNode: NetworkNode, session: SyncSession): void {
    // Categorize links by strength
    const strongLinks = new Array<NodeID>();
    const weakLinks = new Array<NodeID>();
    
    const nodeIds = sourceNode.entanglementMap.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const strength = sourceNode.entanglementMap.get(nodeId);
      
      if (strength >= this.strongEntanglementThreshold) {
        strongLinks.push(nodeId);
      } else {
        weakLinks.push(nodeId);
      }
    }
    
    // Use teleportation for strong links
    for (let i = 0; i < strongLinks.length; i++) {
      const targetId = strongLinks[i];
      const targetNode = this.nodeRegistry.get(targetId);
      
      if (targetNode) {
        const teleportSession = initiateTeleportation(
          sourceNode,
          targetId,
          session.state
        );
        
        if (teleportSession && performTeleportation(teleportSession, targetNode)) {
          // Send measurement results
          const msg = teleportSession.createMeasurementMessage();
          // In real implementation, send msg to target
          
          session.markCompleted(targetId);
        } else {
          // Fall back to holographic
          this.syncViaHolographic(sourceNode, targetId, session);
        }
      }
    }
    
    // Use holographic + coherence for weak links
    if (weakLinks.length > 0) {
      this.distributeHolographicFragments(sourceNode, session, weakLinks);
      this.triggerCoherenceSync(sourceNode, session);
    }
  }
  
  // Teleport-first strategy
  private executeTeleportFirst(sourceNode: NetworkNode, session: SyncSession): void {
    let teleportCount = 0;
    
    for (let i = 0; i < session.targetNodes.length; i++) {
      const targetId = session.targetNodes[i];
      const targetNode = this.nodeRegistry.get(targetId);
      
      if (!targetNode) continue;
      
      if (this.qtpEngine.canTeleport(sourceNode, targetId)) {
        const teleportSession = initiateTeleportation(
          sourceNode,
          targetId,
          session.state
        );
        
        if (teleportSession && performTeleportation(teleportSession, targetNode)) {
          session.markCompleted(targetId);
          teleportCount++;
        }
      }
    }
    
    // Use holographic for remaining nodes
    const remainingNodes = new Array<NodeID>();
    for (let i = 0; i < session.targetNodes.length; i++) {
      const nodeId = session.targetNodes[i];
      if (!session.completedNodes.has(nodeId)) {
        remainingNodes.push(nodeId);
      }
    }
    
    if (remainingNodes.length > 0) {
      this.distributeHolographicFragments(sourceNode, session, remainingNodes);
    }
  }
  
  // Holographic-only strategy
  private executeHolographic(sourceNode: NetworkNode, session: SyncSession): void {
    this.distributeHolographicFragments(sourceNode, session, session.targetNodes);
    
    // Follow up with coherence sync
    this.triggerCoherenceSync(sourceNode, session);
  }
  
  // Coherence-only strategy
  private executeCoherence(sourceNode: NetworkNode, session: SyncSession): void {
    // First distribute minimal state info
    const fragments = this.hspEncoder.encode(session.state);
    
    // Send only essential fragments
    for (let i = 0; i < session.targetNodes.length && i < fragments.length; i++) {
      const targetId = session.targetNodes[i];
      const fragment = fragments[i];
      
      // In real implementation, send fragment to target
      const msg = new HSPMessage(
        HSPMessageType.STATE_FRAGMENT,
        sourceNode.id,
        session.stateHash
      );
      msg.addFragment(fragment);
    }
    
    // Trigger coherence-based synchronization
    this.triggerCoherenceSync(sourceNode, session);
  }
  
  // Helper: Sync via holographic protocol
  private syncViaHolographic(
    sourceNode: NetworkNode,
    targetId: NodeID,
    session: SyncSession
  ): void {
    const fragments = this.hspEncoder.encode(session.state);
    
    // Create distribution map for single target
    const entanglementMap = new Map<string, f64>();
    const strength = sourceNode.entanglementMap.get(targetId);
    if (strength) {
      entanglementMap.set(targetId, strength);
    }
    
    const distribution = this.fragmentDistributor.distributeFragments(
      fragments,
      entanglementMap
    );
    
    const targetFragments = distribution.get(targetId);
    if (targetFragments && targetFragments.length > 0) {
      // Send fragments to target
      const msg = new HSPMessage(
        HSPMessageType.STATE_FRAGMENT,
        sourceNode.id,
        session.stateHash
      );
      
      for (let i = 0; i < targetFragments.length; i++) {
        msg.addFragment(targetFragments[i]);
      }
      
      // In real implementation, send msg to target
      session.markCompleted(targetId);
    } else {
      session.markFailed(targetId);
    }
  }
  
  // Helper: Distribute holographic fragments
  private distributeHolographicFragments(
    sourceNode: NetworkNode,
    session: SyncSession,
    targetNodes: Array<NodeID>
  ): void {
    const fragments = this.hspEncoder.encode(session.state);
    
    // Build entanglement map for targets
    const entanglementMap = new Map<string, f64>();
    for (let i = 0; i < targetNodes.length; i++) {
      const nodeId = targetNodes[i];
      const strength = sourceNode.entanglementMap.get(nodeId);
      if (strength) {
        entanglementMap.set(nodeId, strength);
      }
    }
    
    const distribution = this.fragmentDistributor.distributeFragments(
      fragments,
      entanglementMap
    );
    
    // Send fragments to each target
    const nodeIds = distribution.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const nodeFragments = distribution.get(nodeId);
      
      if (nodeFragments && nodeFragments.length > 0) {
        const msg = new HSPMessage(
          HSPMessageType.STATE_FRAGMENT,
          sourceNode.id,
          session.stateHash
        );
        
        for (let j = 0; j < nodeFragments.length; j++) {
          msg.addFragment(nodeFragments[j]);
        }
        
        // In real implementation, send msg to target
        session.markCompleted(nodeId);
      }
    }
  }
  
  // Helper: Trigger coherence synchronization
  private triggerCoherenceSync(sourceNode: NetworkNode, session: SyncSession): void {
    const nodes = new Array<NetworkNode>();
    nodes.push(sourceNode);
    
    // Add target nodes
    for (let i = 0; i < session.targetNodes.length; i++) {
      const node = this.nodeRegistry.get(session.targetNodes[i]);
      if (node) {
        nodes.push(node);
      }
    }
    
    // Trigger network-wide sync
    triggerNetworkSync(nodes, this.cbspManager);
  }
  
  // Check if automatic sync should be triggered
  checkAutoSync(node: NetworkNode): boolean {
    // Calculate average coherence with neighbors
    let totalCoherence: f64 = 0.0;
    let count: i32 = 0;
    
    const neighbors = node.entanglementMap.keys();
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = this.nodeRegistry.get(neighbors[i]);
      if (neighbor) {
        totalCoherence += node.computeCoherence(neighbor);
        count++;
      }
    }
    
    const avgCoherence = count > 0 ? totalCoherence / f64(count) : 0.0;
    
    // Check trigger conditions
    const shouldSync = this.autoSyncTrigger.shouldTriggerSync(
      node,
      avgCoherence,
      0.9  // Previous average (in real implementation, track this)
    );
    
    if (shouldSync) {
      this.autoSyncTrigger.updateSyncTime();
    }
    
    return shouldSync;
  }
  
  // Get synchronization statistics
  getSyncStats(): string {
    let json = "{";
    json += `"activeSessions":${this.activeSessions.size},`;
    json += `"registeredNodes":${this.nodeRegistry.size},`;
    json += `"cbspStats":${this.cbspManager.getSyncStats()},`;
    
    // Calculate success rates
    let totalSessions = 0;
    let successfulSessions = 0;
    
    const sessionIds = this.activeSessions.keys();
    for (let i = 0; i < sessionIds.length; i++) {
      const session = this.activeSessions.get(sessionIds[i]);
      totalSessions++;
      if (session.getSuccessRate() > 0.8) {
        successfulSessions++;
      }
    }
    
    const overallSuccessRate = totalSessions > 0 
      ? f64(successfulSessions) / f64(totalSessions) 
      : 0.0;
    
    json += `"overallSuccessRate":${overallSuccessRate}`;
    json += "}";
    
    return json;
  }
}

// Export convenience functions
export function createSyncOrchestrator(): PRNSyncOrchestrator {
  return new PRNSyncOrchestrator();
}

export function syncQuantumState(
  orchestrator: PRNSyncOrchestrator,
  sourceNode: NetworkNode,
  state: PrimeState
): SyncSession {
  return orchestrator.syncState(sourceNode, state);
}

export function shouldAutoSync(
  orchestrator: PRNSyncOrchestrator,
  node: NetworkNode
): boolean {
  return orchestrator.checkAutoSync(node);
}