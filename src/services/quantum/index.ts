/**
 * Quantum Network Operations
 * Main export for refactored quantum network functionality
 * Replaces quantum-network-operations.ts and quantum-network-operations-safe.ts
 */

import { generatePrimes } from '../utils/prime-utils';
import { NodeManager } from './node-manager';
import { EntanglementManager } from './entanglement';
import { TeleportationManager } from './teleportation';
import { ConsensusManager } from './consensus';
import { AnomalyDetector } from './anomaly-detection';

// Re-export types
export type { QuantumNode, QuantumResult, NetworkStats } from './types';

/**
 * Main Quantum Network Operations class
 * Coordinates all quantum operations through specialized managers
 */
export class QuantumNetworkOperations {
  private nodeManager: NodeManager;
  private entanglementManager: EntanglementManager;
  private teleportationManager!: TeleportationManager;
  private consensusManager!: ConsensusManager;
  private anomalyDetector!: AnomalyDetector;
  private primeCache: number[] = [];

  constructor() {
    this.nodeManager = new NodeManager();
    this.entanglementManager = new EntanglementManager(this.nodeManager);
    
    // Initialize prime cache and dependent managers
    this.initializePrimes();
  }

  /**
   * Initialize prime cache and dependent managers
   */
  private async initializePrimes(): Promise<void> {
    try {
      this.primeCache = await generatePrimes(1000);
    } catch {
      // Fallback primes already handled
      this.primeCache = Array.from({length: 1000}, (_, i) => i * 2 + 3);
    }
    
    // Initialize managers that need prime cache
    this.teleportationManager = new TeleportationManager(this.nodeManager, this.primeCache);
    this.consensusManager = new ConsensusManager(this.nodeManager, this.primeCache);
    this.anomalyDetector = new AnomalyDetector(this.nodeManager, this.entanglementManager);
  }

  /**
   * Create a quantum node (async version for compatibility)
   */
  async createQuantumNode(nodeId: string, primeIndices?: [number, number, number]) {
    return this.nodeManager.createQuantumNode(nodeId, primeIndices);
  }

  /**
   * Create quantum entanglement between two nodes
   */
  async createEntanglement(nodeId1: string, nodeId2: string) {
    return this.entanglementManager.createEntanglement(nodeId1, nodeId2);
  }

  /**
   * Teleport memory between entangled nodes
   */
  async teleportMemory(memoryData: string, sourceId: string, targetId: string) {
    // Ensure managers are initialized
    if (!this.teleportationManager) {
      await this.initializePrimes();
    }
    return this.teleportationManager.teleportMemory(memoryData, sourceId, targetId);
  }

  /**
   * Achieve consensus among nodes
   */
  async achieveConsensus(nodeIds: string[], proposalData: string) {
    // Ensure managers are initialized
    if (!this.consensusManager) {
      await this.initializePrimes();
    }
    return this.consensusManager.achieveConsensus(nodeIds, proposalData);
  }

  /**
   * Detect anomalies in the network
   */
  async detectAnomalies(baselineEntropy: number = 0.5) {
    // Ensure managers are initialized
    if (!this.anomalyDetector) {
      await this.initializePrimes();
    }
    return this.anomalyDetector.detectAnomalies(baselineEntropy);
  }

  /**
   * Heal network disruptions
   */
  async healNetwork(affectedNodeIds: string[]) {
    // Ensure managers are initialized
    if (!this.anomalyDetector) {
      await this.initializePrimes();
    }
    return this.anomalyDetector.healNetwork(affectedNodeIds);
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string) {
    return this.nodeManager.getNode(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes() {
    return this.nodeManager.getAllNodes();
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    const nodes = this.nodeManager.getAllNodes();
    const totalEntanglements = nodes.reduce((sum, node) => sum + node.entanglements.size, 0);
    const avgCoherence = nodes.length > 0 ? 
      nodes.reduce((sum, node) => sum + node.coherence, 0) / nodes.length : 0;

    return {
      totalNodes: nodes.length,
      totalEntanglements,
      avgCoherence
    };
  }
}

// Export singleton instance for backward compatibility
export const quantumNetworkOps = new QuantumNetworkOperations();