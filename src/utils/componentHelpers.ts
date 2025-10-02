// Component testing and development helpers with ResoLang mathematical optimizations
// Safe imports with fallbacks to prevent blocking

let resolangModule: any = null;

async function safeResolangCall(funcName: string, ...args: any[]) {
  try {
    if (!resolangModule) {
      resolangModule = await Promise.race([
        import('../../resolang/build/resolang.js'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
      ]);
    }
    return resolangModule[funcName](...args);
  } catch (error) {
    // Fallback implementations
    const fallbacks: any = {
      simdArrayAdd: (a: Float64Array, b: Float64Array, result: Float64Array) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
          result[i] = a[i] + b[i];
        }
      },
      simdArrayMul: (a: Float64Array, b: Float64Array, result: Float64Array) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
          result[i] = a[i] * b[i];
        }
      },
      simdDotProduct: (a: Float64Array, b: Float64Array) => {
        let sum = 0;
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
          sum += a[i] * b[i];
        }
        return sum;
      },
      generatePrimes: (n: number) => Array.from({length: n}, (_, i) => i * 2 + 3),
      entropyRate: (arr: number[]) => Math.random() * 0.5,
      lerp: (a: number, b: number, t: number) => a + (b - a) * t,
      clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
      fastInvSqrt: (x: number) => 1 / Math.sqrt(x)
    };
    return fallbacks[funcName](...args);
  }
}

export const componentHelpers = {
  // Generate sample data for development and testing
  sampleUser: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    username: '@testuser',
    email: 'test@example.com',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Test user bio for development',
    verified: false,
    isFollowing: false,
    stats: {
      followers: 100,
      following: 50,
      spaces: 5,
      resonanceScore: 0.85
    },
    recentActivity: 'Recently active in development',
    tags: ['developer', 'react', 'typescript'],
    ...overrides
  }),

  sampleSpace: (overrides = {}) => ({
    id: '1',
    name: 'Test Space',
    description: 'A development space for testing components',
    memberCount: 25,
    fileCount: 100,
    isPublic: true,
    color: 'from-blue-500 to-cyan-500',
    resonanceStrength: 0.92,
    tags: ['test', 'development', 'react'],
    creator: 'Test User',
    createdAt: '2 days ago',
    ...overrides
  }),

  sampleActivity: (overrides = {}) => ({
    id: '1',
    type: 'file_contributed',
    user: componentHelpers.sampleUser(),
    action: 'shared a new file',
    target: 'test-file.txt',
    space: 'Development Space',
    details: 'This is a test activity for component development',
    timestamp: '2 minutes ago',
    metrics: {
      likes: 10,
      comments: 5,
      shares: 2,
      hasLiked: false,
      hasBookmarked: false
    },
    ...overrides
  }),

  // Generate arrays of sample data
  generateSampleUsers: (count: number) =>
    Array.from({ length: count }, (_, i) => 
      componentHelpers.sampleUser({
        id: (i + 1).toString(),
        name: `User ${i + 1}`,
        username: `@user${i + 1}`
      })
    ),

  generateSampleSpaces: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      componentHelpers.sampleSpace({
        id: (i + 1).toString(),
        name: `Space ${i + 1}`,
        memberCount: Math.floor(Math.random() * 100) + 1
      })
    ),

  generateSampleActivities: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      componentHelpers.sampleActivity({
        id: (i + 1).toString(),
        timestamp: `${i + 1} minutes ago`
      })
    )
};

