import { NodeID } from '../../resonnet/assembly/prn-node';
import { EntanglementLink, NodeMetadata } from "resolang";
import { EntanglementGraphRouter } from './egr-router';
import { PrimeResonanceDHT } from './pr-dht';
import { DTOOptimizer, TopologyMetrics } from './dto-optimizer';

/**
 * Network Health Monitor (NHM)
 * 
 * Provides real-time monitoring and visualization of the Prime Resonance
 * Network's health, including coherence levels, entanglement strengths,
 * and overall network performance. Uses quantum-inspired metrics to
 * assess network state and predict potential issues.
 * 
 * Key Features:
 * - Real-time coherence monitoring
 * - Entanglement strength visualization
 * - Network topology health assessment
 * - Predictive anomaly detection
 * - Performance metrics tracking
 */

export enum HealthStatus {
  EXCELLENT = 0,
  GOOD = 1,
  FAIR = 2,
  POOR = 3,
  CRITICAL = 4
}

export class NetworkHealthMetrics {
  timestamp: u64;
  overallHealth: HealthStatus;
  averageCoherence: f64;
  averageEntanglement: f64;
  networkConnectivity: f64;
  quantumFidelity: f64;
  nodeCount: u32;
  activeLinks: u32;
  dataFlowRate: f64;      // MB/s
  latencyP50: f64;        // ms
  latencyP99: f64;        // ms
  errorRate: f64;         // errors per second
  
  constructor() {
    this.timestamp = Date.now();
    this.overallHealth = HealthStatus.GOOD;
    this.averageCoherence = 1.0;
    this.averageEntanglement = 0.5;
    this.networkConnectivity = 1.0;
    this.quantumFidelity = 1.0;
    this.nodeCount = 0;
    this.activeLinks = 0;
    this.dataFlowRate = 0;
    this.latencyP50 = 0;
    this.latencyP99 = 0;
    this.errorRate = 0;
  }
  
  calculateOverallHealth(): void {
    const score = (this.averageCoherence * 0.3 +
                  this.averageEntanglement * 0.2 +
                  this.networkConnectivity * 0.2 +
                  this.quantumFidelity * 0.2 +
                  (1.0 - this.errorRate / 10.0) * 0.1);
    
    if (score >= 0.9) {
      this.overallHealth = HealthStatus.EXCELLENT;
    } else if (score >= 0.7) {
      this.overallHealth = HealthStatus.GOOD;
    } else if (score >= 0.5) {
      this.overallHealth = HealthStatus.FAIR;
    } else if (score >= 0.3) {
      this.overallHealth = HealthStatus.POOR;
    } else {
      this.overallHealth = HealthStatus.CRITICAL;
    }
  }
}

export class NodeHealthInfo {
  nodeId: NodeID;
  status: HealthStatus;
  coherence: f64;
  entanglementCount: u32;
  averageEntanglementStrength: f64;
  lastSeen: u64;
  cpuUsage: f64;
  memoryUsage: f64;
  messagesSent: u64;
  messagesReceived: u64;
  errors: u32;
  
  constructor(nodeId: NodeID) {
    this.nodeId = nodeId;
    this.status = HealthStatus.GOOD;
    this.coherence = 1.0;
    this.entanglementCount = 0;
    this.averageEntanglementStrength = 0;
    this.lastSeen = Date.now();
    this.cpuUsage = 0;
    this.memoryUsage = 0;
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.errors = 0;
  }
  
  updateStatus(): void {
    const timeSinceLastSeen = Date.now() - this.lastSeen;
    
    if (timeSinceLastSeen > 60000) { // 1 minute
      this.status = HealthStatus.CRITICAL;
    } else if (this.coherence < 0.3 || this.errors > 100) {
      this.status = HealthStatus.POOR;
    } else if (this.coherence < 0.6 || this.errors > 50) {
      this.status = HealthStatus.FAIR;
    } else if (this.coherence < 0.8 || this.errors > 10) {
      this.status = HealthStatus.GOOD;
    } else {
      this.status = HealthStatus.EXCELLENT;
    }
  }
}

export class LinkHealthInfo {
  node1: NodeID;
  node2: NodeID;
  strength: f64;
  coherence: f64;
  latency: f64;
  throughput: f64;
  packetLoss: f64;
  lastUpdate: u64;
  
