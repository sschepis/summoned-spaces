// Test for Prime Phase-Locked Loop Synchronization
// Phase 11 of the ResonNet testnet genesis hologram

import {
  PrimeFrequency,
  PhaseLockedLoop,
  GlobalPrimeSynchronization,
  SyncUtils
} from "./prime-phase-lock";
import { createTestnetQuantumField } from "./quantum-resonance-field";
import { toFixed } from "../utils";

function testPrimeFrequency(): void {
  console.log("\n=== Testing Prime Frequency ===");
  
  const freq = new PrimeFrequency(7, 7.0); // 7 Hz for prime 7
  
  // Test at different time points
  const times = [0.0, 0.25, 0.5, 0.75, 1.0]; // seconds
  
  console.log("Prime 7 frequency values over time:");
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const value = freq.getValue(t);
    const phase = freq.getPhase(t);
    console.log(`  t=${toFixed(t, 2)}s: value=${toFixed(value, 4)}, phase=${toFixed(phase, 4)} rad`);
  }
  
  assert(Math.abs(freq.getValue(0.0)) < 0.001, "Value at t=0 should be ~0");
  assert(Math.abs(freq.getValue(0.25) - 1.0) < 0.001, "Value at t=0.25 should be ~1");
}

function testPhaseLockedLoop(): void {
  console.log("\n=== Testing Phase-Locked Loop ===");
  
  // Create PLL with prime 2 as reference at 2 Hz
  const pll = new PhaseLockedLoop(2, 2.0);
  
  // Add controlled frequencies
  pll.addControlledFrequency(3, 3.0);
  pll.addControlledFrequency(5, 5.0);
  
  console.log("Initial frequencies:");
  console.log(`  Reference (2): ${toFixed(pll.referenceFrequency.baseFrequency, 4)} Hz`);
  
  const controlled3 = pll.controlledFrequencies.get(3);
  const controlled5 = pll.controlledFrequencies.get(5);
  
  if (controlled3) {
    console.log(`  Controlled (3): ${toFixed(controlled3.baseFrequency, 4)} Hz`);
  }
  if (controlled5) {
    console.log(`  Controlled (5): ${toFixed(controlled5.baseFrequency, 4)} Hz`);
  }
  
  // Simulate PLL updates
  const dt = 0.001; // 1ms
  for (let i = 0; i < 10; i++) {
    const t = f64(i) * dt;
    pll.update(t, dt);
  }
  
  console.log("\nAfter 10 updates:");
  if (controlled3) {
    console.log(`  Controlled (3): ${toFixed(controlled3.baseFrequency, 4)} Hz`);
  }
  if (controlled5) {
    console.log(`  Controlled (5): ${toFixed(controlled5.baseFrequency, 4)} Hz`);
  }
  
  assert(pll.controlledFrequencies.size == 2, "Should have 2 controlled frequencies");
}

function testGlobalSynchronization(): void {
  console.log("\n=== Testing Global Prime Synchronization ===");
  
  // Create quantum field
  const quantumField = createTestnetQuantumField();
  
  // Create global synchronization
  const globalSync = new GlobalPrimeSynchronization(quantumField);
  
  // Simulate NTP sync
  const ntpTime = i64(Date.now()) * 1000; // Current time in microseconds
  globalSync.syncWithNTP(ntpTime);
  
  console.log("NTP synchronized at: " + ntpTime.toString() + " μs");
  
  // Test synchronization quality
  const quality = globalSync.getSyncQuality();
  console.log(`Initial sync quality: ${toFixed(quality * 100, 2)}%`);
  
  // Run a few update cycles
  for (let i = 0; i < 5; i++) {
    globalSync.update();
  }
  
  const updatedQuality = globalSync.getSyncQuality();
  console.log(`Updated sync quality: ${toFixed(updatedQuality * 100, 2)}%`);
  
  // Test phase coherence
  console.log("\nPhase coherence between primes:");
  
  // Test specific prime pairs
  const pairs: u32[][] = [
    [2, 3],
    [3, 5],
    [5, 7],
    [2, 7]
  ];
  
  for (let i = 0; i < pairs.length; i++) {
    const prime1 = pairs[i][0];
    const prime2 = pairs[i][1];
    const coherence = globalSync.getPhaseCoherence(prime1, prime2);
    console.log(`  Prime ${prime1} <-> Prime ${prime2}: ${toFixed(coherence, 4)}`);
  }
  
  assert(quality >= 0.0 && quality <= 1.0, "Sync quality should be between 0 and 1");
}

function testSyncReport(): void {
  console.log("\n=== Testing Synchronization Report ===");
  
  const quantumField = createTestnetQuantumField();
  const globalSync = new GlobalPrimeSynchronization(quantumField);
  
  // Initialize with NTP
  globalSync.syncWithNTP(i64(Date.now()) * 1000);
  
  // Run some updates
  for (let i = 0; i < 10; i++) {
    globalSync.update();
  }
  
  // Generate report
  const report = globalSync.generateSyncReport();
  console.log("\n" + report);
  
  assert(report.length > 0, "Report should not be empty");
  assert(report.includes("Synchronized Time"), "Report should include sync time");
  assert(report.includes("Prime Frequencies"), "Report should include frequencies");
}

function testSyncUtils(): void {
  console.log("\n=== Testing Sync Utilities ===");
  
  // Test optimal sync interval calculation
  const driftRates = [10.0, 50.0, 100.0, 500.0]; // ppm
  
  console.log("Optimal sync intervals for different drift rates:");
  for (let i = 0; i < driftRates.length; i++) {
    const drift = driftRates[i];
    const interval = SyncUtils.calculateOptimalSyncInterval(drift);
    console.log(`  ${drift} ppm drift -> ${interval / 1000000} seconds`);
  }
  
  // Test clock drift estimation
  const measurements: Array<i64> = [
    i64(1000000),
    i64(1000100),
    i64(1000195),
    i64(1000305),
    i64(1000398)
  ];
  
  const estimatedDrift = SyncUtils.estimateClockDrift(measurements);
  console.log(`\nEstimated clock drift: ${toFixed(estimatedDrift, 2)} ppm`);
  
  assert(SyncUtils.calculateOptimalSyncInterval(100.0) > 0, "Sync interval should be positive");
}

// Main test runner
export function runPrimePhaseLockTests(): void {
  console.log("=== Prime Phase-Locked Loop Synchronization Tests ===");
  console.log("Testing Phase 11 of ResonNet testnet genesis hologram");
  
  testPrimeFrequency();
  testPhaseLockedLoop();
  testGlobalSynchronization();
  testSyncReport();
  testSyncUtils();
  
  console.log("\n✅ All Prime Phase-Lock tests passed!");
  console.log("\n🔒 Global synchronization layer ready for deployment!");
}

// Run tests if this is the main module
runPrimePhaseLockTests();