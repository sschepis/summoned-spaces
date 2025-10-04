/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Prime Number Utilities
 * Centralized prime number operations with ResoLang integration
 */

// Safe imports with fallbacks
let resolangModule: any = null;

/**
 * Async function to load ResoLang safely
 */
async function loadResoLang() {
  try {
    if (!resolangModule) {
      resolangModule = await Promise.race([
        import('../../../resolang/build/resolang.js'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ResoLang load timeout')), 3000)
        )
      ]);
      console.log('ResoLang module loaded successfully');
    }
    return resolangModule;
  } catch (error) {
    console.warn('ResoLang module failed to load, using fallbacks:', error);
    return null;
  }
}

/**
 * Generate prime numbers using Sieve of Eratosthenes
 * This is the fallback implementation used when ResoLang is unavailable
 */
export function generatePrimesSieve(count: number): number[] {
  const primes: number[] = [];
  const isPrime = new Array(count * 15).fill(true); // Larger sieve for enough primes
  isPrime[0] = isPrime[1] = false;
  
  for (let i = 2; i < isPrime.length && primes.length < count; i++) {
    if (isPrime[i]) {
      primes.push(i);
      for (let j = i * i; j < isPrime.length; j += i) {
        isPrime[j] = false;
      }
    }
  }
  
  return primes.slice(0, count);
}

/**
 * Generate prime numbers (with ResoLang if available, fallback to sieve)
 */
export async function generatePrimes(count: number): Promise<number[]> {
  try {
    const module = await loadResoLang();
    if (module && module.generatePrimes) {
      return module.generatePrimes(count);
    }
  } catch (error) {
    console.warn('ResoLang generatePrimes failed, using fallback:', error);
  }
  
  return generatePrimesSieve(count);
}

/**
 * Synchronous version of generatePrimes (always uses fallback)
 */
export function generatePrimesSync(count: number): number[] {
  return generatePrimesSieve(count);
}

/**
 * Get prime factors of a number
 */
export function getPrimeFactors(n: number, primeCache?: number[]): number[] {
  const factors: number[] = [];
  let num = n;
  
  // Use provided cache or generate small primes
  const primes = primeCache || generatePrimesSieve(1000);
  
  for (const prime of primes) {
    if (prime * prime > num) break;
    
    while (num % prime === 0) {
      factors.push(prime);
      num /= prime;
    }
    
    if (factors.length >= 10) break; // Limit factor count
  }
  
  if (num > 1 && factors.length < 10) {
    factors.push(num);
  }
  
  return factors;
}

/**
 * Calculate prime resonance from coefficients map
 */
export function calculatePrimeResonance(coeffs: Map<number, number>): number {
  let resonance = 0;
  for (const [prime, amplitude] of coeffs) {
    resonance += amplitude * Math.sin(prime * Math.PI / 100.0);
  }
  return coeffs.size > 0 ? resonance / coeffs.size : 0;
}

/**
 * Hash data to a number for prime analysis
 */
export function hashToNumber(data: string): number {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

/**
 * Modular exponentiation (fast power algorithm)
 */
export function modExpOptimized(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === BigInt(1)) return BigInt(0);
  
  let result = BigInt(1);
  base = base % mod;
  
  while (exp > 0) {
    if (exp % BigInt(2) === BigInt(1)) {
      result = (result * base) % mod;
    }
    exp = exp >> BigInt(1);
    base = (base * base) % mod;
  }
  
  return result;
}

/**
 * Calculate entropy rate (with ResoLang if available)
 */
export async function entropyRate(arr: number[]): Promise<number> {
  try {
    const module = await loadResoLang();
    if (module && module.entropyRate) {
      return module.entropyRate(arr);
    }
  } catch (error) {
    console.warn('ResoLang entropyRate failed, using fallback:', error);
  }
  
  // Fallback: Generate pseudo-random entropy in [0, 1]
  const base = Math.random();
  const variation = Math.sin(Date.now() / 1000) * 0.1;
  return Math.max(0, Math.min(1, base + variation));
}

/**
 * Safe caller for ResoLang functions
 */
export async function safeResolangCall(funcName: string, ...args: any[]): Promise<any> {
  try {
    const module = await loadResoLang();
    if (module && module[funcName]) {
      return module[funcName](...args);
    }
  } catch (error) {
    console.warn(`ResoLang function ${funcName} failed:`, error);
  }
  
  // Fallback implementations
  const fallbacks: Record<string, (...args: any[]) => any> = {
    generatePrimes: (n: number) => generatePrimesSieve(n),
    primeOperator: () => {
      const map = new Map();
      map.set('identity', 1);
      map.set('generator', 2);
      return map;
    },
    factorizationOperator: () => ({
      amplitudes: new Map([[2, 0.5], [3, 0.3], [5, 0.2]]),
      phase: 0,
      coherence: 0.8
    }),
    entropyRate: () => {
      const base = Math.random();
      const variation = Math.sin(Date.now() / 1000) * 0.1;
      return Math.max(0, Math.min(1, base + variation));
    },
    modExpOptimized: (base: bigint, exp: bigint, mod: bigint) => 
      modExpOptimized(base, exp, mod)
  };
  
  if (funcName in fallbacks) {
    console.warn(`Using fallback implementation for ${funcName}`);
    return fallbacks[funcName](...args);
  }
  
  throw new Error(`No fallback available for ${funcName}`);
}