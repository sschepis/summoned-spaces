/**
 * Cache Health Monitoring and Self-Healing
 * Monitors cache health and performs automatic cleanup
 */

export class HealthMonitor {
  private cacheHealth: Map<string, number> = new Map(); // beaconId -> health score

  /**
   * Update cache health score for a beacon
   */
  updateHealth(beaconId: string, delta: number): void {
    const currentHealth = this.cacheHealth.get(beaconId) || 0.5;
    const newHealth = Math.max(0, Math.min(1, currentHealth + delta * 0.1));
    this.cacheHealth.set(beaconId, newHealth);
  }

  /**
   * Calculate cache entropy for health monitoring
   */
  calculateCacheEntropy(cacheSize: number): number {
    if (cacheSize === 0) return 0;
    
    // Calculate access pattern entropy
    const healthScores = Array.from(this.cacheHealth.values());
    if (healthScores.length === 0) return 0;
    
    let entropy = 0;
    for (const health of healthScores) {
      if (health > 0) {
        entropy -= health * Math.log(health);
      }
    }
    
    return entropy / Math.log(healthScores.length); // Normalize
  }

  /**
   * Get low-health beacons that should be removed
   */
  getLowHealthBeacons(threshold: number = 0.3): string[] {
    const lowHealthBeacons: string[] = [];
    
    for (const [beaconId, health] of this.cacheHealth) {
      if (health < threshold) {
        lowHealthBeacons.push(beaconId);
      }
    }
    
    return lowHealthBeacons;
  }

  /**
   * Decay all health scores over time
   */
  decayHealthScores(decayRate: number = 0.99): void {
    for (const [beaconId, health] of this.cacheHealth) {
      this.cacheHealth.set(beaconId, health * decayRate);
    }
  }

  /**
   * Initialize health score for a beacon
   */
  initializeHealth(beaconId: string, initialHealth: number = 1.0): void {
    this.cacheHealth.set(beaconId, initialHealth);
  }

  /**
   * Remove health tracking for a beacon
   */
  removeHealth(beaconId: string): void {
    this.cacheHealth.delete(beaconId);
  }

  /**
   * Clear all health data
   */
  clear(): void {
    this.cacheHealth.clear();
  }

  /**
   * Get average health score
   */
  getAverageHealth(): number {
    const healthScores = Array.from(this.cacheHealth.values());
    return healthScores.length > 0 ?
      healthScores.reduce((sum, h) => sum + h, 0) / healthScores.length : 0;
  }

  /**
   * Get health score for a specific beacon
   */
  getHealth(beaconId: string): number {
    return this.cacheHealth.get(beaconId) || 0.5;
  }

  /**
   * Export health data for persistence
   */
  exportHealthData(): Record<string, number> {
    const healthObj: Record<string, number> = {};
    for (const [beaconId, health] of this.cacheHealth) {
      healthObj[beaconId] = health;
    }
    return healthObj;
  }

  /**
   * Import health data from persistence
   */
  importHealthData(healthData: Record<string, number>): void {
    for (const [beaconId, health] of Object.entries(healthData)) {
      this.cacheHealth.set(beaconId, health);
    }
  }
}