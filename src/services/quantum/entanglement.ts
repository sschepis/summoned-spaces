/**
 * Quantum Entanglement Operations
 * Manages entanglement between quantum nodes
 */

import { NodeManager } from './node-manager';
import type { QuantumResult } from './types';

export class EntanglementManager {
  constructor(private nodeManager: NodeManager) {}

  /**
   * Create quantum entanglement between two nodes
   */
  async createEntanglement(nodeId1: string, nodeId2: string): Promise<QuantumResult> {
    const node1 = this.nodeManager.getNode(nodeId1);
    const node2 = this.nodeManager.getNode(nodeId2);

    if (!node1 || !node2) {
      return {
        success: false,
        metadata: new Map([['error', 1]]),
        entropy: 0
      };
    }

    try {
      // Calculate phase alignment
      const phase1 = this.nodeManager.calculateEigenPhase(node1);
      const phase2 = this.nodeManager.calculateEigenPhase(node2);
      const phaseDiff = Math.abs(phase1 - phase2);

      // Apply quantum phase rotation for alignment
      const targetPhase = (phase1 + phase2) / 2;
      this.nodeManager.applyPhaseRotation(node1, targetPhase - phase1);
      this.nodeManager.applyPhaseRotation(node2, targetPhase - phase2);

      // Calculate entanglement strength based on coherence
      const avgCoherence = (node1.coherence + node2.coherence) / 2.0;
      const entanglementStrength = avgCoherence * Math.exp(-phaseDiff);

      if (entanglementStrength > 0.3) {
        // Create bidirectional entanglement
        node1.entanglements.set(nodeId2, entanglementStrength);
        node2.entanglements.set(nodeId1, entanglementStrength);

        // Update coherence based on entanglement
        node1.coherence = Math.min(1.0, node1.coherence + entanglementStrength * 0.1);
        node2.coherence = Math.min(1.0, node2.coherence + entanglementStrength * 0.1);

        return {
          success: true,
          metadata: new Map([
            ['strength', entanglementStrength],
            ['coherence1', node1.coherence],
            ['coherence2', node2.coherence],
            ['phaseDifference', phaseDiff]
          ]),
          coherence: avgCoherence,
          fidelity: entanglementStrength
        };
      }

      return {
        success: false,
        metadata: new Map([
          ['reason', 0], // Insufficient coherence
          ['strength', entanglementStrength],
          ['threshold', 0.3]
        ]),
        coherence: avgCoherence
      };
    } catch (error) {
      console.error('Entanglement creation failed:', error);
      return {
        success: false,
        metadata: new Map([['error', 2]]),
        entropy: 0
      };
    }
  }

  /**
   * Get entanglement strength between two nodes
   */
  getEntanglementStrength(nodeId1: string, nodeId2: string): number {
    const node = this.nodeManager.getNode(nodeId1);
    return node?.entanglements.get(nodeId2) || 0;
  }

  /**
   * Check if nodes are entangled
   */
  areEntangled(nodeId1: string, nodeId2: string, minStrength: number = 0.3): boolean {
    return this.getEntanglementStrength(nodeId1, nodeId2) >= minStrength;
  }
}