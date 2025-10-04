/**
 * Quantum Network Anomaly Detection and Healing
 * Detects anomalies and performs self-healing on quantum network
 */

import { entropyRate } from '../utils/prime-utils';
import { NodeManager } from './node-manager';
import { EntanglementManager } from './entanglement';
import type { QuantumNode, QuantumResult, Anomaly, HealingResult } from './types';

export class AnomalyDetector {
  constructor(
    private nodeManager: NodeManager,
    private entanglementManager: EntanglementManager
  ) {}

  /**
   * Detect anomalies in the quantum network
   */
  async detectAnomalies(baselineEntropy: number = 0.5): Promise<QuantumResult> {
    const anomalyThreshold = 0.3;
    let anomalyCount = 0;
    let totalDeviation = 0;
    const anomalies: Anomaly[] = [];

    const nodes = this.nodeManager.getAllNodes();

    for (const node of nodes) {
      const nodeEntropy = await entropyRate(node.phaseRing);
      const deviation = Math.abs(nodeEntropy - baselineEntropy);

      if (deviation > anomalyThreshold) {
        anomalyCount++;
        totalDeviation += deviation;
        anomalies.push({ nodeId: node.id, deviation, entropy: nodeEntropy });
      }
    }

    const avgDeviation = anomalyCount > 0 ? totalDeviation / anomalyCount : 0;

    return {
      success: anomalyCount === 0,
      data: { anomalies },
      metadata: new Map([
        ['anomalyCount', anomalyCount],
        ['avgDeviation', avgDeviation],
        ['threshold', anomalyThreshold],
        ['totalNodes', nodes.length]
      ]),
      entropy: avgDeviation
    };
  }

  /**
   * Self-heal network disruptions
   */
  async healNetwork(affectedNodeIds: string[]): Promise<QuantumResult> {
    const affectedNodes = affectedNodeIds
      .map(id => this.nodeManager.getNode(id))
      .filter(n => n !== undefined) as QuantumNode[];
    
    const healthyNodes = this.nodeManager.getAllNodes().filter(n => 
      !affectedNodeIds.includes(n.id) && n.coherence > 0.7
    );

    if (healthyNodes.length === 0) {
      return {
        success: false,
        metadata: new Map([['error', 1]]), // No healthy nodes
        entropy: 0
      };
    }

    let healedCount = 0;
    const healingResults: HealingResult[] = [];

    for (const affectedNode of affectedNodes) {
      // Find best healthy node (highest coherence)
      const bestHealthy = healthyNodes.reduce((best, current) => 
        current.coherence > best.coherence ? current : best
      );

      try {
        // Apply stabilization
        const stabilized = this.stabilizeNode(affectedNode, bestHealthy);
        
        if (stabilized) {
          // Re-establish entanglement
          const entanglementResult = await this.entanglementManager.createEntanglement(
            affectedNode.id, 
            bestHealthy.id
          );
          
          if (entanglementResult.success) {
            healedCount++;
            healingResults.push({
              nodeId: affectedNode.id,
              healed: true,
              coherence: affectedNode.coherence
            });
          }
        }
      } catch (error) {
        console.error(`Failed to heal node ${affectedNode.id}:`, error);
        healingResults.push({
          nodeId: affectedNode.id,
          healed: false,
          coherence: affectedNode.coherence
        });
      }
    }

    const healingRate = healedCount / affectedNodes.length;

    return {
      success: healedCount > 0,
      data: { healingResults },
      metadata: new Map([
        ['healedCount', healedCount],
        ['healingRate', healingRate],
        ['affectedNodes', affectedNodes.length],
        ['healthyNodes', healthyNodes.length]
      ]),
      fidelity: healingRate
    };
  }

  /**
   * Stabilize an affected node using a healthy helper node
   */
  private stabilizeNode(affected: QuantumNode, helper: QuantumNode): boolean {
    if (helper.coherence > 0.8) {
      affected.coherence = Math.min(1.0, affected.coherence + 0.2);
      return true;
    }
    return false;
  }
}