  constructor(node1: NodeID, node2: NodeID) {
    this.node1 = node1;
    this.node2 = node2;
    this.strength = 0;
    this.coherence = 0;
    this.latency = 0;
    this.throughput = 0;
    this.packetLoss = 0;
    this.lastUpdate = Date.now();
  }
  
  getHealthScore(): f64 {
    return (this.strength * 0.3 +
            this.coherence * 0.3 +
            (1.0 / (1.0 + this.latency / 100.0)) * 0.2 +
            (this.throughput / 100.0) * 0.1 +
            (1.0 - this.packetLoss) * 0.1);
  }
}

export class NetworkHealthMonitor {
  nodeId: NodeID;
  router: EntanglementGraphRouter;
  dht: PrimeResonanceDHT;
  optimizer: DTOOptimizer;
  
  // Health tracking
  nodeHealth: Map<NodeID, NodeHealthInfo>;
  linkHealth: Map<string, LinkHealthInfo>;
  metricsHistory: Array<NetworkHealthMetrics>;
  
  // Monitoring configuration
  monitoringInterval: u64;
  historySize: i32;
  alertThresholds: AlertThresholds;
  
  // Real-time data
  currentMetrics: NetworkHealthMetrics;
  activeAlerts: Array<HealthAlert>;
  
  constructor(
    nodeId: NodeID,
    router: EntanglementGraphRouter,
    dht: PrimeResonanceDHT,
    optimizer: DTOOptimizer
  ) {
    this.nodeId = nodeId;
    this.router = router;
    this.dht = dht;
    this.optimizer = optimizer;
    
    this.nodeHealth = new Map<NodeID, NodeHealthInfo>();
    this.linkHealth = new Map<string, LinkHealthInfo>();
    this.metricsHistory = new Array<NetworkHealthMetrics>();
    
    this.monitoringInterval = 5000; // 5 seconds
    this.historySize = 1000;
    this.alertThresholds = new AlertThresholds();
    
    this.currentMetrics = new NetworkHealthMetrics();
    this.activeAlerts = new Array<HealthAlert>();
  }
  
  /**
   * Start monitoring the network
   */
  startMonitoring(): void {
    // In a real implementation, this would set up periodic monitoring
    this.updateMetrics();
  }
  
  /**
   * Update all health metrics
   */
  updateMetrics(): void {
    const metrics = new NetworkHealthMetrics();
    
    // Update node health
    this.updateNodeHealth();
    
    // Update link health
    this.updateLinkHealth();
    
    // Calculate aggregate metrics
    metrics.nodeCount = u32(this.nodeHealth.size);
    metrics.activeLinks = u32(this.linkHealth.size);
    
    // Calculate average coherence
    let totalCoherence: f64 = 0;
    let coherenceCount = 0;
    
    const nodeHealthValues = this.nodeHealth.values();
    for (let i = 0; i < nodeHealthValues.length; i++) {
      totalCoherence += nodeHealthValues[i].coherence;
      coherenceCount++;
    }
    
    metrics.averageCoherence = coherenceCount > 0 ? 
      totalCoherence / f64(coherenceCount) : 0;
    
    // Calculate average entanglement
    let totalEntanglement: f64 = 0;
    let entanglementCount = 0;
    
    const linkHealthValues = this.linkHealth.values();
    for (let i = 0; i < linkHealthValues.length; i++) {
      totalEntanglement += linkHealthValues[i].strength;
      entanglementCount++;
    }
    
    metrics.averageEntanglement = entanglementCount > 0 ?
      totalEntanglement / f64(entanglementCount) : 0;
    
    // Calculate network connectivity
    const maxPossibleLinks = (metrics.nodeCount * (metrics.nodeCount - 1)) / 2;
    metrics.networkConnectivity = maxPossibleLinks > 0 ?
      f64(metrics.activeLinks) / f64(maxPossibleLinks) : 0;
    
    // Calculate quantum fidelity (simplified)
    metrics.quantumFidelity = metrics.averageCoherence * 
                             Math.sqrt(metrics.averageEntanglement);
    
    // Calculate latency percentiles
    const latencies = this.collectLatencies();
    if (latencies.length > 0) {
      latencies.sort((a, b) => a > b ? 1 : -1);
      const p50Index = i32(latencies.length * 0.5);
      const p99Index = i32(latencies.length * 0.99);
      metrics.latencyP50 = latencies[p50Index];
      metrics.latencyP99 = latencies[p99Index];
    }
    
    // Calculate error rate
    let totalErrors = 0;
    for (let i = 0; i < nodeHealthValues.length; i++) {
      totalErrors += nodeHealthValues[i].errors;
    }
    metrics.errorRate = f64(totalErrors) / (f64(this.monitoringInterval) / 1000.0);
    
    // Calculate overall health
    metrics.calculateOverallHealth();
    
    // Store metrics
    this.currentMetrics = metrics;
    this.metricsHistory.push(metrics);
    
    // Maintain history size
    if (this.metricsHistory.length > this.historySize) {
      this.metricsHistory.shift();
    }
    
    // Check for alerts
    this.checkAlerts(metrics);
  }
  