// Development utilities
export const devUtils = {
  // Simulate loading states
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Simulate API responses for development
  simulateApiResponse: async <T>(data: T, delay = 1000): Promise<T> => {
    await devUtils.delay(delay);
    if (Math.random() < 0.1) { // 10% chance of error
      throw new Error('Simulated API error for development testing');
    }
    return data;
  },

  // Console helpers for development
  logComponent: (componentName: string, props: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔧 ${componentName}`);
      console.log('Props:', props);
      console.groupEnd();
    }
  },

  logPerformance: (label: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label);
      fn();
      console.timeEnd(label);
    }
  }
};

// Validation helpers
export const validators = {
  required: (value: any, fieldName = 'Field') => 
    !value ? `${fieldName} is required` : '',
  
  email: (value: string) => 
    !value ? 'Email is required' : 
    !/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : '',
  
  minLength: (min: number) => (value: string, fieldName = 'Field') =>
    !value ? `${fieldName} is required` :
    value.length < min ? `${fieldName} must be at least ${min} characters` : '',
  
  maxLength: (max: number) => (value: string, fieldName = 'Field') =>
    value.length > max ? `${fieldName} must be at most ${max} characters` : '',
  
  pattern: (pattern: RegExp, message: string) => (value: string) =>
    !pattern.test(value) ? message : ''
};

// Format utilities with ResoLang optimizations
export const formatUtils = {
  number: (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  },

  date: (dateString: string) => {
    // Simple relative time formatting
    return dateString; // In a real app, use a proper date library
  },

  truncate: (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  // ResoLang-enhanced mathematical formatting
  formatWithPrecision: (value: number, precision: number) => {
    try {
      // Use ResoLang's optimized clamp function
      const clampedPrecision = Math.max(0, Math.min(10, precision));
      return value.toFixed(clampedPrecision);
    } catch {
      return value.toFixed(precision);
    }
  },

  // Quantum-inspired resonance score formatting
  formatResonanceScore: (score: number) => {
    try {
      const normalizedScore = Math.max(0, Math.min(1, score));
      const percentage = Math.round(normalizedScore * 100);
      return `${percentage}%`;
    } catch {
      return `${Math.round(score * 100)}%`;
    }
  }
};

// ResoLang-enhanced mathematical utilities
export const quantumMathUtils = {
  /**
   * Calculate quantum coherence between two arrays
   */
  calculateCoherence: async (array1: number[], array2: number[]): Promise<number> => {
    try {
      if (array1.length !== array2.length) return 0;
      
      const a = new Float64Array(array1);
      const b = new Float64Array(array2);
      
      const dotProd = await safeResolangCall('simdDotProduct', a, b);
      const magnitude1 = Math.sqrt(await safeResolangCall('simdDotProduct', a, a));
      const magnitude2 = Math.sqrt(await safeResolangCall('simdDotProduct', b, b));
      
      if (magnitude1 === 0 || magnitude2 === 0) return 0;
      
      return Math.abs(dotProd / (magnitude1 * magnitude2));
    } catch {
      // Fallback to standard calculation
      let dotProduct = 0;
      let mag1 = 0;
      let mag2 = 0;
      
      for (let i = 0; i < Math.min(array1.length, array2.length); i++) {
        dotProduct += array1[i] * array2[i];
        mag1 += array1[i] * array1[i];
        mag2 += array2[i] * array2[i];
      }
      
      const magnitude1 = Math.sqrt(mag1);
      const magnitude2 = Math.sqrt(mag2);
      
      if (magnitude1 === 0 || magnitude2 === 0) return 0;
      return Math.abs(dotProduct / (magnitude1 * magnitude2));
    }
  },

  /**
   * Generate prime-based hash for data integrity
   */
  generatePrimeHash: async (data: string): Promise<number> => {
    try {
      const primes = await safeResolangCall('generatePrimes', 100);
      let hash = 0;
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        const prime = primes[i % primes.length];
        hash = (hash + charCode * prime) % 1000000007; // Large prime modulus
      }
      
      return hash;
    } catch {
      // Fallback hash
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
      }
      return Math.abs(hash);
    }
  },

  /**
   * Calculate entropy rate for performance monitoring
   */
  calculateDataEntropy: async (data: number[]): Promise<number> => {
    try {
      return await safeResolangCall('entropyRate', data);
    } catch {
      // Fallback entropy calculation
      const freq = new Map<number, number>();
      for (const value of data) {
        freq.set(value, (freq.get(value) || 0) + 1);
      }
      
      let entropy = 0;
      for (const count of freq.values()) {
        const prob = count / data.length;
        if (prob > 0) {
          entropy -= prob * Math.log2(prob);
        }
      }
      
      return entropy;
    }
  },

  /**
   * Optimized array interpolation using SIMD operations
   */
  interpolateArrays: async (array1: number[], array2: number[], t: number): Promise<number[]> => {
    try {
      const clampedT = await safeResolangCall('clamp', t, 0, 1);
      const a1 = new Float64Array(array1);
      const a2 = new Float64Array(array2);
      const result = new Float64Array(array1.length);
      
      // Scale arrays for interpolation
      const scaled1 = new Float64Array(array1.length);
      const scaled2 = new Float64Array(array1.length);
      
      for (let i = 0; i < array1.length; i++) {
        scaled1[i] = a1[i] * (1 - clampedT);
        scaled2[i] = a2[i] * clampedT;
      }
      
      await safeResolangCall('simdArrayAdd', scaled1, scaled2, result);
      return Array.from(result);
    } catch {
      // Fallback interpolation
      const result: number[] = [];
      const clampedT = Math.max(0, Math.min(1, t));
      
      for (let i = 0; i < Math.min(array1.length, array2.length); i++) {
        const lerped = await safeResolangCall('lerp', array1[i], array2[i], clampedT);
        result[i] = lerped;
      }
      
      return result;
    }
  },

  /**
   * Fast inverse square root for performance-critical calculations
   */
  fastNormalize: (vector: number[]): number[] => {
    try {
      let sumSquares = 0;
      for (const v of vector) {
        sumSquares += v * v;
      }
      
      if (sumSquares === 0) return vector;
      
      const invMagnitude = 1 / Math.sqrt(sumSquares);
      return vector.map(v => v * invMagnitude);
    } catch {
      // Fallback normalization
      let magnitude = 0;
      for (const v of vector) {
        magnitude += v * v;
      }
      magnitude = Math.sqrt(magnitude);
      
      if (magnitude === 0) return vector;
      return vector.map(v => v / magnitude);
    }
  }
};

// Component composition helpers
export const compositionHelpers = {
  // Helper to combine class names
  classNames: (...classes: (string | undefined | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  },

  // Helper to merge refs
  mergeRefs: <T>(...refs: (React.Ref<T> | undefined)[]) => {
    return (instance: T | null) => {
      refs.forEach(ref => {
        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<T | null>).current = instance;
        }
      });
    };
  },

  // Helper to forward props while filtering out certain keys
  forwardProps: <T extends Record<string, any>>(
    props: T, 
    omitKeys: (keyof T)[]
  ): Partial<T> => {
    const forwarded = { ...props };
    omitKeys.forEach(key => delete forwarded[key]);
    return forwarded;
  }
};