/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Quantum Consensus Mechanisms
 * Achieves consensus among quantum nodes
 */

import { hashToNumber } from '../utils/prime-utils';
import { NodeManager } from './node-manager';
import type { QuantumNode, QuantumResult, MemoryFragment } from './types';

export class ConsensusManager {
  private primeCache: number[] = [];

  constructor(
    private nodeManager: NodeManager,
    primeCache: number[]
  ) {
    this.primeCache = primeCache;
  }

  /**
   * Achieve quantum consensus among multiple nodes
   */
  async achieveConsensus(nodeIds: string[], proposalData: string): Promise<QuantumResult> {
    const nodes = nodeIds
      .map(id => this.nodeManager.getNode(id))
      .filter(n => n !== undefined) as QuantumNode[];
    
    if (nodes.length === 0) {
      return {
        success: false,
        metadata: new Map([['error', 1]]),
        entropy: 0
      };
    }

    try {
      // Encode proposal as holographic fragment
      const proposalFragment = this.encodeProposal(proposalData, nodes[0]);
      
      // Collect votes from each node
      const votes: { node: QuantumNode; vote: any; resonance: number }[] = [];
      let totalCoherence = 0;

      for (const node of nodes) {
        const nodeVote = this.generateNodeVote(node, proposalFragment);
        votes.push(nodeVote);
        totalCoherence += node.coherence;
      }

      // Calculate consensus using quantum superposition
      const consensusResult = this.calculateQuantumConsensus(votes);
      const avgCoherence = totalCoherence / nodes.length;
      
      // Decision based on consensus resonance
      const decision = consensusResult.resonance > 0.5;

      return {
        success: decision,
        data: {
          decision,
          resonance: consensusResult.resonance,
          participants: nodes.length,
          votes: votes.length
        },
        metadata: new Map([
          ['confidence', avgCoherence],
          ['participants', nodes.length],
          ['resonance', consensusResult.resonance],
          ['entropy', consensusResult.entropy]
        ]),
        coherence: avgCoherence,
        entropy: consensusResult.entropy
      };
    } catch (error) {
      console.error('Consensus achievement failed:', error);
      return {
        success: false,
        metadata: new Map([['error', 4]]),
        entropy: 0
      };
    }
  }

  /**
   * Encode proposal as memory fragment
   */
  private encodeProposal(data: string, node: QuantumNode): MemoryFragment {
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
   * Generate vote for a node
   */
  private generateNodeVote(node: QuantumNode, proposal: MemoryFragment): { 
    node: QuantumNode; 
    vote: any; 
    resonance: number 
  } {
    const resonance = this.calculateResonance(node, proposal);
    
    return {
      node,
      vote: { support: resonance > 0.5, confidence: node.coherence },
      resonance
    };
  }

  /**
   * Calculate quantum consensus
   */
  private calculateQuantumConsensus(
    votes: any[]
  ): { resonance: number; entropy: number } {
    let totalResonance = 0;
    let totalWeight = 0;

    for (const vote of votes) {
      const weight = vote.node.coherence;
      totalResonance += vote.resonance * weight;
      totalWeight += weight;
    }

    const avgResonance = totalWeight > 0 ? totalResonance / totalWeight : 0;
    const entropy = this.calculateVoteEntropy(votes);

    return { resonance: avgResonance, entropy };
  }

  /**
   * Calculate resonance between node and proposal
   */
  private calculateResonance(node: QuantumNode, proposal: MemoryFragment): number {
    const [p1, p2, p3] = node.primes;
    const proposalHash = hashToNumber(JSON.stringify(proposal));
    
    return Math.abs(Math.sin((p1 + p2 + p3 + proposalHash) * Math.PI / 1000.0));
  }

  /**
   * Calculate vote entropy
   */
  private calculateVoteEntropy(votes: any[]): number {
    const supportCount = votes.filter(v => v.vote.support).length;
    const total = votes.length;
    
    if (total === 0) return 0;
    
    const pSupport = supportCount / total;
    const pOppose = 1 - pSupport;
    
    let entropy = 0;
    if (pSupport > 0) entropy -= pSupport * Math.log(pSupport);
    if (pOppose > 0) entropy -= pOppose * Math.log(pOppose);
    
    return entropy;
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