  /**
   * Update node health information
   */
  private updateNodeHealth(): void {
    // Get all nodes from router graph
    const nodes = this.router.graph.nodes.keys();
    
    for (let i = 0; i < nodes.length; i++) {
      const nodeId = nodes[i];
      
      let health = this.nodeHealth.get(nodeId);
      if (!health) {
        health = new NodeHealthInfo(nodeId);
        this.nodeHealth.set(nodeId, health);
      }
      
      // Update node metrics
      const node = this.router.graph.nodes.get(nodeId);
      if (node) {
        health.coherence = node.entangledNode.coherence;
        health.entanglementCount = u32(node.entanglementMap.size);
        
        // Calculate average entanglement strength
        let totalStrength: f64 = 0;
        const strengths = node.entanglementMap.values();
        for (let j = 0; j < strengths.length; j++) {
          totalStrength += strengths[j];
        }
        
        health.averageEntanglementStrength = health.entanglementCount > 0 ?
          totalStrength / f64(health.entanglementCount) : 0;
        
        health.lastSeen = Date.now();
      }
      
      health.updateStatus();
    }
    
    // Remove stale nodes
    const staleNodes = new Array<NodeID>();
    const healthKeys = this.nodeHealth.keys();
    
    for (let i = 0; i < healthKeys.length; i++) {
      const nodeId = healthKeys[i];
      const health = this.nodeHealth.get(nodeId);
      if (health && Date.now() - health.lastSeen > 300000) { // 5 minutes
        staleNodes.push(nodeId);
      }
    }
    
    for (let i = 0; i < staleNodes.length; i++) {
      this.nodeHealth.delete(staleNodes[i]);
    }
  }
  
  /**
   * Update link health information
   */
  private updateLinkHealth(): void {
    // Get all links from router graph
    const nodeIds = this.router.graph.adjacencyList.keys();
    
    for (let i = 0; i < nodeIds.length; i++) {
      const node1 = nodeIds[i];
      const neighbors = this.router.graph.getNeighbors(node1);
      const neighborIds = neighbors.keys();
      
      for (let j = 0; j < neighborIds.length; j++) {
        const node2 = neighborIds[j];
        
        // Only process each link once
        if (node1 < node2) {
          const linkKey = `${node1}-${node2}`;
          
          let health = this.linkHealth.get(linkKey);
          if (!health) {
            health = new LinkHealthInfo(node1, node2);
            this.linkHealth.set(linkKey, health);
          }
          
          // Update link metrics
          health.strength = neighbors.get(node2) || 0;
          
          // Get coherence from nodes
          const node1Health = this.nodeHealth.get(node1);
          const node2Health = this.nodeHealth.get(node2);
          
          if (node1Health && node2Health) {
            health.coherence = (node1Health.coherence + node2Health.coherence) / 2.0;
          }
          
          // Estimate latency based on strength
          health.latency = 100.0 * (1.0 - health.strength);
          
          // Estimate throughput
          health.throughput = 100.0 * health.strength * health.coherence;
          
          health.lastUpdate = Date.now();
        }
      }
    }
  }
  
  /**
   * Collect latency measurements
   */
  private collectLatencies(): Array<f64> {
    const latencies = new Array<f64>();
    
    const linkValues = this.linkHealth.values();
    for (let i = 0; i < linkValues.length; i++) {
      latencies.push(linkValues[i].latency);
    }
    
    return latencies;
  }
  
