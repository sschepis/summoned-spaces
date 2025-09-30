import { NodeID } from '../../resonnet/assembly/prn-node';
import { EntanglementLink } from "resolang";
import { EntanglementGraphRouter } from './egr-router';
import { PrimeResonanceDHT } from './pr-dht';

/**
 * Dynamic Topology Optimizer (DTO)
 * 
 * Continuously optimizes the network topology by adjusting entanglement
 * strengths based on communication patterns, load distribution, and
 * quantum coherence measurements. Uses machine learning-inspired algorithms
 * to predict optimal topology configurations.
 * 
 * Key Features:
 * - Communication pattern analysis
 * - Predictive entanglement adjustment
 * - Load balancing through topology changes
 * - Coherence-aware optimization
 * - Self-healing network properties
 */

export class CommunicationPattern {
  sourceNode: NodeID;
  targetNode: NodeID;
  frequency: f64;        // Messages per second
  dataVolume: f64;       // Bytes per second
  latency: f64;          // Average latency in ms
  successRate: f64;      // Success rate [0, 1]
  lastUpdate: u64;
  
  constructor(source: NodeID, target: NodeID) {
    this.sourceNode = source;
    this.targetNode = target;
    this.frequency = 0;
    this.dataVolume = 0;
    this.latency = 0;
    this.successRate = 1.0;
    this.lastUpdate = Date.now();
  }
  
  update(messageSize: f64, latency: f64, success: bool): void {
    const now = Date.now();
    const timeDelta = f64(now - this.lastUpdate) / 1000.0; // seconds
    
    // Exponential moving average for frequency
    const alpha = 0.1;
    this.frequency = alpha * (1.0 / timeDelta) + (1 - alpha) * this.frequency;
    
    // Update data volume
    this.dataVolume = alpha * (messageSize / timeDelta) + (1 - alpha) * this.dataVolume;
    
    // Update latency
    this.latency = alpha * latency + (1 - alpha) * this.latency;
    
    // Update success rate
    const successValue = success ? 1.0 : 0.0;
    this.successRate = alpha * successValue + (1 - alpha) * this.successRate;
    
    this.lastUpdate = now;
  }
  
  get score(): f64 {
    // Combined score for pattern importance
    return this.frequency * this.dataVolume * this.successRate / (this.latency + 1.0);
  }
}

export class TopologyMetrics {
  averagePathLength: f64;
  clusteringCoefficient: f64;
  networkDiameter: i32;
  totalEntanglement: f64;
  coherenceLevel: f64;
  loadBalance: f64;
  
  constructor() {
    this.averagePathLength = 0;
    this.clusteringCoefficient = 0;
    this.networkDiameter = 0;
    this.totalEntanglement = 0;
    this.coherenceLevel = 0;
    this.loadBalance = 0;
  }
}

export class DTOOptimizer {
  // Configuration parameters
  static readonly OPTIMIZATION_INTERVAL: u64 = 10000; // 10 seconds
  static readonly MIN_ENTANGLEMENT: f64 = 0.1;
  static readonly MAX_ENTANGLEMENT: f64 = 1.0;
  static readonly ENTANGLEMENT_STEP: f64 = 0.05;
  static readonly PATTERN_DECAY_RATE: f64 = 0.001;
  static readonly LOAD_BALANCE_WEIGHT: f64 = 0.3;
  static readonly COHERENCE_WEIGHT: f64 = 0.4;
  static readonly EFFICIENCY_WEIGHT: f64 = 0.3;
  
  nodeId: NodeID;
  router: EntanglementGraphRouter;
  dht: PrimeResonanceDHT;
  
  // Communication tracking
  patterns: Map<string, CommunicationPattern>;
  nodeLoads: Map<NodeID, f64>;
  
  // Topology state
  currentLinks: Map<string, EntanglementLink>;
  proposedChanges: Array<TopologyChange>;
  
  // Optimization state
  lastOptimization: u64;
  optimizationHistory: Array<TopologyMetrics>;
  
  constructor(nodeId: NodeID, router: EntanglementGraphRouter, dht: PrimeResonanceDHT) {
    this.nodeId = nodeId;
    this.router = router;
    this.dht = dht;
    
    this.patterns = new Map<string, CommunicationPattern>();
    this.nodeLoads = new Map<NodeID, f64>();
    this.currentLinks = new Map<string, EntanglementLink>();
    this.proposedChanges = new Array<TopologyChange>();
    
    this.lastOptimization = Date.now();
    this.optimizationHistory = new Array<TopologyMetrics>();
  }
  
