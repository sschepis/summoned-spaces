/**
 * Quaternion Export Wrappers
 * Provides WebAssembly-compatible exports for quaternion classes
 */

import {
  Quaternion,
  SplitPrimeFactorizer,
  QuaternionicResonanceField,
  TwistDynamics,
  QuaternionicProjector,
  QuaternionPool
} from './quaternion';

import {
  EntangledQuaternionPair,
  QuaternionicSynchronizer,
  QuaternionicAgent,
  transmitQuaternionicMessage
} from './quaternion-entanglement';

// Quaternion constructor and methods
export function createQuaternion(w: f64, x: f64, y: f64, z: f64): Quaternion {
  return new Quaternion(w, x, y, z);
}

export function quaternionMultiply(q1: Quaternion, q2: Quaternion): Quaternion {
  return q1.multiply(q2);
}

export function quaternionConjugate(q: Quaternion): Quaternion {
  return q.conjugate();
}

export function quaternionNorm(q: Quaternion): f64 {
  return q.norm();
}

export function quaternionNormalize(q: Quaternion): Quaternion {
  return q.normalize();
}

export function quaternionToBlochVector(q: Quaternion): Float64Array {
  return q.toBlochVector();
}

export function quaternionExp(q: Quaternion): Quaternion {
  return q.exp();
}

export function quaternionRotate(q: Quaternion, angle: f64): Quaternion {
  return q.rotate(angle);
}

export function quaternionToString(q: Quaternion): string {
  return q.toString();
}

export function quaternionToJSON(q: Quaternion): string {
  return q.toJSON();
}

// SplitPrimeFactorizer methods
export function isSplitPrime(p: u32): boolean {
  return SplitPrimeFactorizer.isSplitPrime(p);
}

export function createQuaternionFromPrime(p: u32): Quaternion | null {
  return SplitPrimeFactorizer.createQuaternion(p);
}

// QuaternionicResonanceField constructor and methods
export function createQuaternionicResonanceField(): QuaternionicResonanceField {
  return new QuaternionicResonanceField();
}

export function addPrimeToResonanceField(field: QuaternionicResonanceField, p: u32): boolean {
  return field.addPrime(p);
}

export function computeResonanceField(field: QuaternionicResonanceField, x: f64, t: f64): Quaternion {
  return field.computeField(x, t);
}

export function optimizeResonanceFieldParameters(field: QuaternionicResonanceField, target: Quaternion, iterations: i32 = 100): void {
  field.optimizeParameters(target, iterations);
}

// TwistDynamics constructor and methods
export function createTwistDynamics(): TwistDynamics {
  return new TwistDynamics();
}

export function computeTwistAngleFromQuaternion(dynamics: TwistDynamics, q: Quaternion): f64 {
  return dynamics.computeTwistAngle(q);
}

export function evolveTwistDynamics(dynamics: TwistDynamics, dt: f64): void {
  dynamics.evolve(dt);
}

export function checkTwistCollapse(dynamics: TwistDynamics, entropy: f64, entropyThreshold: f64, angleThreshold: f64): boolean {
  return dynamics.checkCollapse(entropy, entropyThreshold, angleThreshold);
}

export function getTwistAngle(dynamics: TwistDynamics): f64 {
  return dynamics.getTwistAngle();
}

export function setTwistAngle(dynamics: TwistDynamics, angle: f64): void {
  dynamics.setTwistAngle(angle);
}

// QuaternionicProjector constructor and methods
export function createQuaternionicProjector(errorCorrection: f64 = 0.01): QuaternionicProjector {
  return new QuaternionicProjector(errorCorrection);
}

export function projectQuaternion(projector: QuaternionicProjector, q: Quaternion): Float64Array {
  return projector.project(q);
}

export function computeQuaternionEigenvalues(projector: QuaternionicProjector, q: Quaternion): Float64Array {
  return projector.computeEigenvalues(q);
}