  /**
   * Check for alert conditions
   */
  private checkAlerts(metrics: NetworkHealthMetrics): void {
    const newAlerts = new Array<HealthAlert>();
    
    // Check coherence threshold
    if (metrics.averageCoherence < this.alertThresholds.minCoherence) {
      newAlerts.push(new HealthAlert(
        AlertType.LOW_COHERENCE,
        AlertSeverity.WARNING,
        `Average coherence ${this.formatNumber(metrics.averageCoherence, 2)} below threshold ${this.alertThresholds.minCoherence}`
      ));
    }
    
    // Check entanglement threshold
    if (metrics.averageEntanglement < this.alertThresholds.minEntanglement) {
      newAlerts.push(new HealthAlert(
        AlertType.LOW_ENTANGLEMENT,
        AlertSeverity.WARNING,
        `Average entanglement ${this.formatNumber(metrics.averageEntanglement, 2)} below threshold ${this.alertThresholds.minEntanglement}`
      ));
    }
    
    // Check connectivity
    if (metrics.networkConnectivity < this.alertThresholds.minConnectivity) {
      newAlerts.push(new HealthAlert(
        AlertType.LOW_CONNECTIVITY,
        AlertSeverity.ERROR,
        `Network connectivity ${this.formatNumber(metrics.networkConnectivity, 2)} below threshold ${this.alertThresholds.minConnectivity}`
      ));
    }
    
    // Check error rate
    if (metrics.errorRate > this.alertThresholds.maxErrorRate) {
      newAlerts.push(new HealthAlert(
        AlertType.HIGH_ERROR_RATE,
        AlertSeverity.ERROR,
        `Error rate ${this.formatNumber(metrics.errorRate, 2)}/s exceeds threshold ${this.alertThresholds.maxErrorRate}/s`
      ));
    }
    
    // Check latency
    if (metrics.latencyP99 > this.alertThresholds.maxLatencyP99) {
      newAlerts.push(new HealthAlert(
        AlertType.HIGH_LATENCY,
        AlertSeverity.WARNING,
        `P99 latency ${this.formatNumber(metrics.latencyP99, 0)}ms exceeds threshold ${this.alertThresholds.maxLatencyP99}ms`
      ));
    }
    
    // Check for node failures
    const nodeHealthValues = this.nodeHealth.values();
    for (let i = 0; i < nodeHealthValues.length; i++) {
      const node = nodeHealthValues[i];
      if (node.status == HealthStatus.CRITICAL) {
        newAlerts.push(new HealthAlert(
          AlertType.NODE_FAILURE,
          AlertSeverity.CRITICAL,
          `Node ${node.nodeId} is in critical state`
        ));
      }
    }
    
    // Update active alerts
    this.activeAlerts = newAlerts;
  }
  
  /**
   * Get visualization data for the network
   */
  getVisualizationData(): NetworkVisualization {
    const viz = new NetworkVisualization();
    
    // Add nodes
    const nodeHealthKeys = this.nodeHealth.keys();
    for (let i = 0; i < nodeHealthKeys.length; i++) {
      const nodeId = nodeHealthKeys[i];
      const health = this.nodeHealth.get(nodeId);
      if (health) {
        viz.nodes.push(new NodeVisualization(
          nodeId,
          health.coherence,
          health.status,
          f64(health.entanglementCount)
        ));
      }
    }
    
    // Add links
    const linkHealthKeys = this.linkHealth.keys();
    for (let i = 0; i < linkHealthKeys.length; i++) {
      const linkKey = linkHealthKeys[i];
      const link = this.linkHealth.get(linkKey);
      if (link) {
        viz.links.push(new LinkVisualization(
          link.node1,
          link.node2,
          link.strength,
          link.coherence,
          link.getHealthScore()
        ));
      }
    }
    
    // Set metrics
    viz.metrics = this.currentMetrics;
    
    return viz;
  }
  
