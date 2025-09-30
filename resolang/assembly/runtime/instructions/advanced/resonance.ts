// assembly/runtime/instructions/advanced/resonance.ts

import { IInstructionHandler } from "../types";
import { RISAEngine } from "../../../runtime";
import { RegisterType } from "../../state/registerState";
import { Argument } from "../../argument";

class ResonanceInstruction implements IInstructionHandler {
  execute(engine: RISAEngine, args: Argument[]): bool {
    if (args.length < 3) return false;
    const pVar = args[0].toString();
    const nVar = args[1].toString();
    const resultVar = args[2].toString();

    const registerState = engine.getRegisterState();
    const p = registerState.getRegister(pVar);
    const n = registerState.getRegister(nVar);
    
    // Calculate resonance using the rotation operator formula:
    // R(n)|p⟩ = e^(2πi log_p n)|p⟩
    // For simplicity, we'll store the phase as: 2π * (log(n) / log(p))
    const resonancePhase = 2.0 * Math.PI * (Math.log(n) / Math.log(p));
    
    // Store both the phase and magnitude (simplified representation)
    registerState.setRegister(resultVar + '_PHASE', resonancePhase, 5);
    registerState.setRegister(resultVar + '_MAGNITUDE', 1.0, 5); // Unit magnitude
    
    // Store a combined result value (phase as the primary result)
    registerState.setRegister(resultVar, resonancePhase, 5);

    return true;
  }
}
const Resonance = new ResonanceInstruction();

class FactorizeInstruction implements IInstructionHandler {
  execute(engine: RISAEngine, args: Argument[]): bool {
    if (args.length < 2) return false;
    const nVar = args[0].toString();
    const resultVar = args[1].toString();

    const registerState = engine.getRegisterState();
    const n = i32(registerState.getRegister(nVar));
    
    // Perform prime factorization
    const factors = this.factorize(n);
    
    // Store the number of factors
    registerState.setRegister(resultVar + '_COUNT', factors.length, 5);
    
    // Store individual factors
    for (let i = 0; i < factors.length; i++) {
      registerState.setRegister(resultVar + '_' + i.toString(), factors[i], 5);
    }
    
    // Store the product verification (should equal original n)
    let product = 1;
    for (let i = 0; i < factors.length; i++) {
      product *= factors[i];
    }
    registerState.setRegister(resultVar + '_PRODUCT', product, 5);
    
    // Store first factor as primary result
    if (factors.length > 0) {
      registerState.setRegister(resultVar, factors[0], 5);
    } else {
      registerState.setRegister(resultVar, n, 5); // n is prime
    }

    return true;
  }
  
  private factorize(n: i32): i32[] {
    const factors: i32[] = [];
    let num = n;
    let factor: i32 = 2;
    
    // Find all prime factors
    while (factor * factor <= num) {
      while (num % factor === 0) {
        factors.push(factor);
        num = num / factor;
      }
      factor++;
    }
    
    // If num is still greater than 1, then it's a prime factor
    if (num > 1) {
      factors.push(num);
    }
    
    return factors;
  }
}
const Factorize = new FactorizeInstruction();

export { Resonance, Factorize };