// QuaternionPool constructor and methods
export function createQuaternionPool(maxSize: i32 = 1000): QuaternionPool {
  return new QuaternionPool(maxSize);
}

export function allocateQuaternionFromPool(pool: QuaternionPool): Quaternion {
  return pool.allocate();
}

export function deallocateQuaternionToPool(pool: QuaternionPool, q: Quaternion): void {
  pool.deallocate(q);
}

// EntangledQuaternionPair constructor and methods
export function createEntangledQuaternionPair(q1: Quaternion, q2: Quaternion, couplingStrength: f64 = 0.5): EntangledQuaternionPair {
  return new EntangledQuaternionPair(q1, q2, couplingStrength);
}

export function evolveEntangledPair(pair: EntangledQuaternionPair, dt: f64): void {
  pair.evolve(dt);
}

export function computeEntangledPairFidelity(pair: EntangledQuaternionPair, target: EntangledQuaternionPair): f64 {
  return pair.computeFidelity(target);
}

export function optimizeEntanglement(pair: EntangledQuaternionPair, target: EntangledQuaternionPair, iterations: i32 = 100): void {
  pair.optimizeEntanglement(target, iterations);
}

// QuaternionicSynchronizer constructor and methods
export function createQuaternionicSynchronizer(): QuaternionicSynchronizer {
  return new QuaternionicSynchronizer();
}

export function measureQuaternionPhaseDifference(sync: QuaternionicSynchronizer, q1: Quaternion, q2: Quaternion): f64 {
  return sync.measurePhaseDifference(q1, q2);
}

export function synchronizeQuaternions(
  sync: QuaternionicSynchronizer,
  q1: Quaternion, 
  q2: Quaternion, 
  id1: string, 
  id2: string,
  targetPhaseDiff: f64 = 0.0,
  tolerance: f64 = 0.01
): boolean {
  return sync.synchronize(q1, q2, id1, id2, targetPhaseDiff, tolerance);
}

export function runAdaptiveSynchronization(
  sync: QuaternionicSynchronizer,
  pair: EntangledQuaternionPair,
  maxIterations: i32 = 100,
  dt: f64 = 0.01
): boolean {
  return sync.runAdaptiveSynchronization(pair, maxIterations, dt);
}

// QuaternionicAgent constructor and methods
export function createQuaternionicAgent(q: Quaternion): QuaternionicAgent {
  return new QuaternionicAgent(q);
}

export function encodeQuaternionicMessage(agent: QuaternionicAgent, message: string): void {
  agent.encodeMessage(message);
}

export function decodeQuaternionicMessage(agent: QuaternionicAgent): string {
  return agent.decodeMessage();
}

export function entangleQuaternionicAgents(agent1: QuaternionicAgent, agent2: QuaternionicAgent, targetFidelity: f64 = 0.9): EntangledQuaternionPair {
  return agent1.entangleWith(agent2, targetFidelity);
}

export function applyQuaternionicSymbolicCollapse(agent: QuaternionicAgent, entropyThreshold: f64 = 0.1): boolean {
  return agent.applySymbolicCollapse(entropyThreshold);
}

export function getQuaternionicAgentQuaternion(agent: QuaternionicAgent): Quaternion {
  return agent.getQuaternion();
}

export function getQuaternionicAgentEntanglementFidelity(agent: QuaternionicAgent): f64 {
  return agent.getEntanglementFidelity();
}

// High-level transmission function is already exported from quaternion-entanglement
// No need to re-export here to avoid conflicts

// Helper functions for working with quaternion components
export function getQuaternionW(q: Quaternion): f64 {
  return q.w;
}

export function getQuaternionX(q: Quaternion): f64 {
  return q.x;
}

export function getQuaternionY(q: Quaternion): f64 {
  return q.y;
}

export function getQuaternionZ(q: Quaternion): f64 {
  return q.z;
}

export function setQuaternionComponents(q: Quaternion, w: f64, x: f64, y: f64, z: f64): void {
  q.w = w;
  q.x = x;
  q.y = y;
  q.z = z;
}