  /**
   * Get health report
   */
  getHealthReport(): HealthReport {
    const report = new HealthReport();
    
    report.timestamp = Date.now();
    report.overallStatus = this.currentMetrics.overallHealth;
    report.metrics = this.currentMetrics;
    report.alerts = this.activeAlerts;
    
    // Add node summary
    const nodeHealthValues = this.nodeHealth.values();
    for (let i = 0; i < nodeHealthValues.length; i++) {
      const node = nodeHealthValues[i];
      switch (node.status) {
        case HealthStatus.EXCELLENT:
          report.excellentNodes++;
          break;
        case HealthStatus.GOOD:
          report.goodNodes++;
          break;
        case HealthStatus.FAIR:
          report.fairNodes++;
          break;
        case HealthStatus.POOR:
          report.poorNodes++;
          break;
        case HealthStatus.CRITICAL:
          report.criticalNodes++;
          break;
      }
    }
    
    // Add recommendations
    report.recommendations = this.generateRecommendations();
    
    return report;
  }
  
  /**
   * Generate health recommendations
   */
  private generateRecommendations(): Array<string> {
    const recommendations = new Array<string>();
    
    if (this.currentMetrics.averageCoherence < 0.7) {
      recommendations.push("Consider refreshing quantum states to improve coherence");
    }
    
    if (this.currentMetrics.averageEntanglement < 0.5) {
      recommendations.push("Strengthen entanglement links between nodes");
    }
    
    if (this.currentMetrics.networkConnectivity < 0.3) {
      recommendations.push("Add more connections to improve network resilience");
    }
    
    if (this.currentMetrics.errorRate > 5.0) {
      recommendations.push("Investigate error sources and improve error handling");
    }
    
    // Get topology recommendations
    const topoRecommendations = this.optimizer.getRecommendations();
    for (let i = 0; i < topoRecommendations.length; i++) {
      recommendations.push(topoRecommendations[i]);
    }
    
    return recommendations;
  }
  
  /**
   * Predict future network health
   */
  predictHealth(horizonMinutes: i32): HealthPrediction {
    const prediction = new HealthPrediction();
    prediction.horizon = horizonMinutes;
    
    if (this.metricsHistory.length < 10) {
      prediction.confidence = 0.1;
      prediction.predictedStatus = this.currentMetrics.overallHealth;
      return prediction;
    }
    
    // Simple trend analysis
    const recentMetrics = this.metricsHistory.slice(-20);
    
    // Calculate trends
    let coherenceTrend: f64 = 0;
    let entanglementTrend: f64 = 0;
    let errorTrend: f64 = 0;
    
    for (let i = 1; i < recentMetrics.length; i++) {
      coherenceTrend += recentMetrics[i].averageCoherence - recentMetrics[i-1].averageCoherence;
      entanglementTrend += recentMetrics[i].averageEntanglement - recentMetrics[i-1].averageEntanglement;
      errorTrend += recentMetrics[i].errorRate - recentMetrics[i-1].errorRate;
    }
    
    coherenceTrend /= f64(recentMetrics.length - 1);
    entanglementTrend /= f64(recentMetrics.length - 1);
    errorTrend /= f64(recentMetrics.length - 1);
    
    // Project forward
    const stepsAhead = horizonMinutes * 60 / (i32(this.monitoringInterval) / 1000);
    
    const projectedCoherence = this.currentMetrics.averageCoherence + coherenceTrend * f64(stepsAhead);
    const projectedEntanglement = this.currentMetrics.averageEntanglement + entanglementTrend * f64(stepsAhead);
    const projectedErrorRate = this.currentMetrics.errorRate + errorTrend * f64(stepsAhead);
    
    // Calculate projected health
    const projectedScore = (Math.max(0, Math.min(1, projectedCoherence)) * 0.4 +
                           Math.max(0, Math.min(1, projectedEntanglement)) * 0.3 +
                           Math.max(0, 1.0 - projectedErrorRate / 10.0) * 0.3);
    
    if (projectedScore >= 0.9) {
      prediction.predictedStatus = HealthStatus.EXCELLENT;
    } else if (projectedScore >= 0.7) {
      prediction.predictedStatus = HealthStatus.GOOD;
    } else if (projectedScore >= 0.5) {
      prediction.predictedStatus = HealthStatus.FAIR;
    } else if (projectedScore >= 0.3) {
      prediction.predictedStatus = HealthStatus.POOR;
    } else {
      prediction.predictedStatus = HealthStatus.CRITICAL;
    }
    
    // Calculate confidence based on trend stability
    const trendStability = 1.0 / (1.0 + Math.abs(coherenceTrend) + Math.abs(entanglementTrend) + Math.abs(errorTrend));
    prediction.confidence = Math.min(0.9, trendStability);
    
    // Add risk factors
    if (projectedCoherence < 0.3) {
      prediction.riskFactors.push("Coherence degradation risk");
    }
    if (projectedEntanglement < 0.2) {
      prediction.riskFactors.push("Network fragmentation risk");
    }
    if (projectedErrorRate > 10.0) {
      prediction.riskFactors.push("System instability risk");
    }
    
    return prediction;
  }
  
