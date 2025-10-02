/**
 * Database Types and Interfaces for Summoned Spaces
 * Supports both SQLite and PostgreSQL backends
 */
// ============================================
// Error Types
// ============================================
export class DatabaseError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'DatabaseError';
    }
}
export class QuantumResonanceError extends Error {
    resonance_data;
    constructor(message, resonance_data) {
        super(message);
        this.resonance_data = resonance_data;
        this.name = 'QuantumResonanceError';
    }
}
export class TransactionError extends Error {
    transaction_id;
    constructor(message, transaction_id) {
        super(message);
        this.transaction_id = transaction_id;
        this.name = 'TransactionError';
    }
}