  /**
   * Record a communication event
   */
  recordCommunication(
    source: NodeID,
    target: NodeID,
    messageSize: f64,
    latency: f64,
    success: bool
  ): void {
    const patternKey = this.getPatternKey(source, target);
    
    let pattern = this.patterns.get(patternKey);
    if (!pattern) {
      pattern = new CommunicationPattern(source, target);
      this.patterns.set(patternKey, pattern);
    }
    
    pattern.update(messageSize, latency, success);
    
    // Update node loads
    const sourceLoad = this.nodeLoads.get(source) || 0;
    const targetLoad = this.nodeLoads.get(target) || 0;
    
    this.nodeLoads.set(source, sourceLoad + messageSize);
    this.nodeLoads.set(target, targetLoad + messageSize);
  }
  
  /**
   * Run optimization cycle
   */
  optimize(): Array<TopologyChange> {
    const now = Date.now();
    if (now - this.lastOptimization < DTOOptimizer.OPTIMIZATION_INTERVAL) {
      return new Array<TopologyChange>();
    }
    
    // Calculate current metrics
    const currentMetrics = this.calculateMetrics();
    this.optimizationHistory.push(currentMetrics);
    
    // Decay old patterns
    this.decayPatterns();
    
    // Generate optimization proposals
    this.proposedChanges = new Array<TopologyChange>();
    
    // Optimize based on communication patterns
    this.optimizeByPatterns();
    
    // Optimize for load balancing
    this.optimizeLoadBalance();
    
    // Optimize for coherence
    this.optimizeCoherence();
    
    // Evaluate and filter proposals
    const acceptedChanges = this.evaluateProposals(currentMetrics);
    
    this.lastOptimization = now;
    
    return acceptedChanges;
  }
  
