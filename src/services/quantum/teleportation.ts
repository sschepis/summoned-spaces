/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Quantum Memory Teleportation
 * Handles teleportation of memory fragments between entangled nodes
 */

import { NodeManager } from './node-manager';
import type { QuantumNode, QuantumResult, MemoryFragment } from './types';

export class TeleportationManager {
  private primeCache: number[] = [];

  constructor(
    private nodeManager: NodeManager,
    primeCache: number[]
  ) {
    this.primeCache = primeCache;
  }

  /**
   * Teleport memory fragment between entangled nodes
   */
  async teleportMemory(memoryData: string, sourceId: string, targetId: string): Promise<QuantumResult> {
    const source = this.nodeManager.getNode(sourceId);
    const target = this.nodeManager.getNode(targetId);

    if (!source || !target) {
      return {
        success: false,
        metadata: new Map([['error', 1]]),
        entropy: 0
      };
    }

    // Check entanglement
    const entanglementStrength = source.entanglements.get(targetId) || 0;
    if (entanglementStrength < 0.5) {
      return {
        success: false,
        metadata: new Map([
          ['reason', 1], // Insufficient entanglement
          ['strength', entanglementStrength],
          ['required', 0.5]
        ]),
        entropy: 0
      };
    }

    try {
      // Encode memory as holographic fragment
      const memoryFragment = this.encodeMemoryFragment(memoryData, source);
      
      // Apply quantum teleportation protocol
      const teleportationResult = this.performQuantumTeleportation(
        memoryFragment, source, target, entanglementStrength
      );

      if (teleportationResult.success) {
        // Update node states
        this.updateNodeAfterTeleportation(source, target, entanglementStrength);

        return {
          success: true,
          data: teleportationResult.data,
          metadata: new Map([
            ['fidelity', teleportationResult.fidelity || 0],
            ['entanglementStrength', entanglementStrength],
            ['sourceCoherence', source.coherence],
            ['targetCoherence', target.coherence]
          ]),
          fidelity: teleportationResult.fidelity
        };
      }

      return teleportationResult;
    } catch (error) {
      console.error('Memory teleportation failed:', error);
      return {
        success: false,
        metadata: new Map([['error', 3]]),
        entropy: 0
      };
    }
  }

  /**
   * Encode memory fragment
   */
  private encodeMemoryFragment(data: string, node: QuantumNode): MemoryFragment {
    const coeffs = new Map<number, number>();
    
    for (let i = 0; i < Math.min(data.length, 50); i++) {
      const charCode = data.charCodeAt(i);
      const prime = this.primeCache[i % this.primeCache.length];
      const amplitude = charCode / 255.0;
      coeffs.set(prime, amplitude);
    }

    return {
      coeffs,
      center: [data.length / 2.0, node.coherence],
      entropy: this.calculateFragmentEntropy(coeffs),
      nodeId: node.id
    };
  }

  /**
   * Perform quantum teleportation
   */
  private performQuantumTeleportation(
    fragment: MemoryFragment,
    _source: QuantumNode,
    target: QuantumNode,
    strength: number
  ): QuantumResult {
    const fidelity = target.coherence * strength;
    
    if (fidelity > 0.8) {
      return {
        success: true,
        data: fragment,
        metadata: new Map([['fidelity', fidelity]]),
        fidelity
      };
    }

    return {
      success: false,
      metadata: new Map([
        ['fidelity', fidelity],
        ['threshold', 0.8]
      ]),
      fidelity
    };
  }

  /**
   * Update node states after teleportation
   */
  private updateNodeAfterTeleportation(source: QuantumNode, target: QuantumNode, strength: number): void {
    // Reduce source coherence slightly due to information transfer
    source.coherence = Math.max(0.1, source.coherence - 0.05);
    
    // Increase target coherence due to information gain
    target.coherence = Math.min(1.0, target.coherence + strength * 0.1);
  }

  /**
   * Calculate fragment entropy
   */
  private calculateFragmentEntropy(coeffs: Map<number, number>): number {
    let entropy = 0;
    let totalAmplitude = 0;

    for (const amplitude of coeffs.values()) {
      totalAmplitude += amplitude * amplitude;
    }

    if (totalAmplitude > 0) {
      for (const amplitude of coeffs.values()) {
        const prob = (amplitude * amplitude) / totalAmplitude;
        if (prob > 0) {
          entropy -= prob * Math.log(prob);
        }
      }
    }

    return entropy;
  }
}