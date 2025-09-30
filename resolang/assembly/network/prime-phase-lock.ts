// Phase 11: Prime Phase-Locked Loop Synchronization
// Global synchronization layer using phase-locked prime frequencies

import { Prime } from "../types";
import { QuantumResonanceField, QuantumPrimeAnchor } from "./quantum-resonance-field";
import { toFixed } from "../utils";

// Helper function to create prime frequency map
function createPrimeFrequencyMap(): Map<Prime, f64> {
  const map = new Map<Prime, f64>();
  map.set(2, 2.0);    // 2 Hz base
  map.set(3, 3.0);    // 3 Hz base
  map.set(5, 5.0);    // 5 Hz base
  map.set(7, 7.0);    // 7 Hz base
  map.set(11, 11.0);  // 11 Hz base
  map.set(13, 13.0);  // 13 Hz base
  map.set(17, 17.0);  // 17 Hz base
  map.set(19, 19.0);  // 19 Hz base
  return map;
}

export class PrimeFrequency {
  prime: Prime;
  baseFrequency: f64; // Hz
  phase: f64; // radians
  amplitude: f64;
  
  constructor(prime: Prime, baseFrequency: f64) {
    this.prime = prime;
    this.baseFrequency = baseFrequency;
    this.phase = 0.0;
    this.amplitude = 1.0;
  }
  
  // Get instantaneous value at time t
  getValue(t: f64): f64 {
    return this.amplitude * Math.sin(2.0 * Math.PI * this.baseFrequency * t + this.phase);
  }
  
  // Get phase at time t
  getPhase(t: f64): f64 {
    return (2.0 * Math.PI * this.baseFrequency * t + this.phase) % (2.0 * Math.PI);
  }
}

export class PhaseLockedLoop {
  referenceFrequency: PrimeFrequency;
  controlledFrequencies: Map<Prime, PrimeFrequency>;
  phaseDetectorGain: f64;
  loopFilterBandwidth: f64;
  voltageControlledOscillatorGain: f64;
  
  constructor(referencePrime: Prime, referenceFreq: f64) {
    this.referenceFrequency = new PrimeFrequency(referencePrime, referenceFreq);
    this.controlledFrequencies = new Map<Prime, PrimeFrequency>();
    this.phaseDetectorGain = 1.0;
    this.loopFilterBandwidth = 0.1; // Hz
    this.voltageControlledOscillatorGain = 2.0 * Math.PI; // rad/s per unit
  }
  
  // Add a controlled frequency to the PLL
  addControlledFrequency(prime: Prime, nominalFreq: f64): void {
    this.controlledFrequencies.set(prime, new PrimeFrequency(prime, nominalFreq));
  }
  
  // Phase detector - returns phase error
  detectPhaseError(controlled: PrimeFrequency, t: f64): f64 {
    const refPhase = this.referenceFrequency.getPhase(t);
    const ctrlPhase = controlled.getPhase(t);
    let error = refPhase - ctrlPhase;
    
    // Wrap phase error to [-π, π]
    while (error > Math.PI) error -= 2.0 * Math.PI;
    while (error < -Math.PI) error += 2.0 * Math.PI;
    
    return error * this.phaseDetectorGain;
  }
  
  // Loop filter - low-pass filter for phase error
  filterPhaseError(error: f64, dt: f64): f64 {
    // Simple first-order low-pass filter
    const alpha = 2.0 * Math.PI * this.loopFilterBandwidth * dt;
    return error * alpha / (1.0 + alpha);
  }
  
  // Update controlled frequency based on phase error
  updateControlledFrequency(controlled: PrimeFrequency, filteredError: f64): void {
    const frequencyCorrection = filteredError * this.voltageControlledOscillatorGain;
    controlled.baseFrequency += frequencyCorrection;
  }
  
  // Main PLL update step
  update(t: f64, dt: f64): void {
    const keys = this.controlledFrequencies.keys();
    for (let i = 0; i < keys.length; i++) {
      const prime = keys[i];
      const controlled = this.controlledFrequencies.get(prime);
      if (!controlled) continue;
      
      // Detect phase error
      const phaseError = this.detectPhaseError(controlled, t);
      
      // Filter phase error
      const filteredError = this.filterPhaseError(phaseError, dt);
      
      // Update controlled frequency
      this.updateControlledFrequency(controlled, filteredError);
    }
  }
}

export class GlobalPrimeSynchronization {
  quantumField: QuantumResonanceField;
  phaseLockLoops: Map<string, PhaseLockedLoop>;
  ntpReferenceTime: i64; // microseconds since epoch
  localTimeOffset: i64; // microseconds
  syncInterval: i64; // microseconds
  lastSyncTime: i64; // microseconds
  
  // Prime frequency assignments (Hz)
  static readonly PRIME_FREQUENCIES: Map<Prime, f64> = createPrimeFrequencyMap();
  
