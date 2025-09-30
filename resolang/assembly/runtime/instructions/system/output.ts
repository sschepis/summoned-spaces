// assembly/runtime/instructions/system/output.ts

import { IInstructionHandler } from "../types";
import { RISAEngine } from "../../../runtime";
import { Argument } from "../../argument";

class OutputInstruction implements IInstructionHandler {
  execute(engine: RISAEngine, args: Argument[]): bool {
    if (args.length < 1) {
        return false; // OUTPUT requires a value.
    }

    const value = engine.parseValue(args[0]);
    
    // Use AssemblyScript's trace function for output
    // This provides a way to output values for debugging
    trace("OUTPUT: " + value.toString());
    
    // Store the output in a register for retrieval if needed
    const registerState = engine.getRegisterState();
    if (registerState) {
      // Store the last output value in a special register
      registerState.setRegister('LAST_OUTPUT', value, 5);
    }
    
    return true;
  }
}

const output = new OutputInstruction();
export default output;