  /**
   * Calculate current network metrics
   */
  private calculateMetrics(): TopologyMetrics {
    const metrics = new TopologyMetrics();
    
    // Calculate average path length
    let totalPathLength = 0;
    let pathCount = 0;
    
    const nodes = this.getAllNodes();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const route = this.router.findRoute(nodes[i], nodes[j]);
        if (route) {
          totalPathLength += route.path.length - 1;
          pathCount++;
          
          if (route.path.length - 1 > metrics.networkDiameter) {
            metrics.networkDiameter = route.path.length - 1;
          }
        }
      }
    }
    
    metrics.averagePathLength = pathCount > 0 ? f64(totalPathLength) / f64(pathCount) : 0;
    
    // Calculate clustering coefficient
    metrics.clusteringCoefficient = this.calculateClusteringCoefficient();
    
    // Calculate total entanglement
    const links = this.currentLinks.values();
    for (let i = 0; i < links.length; i++) {
      metrics.totalEntanglement += links[i].strength;
    }
    
    // Calculate coherence level
    metrics.coherenceLevel = this.calculateNetworkCoherence();
    
    // Calculate load balance
    metrics.loadBalance = this.calculateLoadBalance();
    
    return metrics;
  }
  
  /**
   * Calculate clustering coefficient
   */
  private calculateClusteringCoefficient(): f64 {
    let totalCoefficient = 0;
    let nodeCount = 0;
    
    const nodes = this.getAllNodes();
    for (let i = 0; i < nodes.length; i++) {
      const neighbors = this.getNeighbors(nodes[i]);
      if (neighbors.length < 2) continue;
      
      // Count triangles
      let triangles = 0;
      let possibleTriangles = 0;
      
      for (let j = 0; j < neighbors.length; j++) {
        for (let k = j + 1; k < neighbors.length; k++) {
          possibleTriangles++;
          if (this.areConnected(neighbors[j], neighbors[k])) {
            triangles++;
          }
        }
      }
      
      if (possibleTriangles > 0) {
        totalCoefficient += f64(triangles) / f64(possibleTriangles);
        nodeCount++;
      }
    }
    
    return nodeCount > 0 ? totalCoefficient / f64(nodeCount) : 0;
  }
  
  /**
   * Calculate network coherence
   */
  private calculateNetworkCoherence(): f64 {
    let totalCoherence = 0;
    let linkCount = 0;
    
    const links = this.currentLinks.values();
    for (let i = 0; i < links.length; i++) {
      totalCoherence += links[i].coherence;
      linkCount++;
    }
    
    return linkCount > 0 ? totalCoherence / f64(linkCount) : 0;
  }
  
  /**
   * Calculate load balance metric
   */
  private calculateLoadBalance(): f64 {
    const loads = this.nodeLoads.values();
    if (loads.length == 0) return 1.0;
    
    let sum = 0;
    let sumSquares = 0;
    
    for (let i = 0; i < loads.length; i++) {
      sum += loads[i];
      sumSquares += loads[i] * loads[i];
    }
    
    const mean = sum / f64(loads.length);
    const variance = sumSquares / f64(loads.length) - mean * mean;
    const stdDev = Math.sqrt(variance);
    
    // Return normalized balance score (lower std dev = better balance)
    return 1.0 / (1.0 + stdDev / (mean + 1.0));
  }
  
  /**
   * Optimize based on communication patterns
   */
  private optimizeByPatterns(): void {
    const patterns = this.patterns.values();
    
    // Sort patterns by score
    const sortedPatterns = patterns.sort((a, b) => {
      return b.score > a.score ? 1 : -1;
    });
    
    // Strengthen links for high-traffic patterns
    for (let i = 0; i < sortedPatterns.length && i < 10; i++) {
      const pattern = sortedPatterns[i];
      const linkKey = this.getLinkKey(pattern.sourceNode, pattern.targetNode);
      const link = this.currentLinks.get(linkKey);
      
      if (link) {
        // Propose strengthening
        const newStrength = Math.min(
          link.strength + DTOOptimizer.ENTANGLEMENT_STEP,
          DTOOptimizer.MAX_ENTANGLEMENT
        );
        
        if (newStrength > link.strength) {
          this.proposedChanges.push(new TopologyChange(
            TopologyChangeType.STRENGTHEN,
            pattern.sourceNode,
            pattern.targetNode,
            newStrength - link.strength
          ));
        }
      } else {
        // Propose new link
        this.proposedChanges.push(new TopologyChange(
          TopologyChangeType.CREATE,
          pattern.sourceNode,
          pattern.targetNode,
          0.5 // Start with medium strength
        ));
      }
    }
    
    // Weaken links for low-traffic patterns
    const weakPatterns = sortedPatterns.slice(-5);
    for (let i = 0; i < weakPatterns.length; i++) {
      const pattern = weakPatterns[i];
      const linkKey = this.getLinkKey(pattern.sourceNode, pattern.targetNode);
      const link = this.currentLinks.get(linkKey);
      
      if (link && pattern.score < 0.1) {
        // Propose weakening
        const newStrength = Math.max(
          link.strength - DTOOptimizer.ENTANGLEMENT_STEP,
          DTOOptimizer.MIN_ENTANGLEMENT
        );
        
        if (newStrength < link.strength) {
          this.proposedChanges.push(new TopologyChange(
            TopologyChangeType.WEAKEN,
            pattern.sourceNode,
            pattern.targetNode,
            link.strength - newStrength
          ));
        }
      }
    }
  }
  
  /**
   * Optimize for load balancing
   */
  private optimizeLoadBalance(): void {
    // Find overloaded and underloaded nodes
    const nodeIds = new Array<NodeID>();
    const loadValues = new Array<f64>();
    
    const loadKeys = this.nodeLoads.keys();
    for (let i = 0; i < loadKeys.length; i++) {
      const nodeId = loadKeys[i];
      const load = this.nodeLoads.get(nodeId) || 0;
      nodeIds.push(nodeId);
      loadValues.push(load);
    }
    
    let totalLoad: f64 = 0;
    let nodeCount = loadValues.length;
    
    for (let i = 0; i < loadValues.length; i++) {
      totalLoad += loadValues[i];
    }
    
    const averageLoad = nodeCount > 0 ? totalLoad / f64(nodeCount) : 0;
    
    // Identify imbalanced nodes
    const overloaded = new Array<NodeID>();
    const underloaded = new Array<NodeID>();
    
    for (let i = 0; i < nodeIds.length; i++) {
      const load = loadValues[i];
      if (load > averageLoad * 1.5) {
        overloaded.push(nodeIds[i]);
      } else if (load < averageLoad * 0.5) {
        underloaded.push(nodeIds[i]);
      }
    }
    
    // Propose topology changes to balance load
    for (let i = 0; i < overloaded.length; i++) {
      const overNode = overloaded[i];
      const neighbors = this.getNeighbors(overNode);
      
      // Try to create alternative paths
      for (let j = 0; j < underloaded.length && j < 3; j++) {
        const underNode = underloaded[j];
        
        // Check if they're not already strongly connected
        const linkKey = this.getLinkKey(overNode, underNode);
        const existingLink = this.currentLinks.get(linkKey);
        
        if (!existingLink || existingLink.strength < 0.5) {
          this.proposedChanges.push(new TopologyChange(
            existingLink ? TopologyChangeType.STRENGTHEN : TopologyChangeType.CREATE,
            overNode,
            underNode,
            0.3
          ));
        }
      }
    }
  }
  
  /**
   * Optimize for coherence
   */
  private optimizeCoherence(): void {
    // Find links with low coherence
    const linkValues = this.currentLinks.values();
    
    for (let i = 0; i < linkValues.length; i++) {
      const link = linkValues[i];
      
      if (link.coherence < 0.5) {
        // Propose refreshing or strengthening
        this.proposedChanges.push(new TopologyChange(
          TopologyChangeType.REFRESH,
          link.node1,
          link.node2,
          0
        ));
      }
    }
    
    // Ensure minimum connectivity
    const nodes = this.getAllNodes();
    for (let i = 0; i < nodes.length; i++) {
      const neighbors = this.getNeighbors(nodes[i]);
      
      if (neighbors.length < 3) {
        // Find potential connections
        const candidates = this.findConnectionCandidates(nodes[i], 3 - neighbors.length);
        
        for (let j = 0; j < candidates.length; j++) {
          this.proposedChanges.push(new TopologyChange(
            TopologyChangeType.CREATE,
            nodes[i],
            candidates[j],
            0.3
          ));
        }
      }
    }
  }
  
  /**
   * Evaluate and filter proposals
   */
  private evaluateProposals(currentMetrics: TopologyMetrics): Array<TopologyChange> {
    const accepted = new Array<TopologyChange>();
    
    // Simulate each change and evaluate impact
    for (let i = 0; i < this.proposedChanges.length; i++) {
      const change = this.proposedChanges[i];
      
      // Apply change temporarily
      this.applyChangeTemporary(change);
      
      // Calculate new metrics
      const newMetrics = this.calculateMetrics();
      
      // Calculate improvement score
      const score = this.calculateImprovementScore(currentMetrics, newMetrics);
      
      // Revert change
      this.revertChangeTemporary(change);
      
      // Accept if improvement
      if (score > 0.01) {
        change.score = score;
        accepted.push(change);
      }
    }
    
    // Sort by score and return top changes
    accepted.sort((a, b) => b.score > a.score ? 1 : -1);
    
    return accepted.slice(0, 5); // Limit changes per cycle
  }
  
  /**
   * Calculate improvement score
   */
  private calculateImprovementScore(
    oldMetrics: TopologyMetrics,
    newMetrics: TopologyMetrics
  ): f64 {
    let score: f64 = 0;
    
    // Efficiency improvement (shorter paths are better)
    const efficiencyImprovement = (oldMetrics.averagePathLength - newMetrics.averagePathLength) / 
                                  (oldMetrics.averagePathLength + 1.0);
    score += efficiencyImprovement * DTOOptimizer.EFFICIENCY_WEIGHT;
    
    // Coherence improvement
    const coherenceImprovement = (newMetrics.coherenceLevel - oldMetrics.coherenceLevel);
    score += coherenceImprovement * DTOOptimizer.COHERENCE_WEIGHT;
    
    // Load balance improvement
    const loadBalanceImprovement = (newMetrics.loadBalance - oldMetrics.loadBalance);
    score += loadBalanceImprovement * DTOOptimizer.LOAD_BALANCE_WEIGHT;
    
    return score;
  }
  
  /**
   * Apply a topology change
   */
  applyChange(change: TopologyChange): bool {
    const linkKey = this.getLinkKey(change.node1, change.node2);
    
    switch (change.type) {
      case TopologyChangeType.CREATE: {
        if (this.currentLinks.has(linkKey)) return false;
        
        const newLink = new EntanglementLink(
          change.node1,
          change.node2,
          change.value,
          1.0
        );
        this.currentLinks.set(linkKey, newLink);
        
        // Update router graph
        this.router.graph.addEdge(change.node1, change.node2, change.value);
        return true;
      }
      
      case TopologyChangeType.STRENGTHEN: {
        const link = this.currentLinks.get(linkKey);
        if (!link) return false;
        
        link.strength = Math.min(link.strength + change.value, DTOOptimizer.MAX_ENTANGLEMENT);
        
        // Update router graph
        this.router.graph.addEdge(change.node1, change.node2, link.strength);
        return true;
      }
      
      case TopologyChangeType.WEAKEN: {
        const link = this.currentLinks.get(linkKey);
        if (!link) return false;
        
        link.strength = Math.max(link.strength - change.value, DTOOptimizer.MIN_ENTANGLEMENT);
        
        // Update router graph
        this.router.graph.addEdge(change.node1, change.node2, link.strength);
        return true;
      }
      
      case TopologyChangeType.REMOVE: {
        if (!this.currentLinks.has(linkKey)) return false;
        
        this.currentLinks.delete(linkKey);
        
        // Update router graph
        const neighbors = this.router.graph.getNeighbors(change.node1);
        if (neighbors.has(change.node2)) {
          neighbors.delete(change.node2);
        }
        const neighbors2 = this.router.graph.getNeighbors(change.node2);
        if (neighbors2.has(change.node1)) {
          neighbors2.delete(change.node1);
        }
        return true;
      }
      
      case TopologyChangeType.REFRESH: {
        const link = this.currentLinks.get(linkKey);
        if (!link) return false;
        
        link.refresh();
        return true;
      }
      
      default:
        return false;
    }
  }
  
  /**
   * Decay old communication patterns
   */
  private decayPatterns(): void {
    const patternKeys = this.patterns.keys();
    const now = Date.now();
    const toRemove = new Array<string>();
    
    for (let i = 0; i < patternKeys.length; i++) {
      const key = patternKeys[i];
      const pattern = this.patterns.get(key);
      if (!pattern) continue;
      
      const age = f64(now - pattern.lastUpdate) / 1000.0; // seconds
      
      // Exponential decay
      pattern.frequency *= Math.exp(-DTOOptimizer.PATTERN_DECAY_RATE * age);
      pattern.dataVolume *= Math.exp(-DTOOptimizer.PATTERN_DECAY_RATE * age);
      
      // Remove if too weak
      if (pattern.score < 0.01) {
        toRemove.push(key);
      }
    }
    
    // Remove weak patterns
    for (let i = 0; i < toRemove.length; i++) {
      this.patterns.delete(toRemove[i]);
    }
    
    // Decay node loads
    const loadKeys = this.nodeLoads.keys();
    for (let i = 0; i < loadKeys.length; i++) {
      const key = loadKeys[i];
      const currentLoad = this.nodeLoads.get(key) || 0;
      this.nodeLoads.set(
        key,
        currentLoad * 0.9 // 10% decay per cycle
      );
    }
  }
  
  /**
   * Helper methods
   */
  
  private getPatternKey(node1: NodeID, node2: NodeID): string {
    return `${node1}->${node2}`;
  }
  
  private getLinkKey(node1: NodeID, node2: NodeID): string {
    return node1 < node2 ? `${node1}-${node2}` : `${node2}-${node1}`;
  }
  
  private getAllNodes(): Array<NodeID> {
    const nodes = new Set<NodeID>();
    
    // Add nodes from links
    const links = this.currentLinks.values();
    for (let i = 0; i < links.length; i++) {
      nodes.add(links[i].node1);
      nodes.add(links[i].node2);
    }
    
    // Add nodes from patterns
    const patterns = this.patterns.values();
    for (let i = 0; i < patterns.length; i++) {
      nodes.add(patterns[i].sourceNode);
      nodes.add(patterns[i].targetNode);
    }
    
    const result = new Array<NodeID>();
    const nodeIterator = nodes.values();
    for (let i = 0; i < nodeIterator.length; i++) {
      result.push(nodeIterator[i]);
    }
    
    return result;
  }
  
  private getNeighbors(node: NodeID): Array<NodeID> {
    const neighbors = new Set<NodeID>();
    
    const links = this.currentLinks.values();
    for (let i = 0; i < links.length; i++) {
      if (links[i].node1 == node) {
        neighbors.add(links[i].node2);
      } else if (links[i].node2 == node) {
        neighbors.add(links[i].node1);
      }
    }
    
    const result = new Array<NodeID>();
    const neighborIterator = neighbors.values();
    for (let i = 0; i < neighborIterator.length; i++) {
      result.push(neighborIterator[i]);
    }
    
    return result;
  }
  
  private areConnected(node1: NodeID, node2: NodeID): bool {
    const linkKey = this.getLinkKey(node1, node2);
    return this.currentLinks.has(linkKey);
  }
  
  private findConnectionCandidates(node: NodeID, count: i32): Array<NodeID> {
    const candidates = new Array<NodeID>();
    const allNodes = this.getAllNodes();
    const neighbors = this.getNeighbors(node);
    
    // Find non-neighbors
    for (let i = 0; i < allNodes.length && candidates.length < count; i++) {
      const candidate = allNodes[i];
      if (candidate == node) continue;
      
      let isNeighbor = false;
      for (let j = 0; j < neighbors.length; j++) {
        if (neighbors[j] == candidate) {
          isNeighbor = true;
          break;
        }
      }
      
      if (!isNeighbor) {
        candidates.push(candidate);
      }
    }
    
    return candidates;
  }
  
  private applyChangeTemporary(change: TopologyChange): void {
    // Simplified temporary application for evaluation
    const linkKey = this.getLinkKey(change.node1, change.node2);
    
    switch (change.type) {
      case TopologyChangeType.CREATE: {
        if (!this.currentLinks.has(linkKey)) {
          this.currentLinks.set(linkKey, new EntanglementLink(
            change.node1,
            change.node2,
            change.value,
            1.0
          ));
        }
        break;
      }
      
      case TopologyChangeType.STRENGTHEN:
      case TopologyChangeType.WEAKEN: {
        const link = this.currentLinks.get(linkKey);
        if (link) {
          link.strength = change.type == TopologyChangeType.STRENGTHEN ?
            Math.min(link.strength + change.value, DTOOptimizer.MAX_ENTANGLEMENT) :
            Math.max(link.strength - change.value, DTOOptimizer.MIN_ENTANGLEMENT);
        }
        break;
      }
      
      case TopologyChangeType.REMOVE: {
        this.currentLinks.delete(linkKey);
        break;
      }
    }
  }
  
  private revertChangeTemporary(change: TopologyChange): void {
    // Revert temporary changes
    const linkKey = this.getLinkKey(change.node1, change.node2);
    
    switch (change.type) {
      case TopologyChangeType.CREATE: {
        this.currentLinks.delete(linkKey);
        break;
      }
      
      case TopologyChangeType.STRENGTHEN: {
        const link = this.currentLinks.get(linkKey);
        if (link) {
          link.strength -= change.value;
        }
        break;
      }
      
      case TopologyChangeType.WEAKEN: {
        const link = this.currentLinks.get(linkKey);
        if (link) {
          link.strength += change.value;
        }
        break;
      }
    }
  }
  
  /**
   * Get optimization recommendations
   */
  getRecommendations(): Array<string> {
    const recommendations = new Array<string>();
    const metrics = this.calculateMetrics();
    
    if (metrics.averagePathLength > 4) {
      recommendations.push("Network diameter is large. Consider creating shortcuts between distant nodes.");
    }
    
    if (metrics.clusteringCoefficient < 0.3) {
      recommendations.push("Low clustering coefficient. Encourage triangle formation for redundancy.");
    }
    
    if (metrics.coherenceLevel < 0.7) {
      recommendations.push("Low network coherence. Refresh entanglements or reduce noise.");
    }
    
    if (metrics.loadBalance < 0.6) {
      recommendations.push("Load imbalance detected. Create alternative paths to distribute traffic.");
    }
    
    return recommendations;
  }
}

export enum TopologyChangeType {
  CREATE = 0,
  STRENGTHEN = 1,
  WEAKEN = 2,
  REMOVE = 3,
  REFRESH = 4
}

export class TopologyChange {
  type: TopologyChangeType;
  node1: NodeID;
  node2: NodeID;
  value: f64;
  score: f64;
  
  constructor(
    type: TopologyChangeType,
    node1: NodeID,
    node2: NodeID,
    value: f64
  ) {
    this.type = type;
    this.node1 = node1;
    this.node2 = node2;
    this.value = value;
    this.score = 0;
  }
}