  constructor(quantumField: QuantumResonanceField) {
    this.quantumField = quantumField;
    this.phaseLockLoops = new Map<string, PhaseLockedLoop>();
    this.ntpReferenceTime = 0;
    this.localTimeOffset = 0;
    this.syncInterval = 1000000; // 1 second in microseconds
    this.lastSyncTime = 0;
    
    this.initializePLLs();
  }
  
  // Initialize PLLs for each prime anchor
  initializePLLs(): void {
    const anchors = this.getQuantumAnchors();
    
    // Use prime 2 as the master reference
    const masterPLL = new PhaseLockedLoop(2, GlobalPrimeSynchronization.PRIME_FREQUENCIES.get(2));
    
    // Add all other primes as controlled frequencies
    for (let i = 1; i < anchors.length; i++) {
      const primes = anchors[i].primes;
      for (let j = 0; j < primes.length; j++) {
        const prime = primes[j];
        const freq = GlobalPrimeSynchronization.PRIME_FREQUENCIES.get(prime);
        if (freq > 0 && prime != 2) { // Skip if already reference
          masterPLL.addControlledFrequency(prime, freq);
        }
      }
    }
    
    this.phaseLockLoops.set("master", masterPLL);
  }
  
  // Synchronize with NTP server
  syncWithNTP(ntpTime: i64): void {
    const localTime = this.getLocalTimeMicros();
    this.ntpReferenceTime = ntpTime;
    this.localTimeOffset = ntpTime - localTime;
    this.lastSyncTime = localTime;
    
    // Reset all PLLs to zero phase at sync point
    this.resetPLLPhases();
  }
  
  // Reset all PLL phases to zero
  resetPLLPhases(): void {
    const pllKeys = this.phaseLockLoops.keys();
    for (let i = 0; i < pllKeys.length; i++) {
      const pll = this.phaseLockLoops.get(pllKeys[i]);
      if (!pll) continue;
      
      pll.referenceFrequency.phase = 0.0;
      
      const controlledKeys = pll.controlledFrequencies.keys();
      for (let j = 0; j < controlledKeys.length; j++) {
        const controlled = pll.controlledFrequencies.get(controlledKeys[j]);
        if (controlled) controlled.phase = 0.0;
      }
    }
  }
  
  // Get synchronized global time in microseconds
  getSynchronizedTime(): i64 {
    const localTime = this.getLocalTimeMicros();
    return localTime + this.localTimeOffset;
  }
  
  // Get local time in microseconds (mock implementation)
  getLocalTimeMicros(): i64 {
    // In real implementation, this would use high-resolution timer
    return i64(Date.now()) * 1000;
  }
  
  // Update synchronization
  update(): void {
    const currentTime = this.getSynchronizedTime();
    const timeSinceSync = currentTime - this.lastSyncTime;
    
    // Check if we need to resync with NTP
    if (timeSinceSync >= this.syncInterval) {
      // In real implementation, this would trigger NTP sync
      // For now, we'll just update the sync time
      this.lastSyncTime = currentTime;
    }
    
    // Update PLLs
    const timeSeconds = f64(currentTime) / 1000000.0;
    const dt = 0.001; // 1ms update interval
    
    const pllKeys = this.phaseLockLoops.keys();
    for (let i = 0; i < pllKeys.length; i++) {
      const pll = this.phaseLockLoops.get(pllKeys[i]);
      if (pll) pll.update(timeSeconds, dt);
    }
    
    // Update quantum field with synchronized phases
    this.updateQuantumFieldPhases(timeSeconds);
  }
  
  // Update quantum field prime anchors with synchronized phases
  updateQuantumFieldPhases(t: f64): void {
    const masterPLL = this.phaseLockLoops.get("master");
    if (!masterPLL) return;
    
    // Store phases in a map for quantum field update
    const phaseMap = new Map<Prime, f64>();
    phaseMap.set(masterPLL.referenceFrequency.prime, masterPLL.referenceFrequency.getPhase(t));
    
    // Update controlled primes
    const controlledKeys = masterPLL.controlledFrequencies.keys();
    for (let i = 0; i < controlledKeys.length; i++) {
      const prime = controlledKeys[i];
      const freq = masterPLL.controlledFrequencies.get(prime);
      if (freq) {
        phaseMap.set(prime, freq.getPhase(t));
      }
    }
    
    // Update quantum field with phase information
    this.updateQuantumFieldWithPhases(phaseMap);
  }
  
