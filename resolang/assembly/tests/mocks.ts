// assembly/tests/mocks.ts

import { QuantumNode } from "../core/network-base";
import { NodeID, Prime, Phase, EntanglementStrength } from "../types";

export class MockQuantumNode extends QuantumNode {
  constructor(id: NodeID, primes: Array<Prime>) {
    super(id, primes);
  }

  protected onActivate(): void {}
  protected onDeactivate(): void {}
  protected onEntangle(nodeId: NodeID, strength: EntanglementStrength): void {}
  protected onDisentangle(nodeId: NodeID, strength: EntanglementStrength): void {}
  protected calculateInitialPhase(prime: Prime): Phase {
    return 0.0;
  }
  protected calculateFrequency(prime: Prime): f64 {
    return 0.0;
  }
  protected onPhasesUpdated(): void {}
  protected onPhasesSynchronized(withNodeId: NodeID): void {}
  toString(): string {
    return "";
  }
}