  /**
   * Format number to string with decimal places
   */
  private formatNumber(value: f64, decimals: i32): string {
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.round(value * multiplier) / multiplier;
    
    if (decimals == 0) {
      return i32(rounded).toString();
    }
    
    const intPart = i32(rounded);
    const fracPart = i32((rounded - f64(intPart)) * multiplier);
    
    let result = intPart.toString() + ".";
    let fracStr = fracPart.toString();
    
    // Pad with zeros if needed
    while (fracStr.length < decimals) {
      fracStr = "0" + fracStr;
    }
    
    return result + fracStr;
  }
}

// Supporting classes

export class AlertThresholds {
  minCoherence: f64 = 0.6;
  minEntanglement: f64 = 0.4;
  minConnectivity: f64 = 0.2;
  maxErrorRate: f64 = 5.0;
  maxLatencyP99: f64 = 200.0;
}

export enum AlertType {
  LOW_COHERENCE = 0,
  LOW_ENTANGLEMENT = 1,
  LOW_CONNECTIVITY = 2,
  HIGH_ERROR_RATE = 3,
  HIGH_LATENCY = 4,
  NODE_FAILURE = 5
}

export enum AlertSeverity {
  INFO = 0,
  WARNING = 1,
  ERROR = 2,
  CRITICAL = 3
}

export class HealthAlert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: u64;
  
  constructor(type: AlertType, severity: AlertSeverity, message: string) {
    this.type = type;
    this.severity = severity;
    this.message = message;
    this.timestamp = Date.now();
  }
}

export class NetworkVisualization {
  nodes: Array<NodeVisualization>;
  links: Array<LinkVisualization>;
  metrics: NetworkHealthMetrics;
  
  constructor() {
    this.nodes = new Array<NodeVisualization>();
    this.links = new Array<LinkVisualization>();
    this.metrics = new NetworkHealthMetrics();
  }
}

export class NodeVisualization {
  id: NodeID;
  coherence: f64;
  status: HealthStatus;
  size: f64;
  
  constructor(id: NodeID, coherence: f64, status: HealthStatus, size: f64) {
    this.id = id;
    this.coherence = coherence;
    this.status = status;
    this.size = size;
  }
}

export class LinkVisualization {
  source: NodeID;
  target: NodeID;
  strength: f64;
  coherence: f64;
  health: f64;
  
  constructor(
    source: NodeID,
    target: NodeID,
    strength: f64,
    coherence: f64,
    health: f64
  ) {
    this.source = source;
    this.target = target;
    this.strength = strength;
    this.coherence = coherence;
    this.health = health;
  }
}

export class HealthReport {
  timestamp: u64;
  overallStatus: HealthStatus;
  metrics: NetworkHealthMetrics;
  alerts: Array<HealthAlert>;
  excellentNodes: u32 = 0;
  goodNodes: u32 = 0;
  fairNodes: u32 = 0;
  poorNodes: u32 = 0;
  criticalNodes: u32 = 0;
  recommendations: Array<string>;
  
  constructor() {
    this.timestamp = Date.now();
    this.overallStatus = HealthStatus.GOOD;
    this.metrics = new NetworkHealthMetrics();
    this.alerts = new Array<HealthAlert>();
    this.recommendations = new Array<string>();
  }
}

export class HealthPrediction {
  horizon: i32;
  predictedStatus: HealthStatus;
  confidence: f64;
  riskFactors: Array<string>;
  
  constructor() {
    this.horizon = 0;
    this.predictedStatus = HealthStatus.GOOD;
    this.confidence = 0;
    this.riskFactors = new Array<string>();
  }
}