  // Get phase coherence between two primes
  getPhaseCoherence(prime1: Prime, prime2: Prime): f64 {
    const masterPLL = this.phaseLockLoops.get("master");
    if (!masterPLL) return 0.0;
    
    let phase1: f64 = 0.0;
    let phase2: f64 = 0.0;
    
    // Get phase for prime1
    if (prime1 == masterPLL.referenceFrequency.prime) {
      phase1 = masterPLL.referenceFrequency.phase;
    } else {
      const freq1 = masterPLL.controlledFrequencies.get(prime1);
      if (freq1) phase1 = freq1.phase;
    }
    
    // Get phase for prime2
    if (prime2 == masterPLL.referenceFrequency.prime) {
      phase2 = masterPLL.referenceFrequency.phase;
    } else {
      const freq2 = masterPLL.controlledFrequencies.get(prime2);
      if (freq2) phase2 = freq2.phase;
    }
    
    const phaseDiff = Math.abs(phase1 - phase2);
    return Math.cos(phaseDiff); // 1.0 = perfect coherence, 0.0 = orthogonal
  }
  
  // Get global synchronization quality
  getSyncQuality(): f64 {
    let totalCoherence = 0.0;
    let count = 0;
    
    const primes = this.getAllPrimes();
    for (let i = 0; i < primes.length - 1; i++) {
      for (let j = i + 1; j < primes.length; j++) {
        totalCoherence += this.getPhaseCoherence(primes[i], primes[j]);
        count++;
      }
    }
    
    return count > 0 ? totalCoherence / f64(count) : 0.0;
  }
  
  // Generate synchronization report
  generateSyncReport(): string {
    const syncTime = this.getSynchronizedTime();
    const quality = this.getSyncQuality();
    const masterPLL = this.phaseLockLoops.get("master");
    
    let report = "=== Global Prime Synchronization Report ===\n";
    report += `Synchronized Time: ${syncTime} μs\n`;
    report += `Sync Quality: ${toFixed(quality * 100, 2)}%\n`;
    report += `Time Since Last NTP Sync: ${(syncTime - this.lastSyncTime) / 1000} ms\n\n`;
    
    if (masterPLL) {
      report += "Prime Frequencies:\n";
      report += `  Reference (${masterPLL.referenceFrequency.prime}): ${toFixed(masterPLL.referenceFrequency.baseFrequency, 6)} Hz\n`;
      
      const controlledKeys = masterPLL.controlledFrequencies.keys();
      for (let i = 0; i < controlledKeys.length; i++) {
        const prime = controlledKeys[i];
        const freq = masterPLL.controlledFrequencies.get(prime);
        if (freq) {
          report += `  Prime ${prime}: ${toFixed(freq.baseFrequency, 6)} Hz\n`;
        }
      }
    }
    
    report += "\nPhase Coherence Matrix:\n";
    const primes = this.getAllPrimes();
    for (let i = 0; i < primes.length; i++) {
      for (let j = 0; j < primes.length; j++) {
        if (i === j) {
          report += " 1.00";
        } else {
          const coherence = this.getPhaseCoherence(primes[i], primes[j]);
          report += ` ${toFixed(coherence, 2)}`;
        }
      }
      report += "\n";
    }
    
    return report;
  }
  
  // Helper method to get quantum anchors from the field
  private getQuantumAnchors(): QuantumPrimeAnchor[] {
    // This would be implemented based on the actual QuantumResonanceField API
    // For now, return empty array
    return [];
  }
  
  // Helper method to update quantum field with phase information
  private updateQuantumFieldWithPhases(phaseMap: Map<Prime, f64>): void {
    // This would be implemented based on the actual QuantumResonanceField API
    // The quantum field would be updated with the synchronized phases
  }
  
  // Helper method to get all primes in the system
  private getAllPrimes(): Prime[] {
    const primes: Prime[] = [];
    const masterPLL = this.phaseLockLoops.get("master");
    if (!masterPLL) return primes;
    
    primes.push(masterPLL.referenceFrequency.prime);
    const controlledKeys = masterPLL.controlledFrequencies.keys();
    for (let i = 0; i < controlledKeys.length; i++) {
      primes.push(controlledKeys[i]);
    }
    
    return primes;
  }
}

// Synchronization utilities
export class SyncUtils {
  // Calculate optimal sync interval based on clock drift
  static calculateOptimalSyncInterval(driftRate: f64): i64 {
    // driftRate in ppm (parts per million)
    // Target: maintain < 1ms accuracy
    const targetAccuracy = 1000.0; // microseconds
    const driftPerSecond = driftRate / 1000000.0; // fraction per second
    const secondsToTarget = targetAccuracy / (driftPerSecond * 1000000.0);
    
    // Add 50% safety margin
    return i64(secondsToTarget * 0.5 * 1000000.0);
  }
  
  // Estimate local clock drift rate
  static estimateClockDrift(measurements: Array<i64>): f64 {
    if (measurements.length < 2) return 0.0;
    
    let totalDrift = 0.0;
    for (let i = 1; i < measurements.length; i++) {
      const drift = f64(measurements[i] - measurements[i-1]);
      totalDrift += drift;
    }
    
    const avgDrift = totalDrift / f64(measurements.length - 1);
    return avgDrift * 1000000.0; // Convert to ppm
  }
}