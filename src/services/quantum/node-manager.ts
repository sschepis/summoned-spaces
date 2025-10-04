/**
 * Quantum Node Management
 * Handles creation and management of quantum nodes
 */

import { generatePrimes, safeResolangCall } from '../utils/prime-utils';
import type { QuantumNode } from './types';

export class NodeManager {
  private nodes: Map<string, QuantumNode> = new Map();
  private primeCache: number[] = [];

  constructor() {
    // Initialize with fallback primes synchronously
    this.initializePrimes();
  }

  /**
   * Initialize prime cache
   */
  private async initializePrimes(): Promise<void> {
    try {
      this.primeCache = await generatePrimes(1000);
    } catch {
      // Fallback primes already set
      console.log('Using fallback primes in node manager');
    }
  }

  /**
   * Create a quantum node with prime resonance identity
   */
  async createQuantumNode(nodeId: string, primeIndices?: [number, number, number]): Promise<QuantumNode> {
    const indices = primeIndices || [
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 100) + 100,
      Math.floor(Math.random() * 100) + 200
    ];

    const primes: [number, number, number] = [
      this.primeCache[indices[0]] || 2,
      this.primeCache[indices[1]] || 3,
      this.primeCache[indices[2]] || 5
    ];

    // Initialize phase ring based on prime properties
    const phaseRing = [
      (primes[0] % 100) / 100.0 * 2 * Math.PI,
      (primes[1] % 100) / 100.0 * 2 * Math.PI,
      (primes[2] % 100) / 100.0 * 2 * Math.PI
    ];

    // Calculate initial coherence from geometric mean of primes
    const primeProduct = primes[0] * primes[1] * primes[2];
    const geometricMean = Math.pow(primeProduct, 1.0 / 3.0);
    const initialCoherence = Math.min(1.0, Math.log(geometricMean) / 10.0);

    const node: QuantumNode = {
      id: nodeId,
      primes,
      phaseRing,
      coherence: initialCoherence,
      entanglements: new Map(),
      holographicField: await safeResolangCall('createHolographicEncoding')
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): QuantumNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): QuantumNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Calculate eigenphase for a node
   */
  calculateEigenPhase(node: QuantumNode): number {
    const [p1, p2, p3] = node.primes;
    return (p1 + p2 + p3) * Math.PI / 1000.0;
  }

  /**
   * Apply phase rotation to a node
   */
  applyPhaseRotation(node: QuantumNode, phaseShift: number): void {
    for (let i = 0; i < node.phaseRing.length; i++) {
      node.phaseRing[i] = (node.phaseRing[i] + phaseShift) % (2 * Math.PI);
    }
  }

  /**
   * Get node map for external access
   */
  getNodesMap(): Map<string, QuantumNode> {
    return this.nodes;
  }
}