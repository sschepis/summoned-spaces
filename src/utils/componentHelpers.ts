// Component testing and development helpers
export const componentHelpers = {
  // Generate mock data for components
  mockUser: (overrides = {}) => ({
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

  mockSpace: (overrides = {}) => ({
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

  mockActivity: (overrides = {}) => ({
    id: '1',
    type: 'file_contributed',
    user: componentHelpers.mockUser(),
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

  // Generate arrays of mock data
  generateMockUsers: (count: number) => 
    Array.from({ length: count }, (_, i) => 
      componentHelpers.mockUser({ 
        id: (i + 1).toString(),
        name: `User ${i + 1}`,
        username: `@user${i + 1}`
      })
    ),

  generateMockSpaces: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      componentHelpers.mockSpace({
        id: (i + 1).toString(),
        name: `Space ${i + 1}`,
        memberCount: Math.floor(Math.random() * 100) + 1
      })
    ),

  generateMockActivities: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      componentHelpers.mockActivity({
        id: (i + 1).toString(),
        timestamp: `${i + 1} minutes ago`
      })
    )
};

// Development utilities
export const devUtils = {
  // Simulate loading states
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Simulate API responses
  mockApiResponse: async <T>(data: T, delay = 1000): Promise<T> => {
    await devUtils.delay(delay);
    if (Math.random() < 0.1) { // 10% chance of error
      throw new Error('Mock API error for testing');
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

// Format utilities
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