import { BaseAction, ActionMiddleware, ActionDispatcher } from './types';

// Logger middleware
export const loggerMiddleware: ActionMiddleware = (action, next, getState) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔧 Action: ${action.type}`);
    console.log('Previous State:', getState());
    console.log('Action:', action);
    
    const result = next(action);
    
    console.log('Next State:', getState());
    console.groupEnd();
    
    return result;
  }
  
  return next(action);
};

// Performance monitoring middleware
export const performanceMiddleware: ActionMiddleware = (action, next, _getState) => {
  const start = performance.now();
  
  const result = next(action);
  
  const end = performance.now();
  const duration = end - start;
  
  if (duration > 16) { // Log slow actions (>16ms could affect 60fps)
    console.warn(`⚠️ Slow action detected: ${action.type} took ${duration.toFixed(2)}ms`);
  }
  
  // Store performance metrics
  if (typeof window !== 'undefined' && (window as any).__ACTION_PERFORMANCE__) {
    (window as any).__ACTION_PERFORMANCE__[action.type] = {
      ...((window as any).__ACTION_PERFORMANCE__[action.type] || {}),
      lastDuration: duration,
      averageDuration: calculateAverage((window as any).__ACTION_PERFORMANCE__[action.type]?.durations || [], duration),
      durations: [...((window as any).__ACTION_PERFORMANCE__[action.type]?.durations || []).slice(-9), duration],
    };
  }
  
  return result;
};

// Error handling middleware
export const errorMiddleware: ActionMiddleware = (action, next, _getState) => {
  try {
    return next(action);
  } catch (error) {
    console.error(`❌ Error in action ${action.type}:`, error);
    
    // Dispatch error action
    const errorAction: BaseAction = {
      type: 'GLOBAL_ERROR',
      payload: {
        originalAction: action,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      meta: {
        timestamp: Date.now(),
        error: true,
      },
    };
    
    next(errorAction);
    
    // Re-throw to maintain error flow
    throw error;
  }
};

// Optimistic update middleware
export const optimisticMiddleware: ActionMiddleware = (action, next, getState) => {
  if (action.meta?.optimistic) {
    // Store rollback information
    const currentState = getState();
    const optimisticAction = action as any; // Cast to access rollback property
    const rollbackInfo = {
      action: optimisticAction.meta.rollback,
      timestamp: action.meta.timestamp,
      state: currentState,
    };
    
    // Store in a registry for potential rollback
    optimisticRegistry.set(action.meta.timestamp, rollbackInfo);
    
    // Clean up old optimistic actions (older than 30 seconds)
    const cutoff = Date.now() - 30000;
    for (const [timestamp] of optimisticRegistry.entries()) {
      if (timestamp < cutoff) {
        optimisticRegistry.delete(timestamp);
      }
    }
  }
  
  return next(action);
};

// Validation middleware
export const validationMiddleware: ActionMiddleware = (action, next, _getState) => {
  // Validate action structure
  if (!action.type) {
    console.error('❌ Invalid action: missing type', action);
    return;
  }
  
  if (typeof action.type !== 'string') {
    console.error('❌ Invalid action: type must be string', action);
    return;
  }
  
  // Add timestamp if missing
  if (!action.meta?.timestamp) {
    action.meta = {
      ...action.meta,
      timestamp: Date.now(),
    };
  }
  
  return next(action);
};

// Rate limiting middleware
export const rateLimitMiddleware: ActionMiddleware = (() => {
  const actionCounts = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT = 50; // Max 50 actions per second per type
  const WINDOW_MS = 1000;
  
  return (action, next, _getState) => {
    const now = Date.now();
    const actionType = action.type;
    const current = actionCounts.get(actionType);
    
    if (!current || now > current.resetTime) {
      // Reset window
      actionCounts.set(actionType, { count: 1, resetTime: now + WINDOW_MS });
    } else if (current.count >= RATE_LIMIT) {
      console.warn(`🚦 Rate limit exceeded for action type: ${actionType}`);
      return; // Drop the action
    } else {
      current.count++;
    }
    
    return next(action);
  };
})();

// Persistence middleware
export const persistenceMiddleware: ActionMiddleware = (action, next, _getState) => {
  const result = next(action);
  
  // Persist certain actions to localStorage
  const persistableActions = [
    'AUTH/LOGIN_SUCCESS',
    'AUTH/LOGOUT',
    'UI/SET_THEME',
    'UI/SET_PREFERENCES',
  ];
  
  if (persistableActions.includes(action.type)) {
    try {
      const persistData = {
        type: action.type,
        payload: action.payload,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(`action_${action.type}`, JSON.stringify(persistData));
    } catch (error) {
      console.warn('Failed to persist action:', error);
    }
  }
  
  return result;
};

// Analytics middleware
export const analyticsMiddleware: ActionMiddleware = (action, next, _getState) => {
  // Track user actions for analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // const eventData = {
    //   action_type: action.type,
    //   timestamp: action.meta?.timestamp || Date.now(),
    // };
    
    // Only track user-initiated actions (not system actions)
    const userActions = [
      'AUTH/LOGIN_SUCCESS',
      'SPACES/CREATE_SUCCESS',
      'ACTIVITIES/LIKE_ACTIVITY',
      'USERS/FOLLOW_USER',
    ];
    
    if (userActions.includes(action.type)) {
      (window as any).gtag('event', 'user_action', {
        custom_parameter: action.type,
        value: 1,
      });
    }
  }
  
  return next(action);
};

// Debounce middleware
export const debounceMiddleware: ActionMiddleware = (() => {
  const debounceMap = new Map<string, NodeJS.Timeout>();
  const DEBOUNCE_MS = 300;
  
  const debounceActions = [
    'SEARCH/SET_QUERY',
    'UI/SET_SEARCH_QUERY',
    'USERS/SEARCH_USERS',
  ];
  
  return (action, next, _getState) => {
    if (debounceActions.includes(action.type)) {
      const key = `${action.type}_${JSON.stringify(action.payload)}`;
      
      // Clear existing timeout
      if (debounceMap.has(key)) {
        clearTimeout(debounceMap.get(key)!);
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        debounceMap.delete(key);
        next(action);
      }, DEBOUNCE_MS);
      
      debounceMap.set(key, timeout);
      return;
    }
    
    return next(action);
  };
})();

// Real-time middleware
export const realtimeMiddleware: ActionMiddleware = (action, next, _getState) => {
  const result = next(action);
  
  // Broadcast certain actions to WebSocket
  const broadcastActions = [
    'ACTIVITIES/LIKE_ACTIVITY',
    'CHAT/SEND_MESSAGE',
    'USERS/FOLLOW_USER',
  ];
  
  if (broadcastActions.includes(action.type) && typeof window !== 'undefined') {
    const wsConnection = (window as any).__WS_CONNECTION__;
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'action_broadcast',
        action: {
          type: action.type,
          payload: action.payload,
          meta: action.meta,
        },
      }));
    }
  }
  
  return result;
};

// Middleware composer
export const composeMiddleware = (...middlewares: ActionMiddleware[]): ActionMiddleware => {
  return (action, next, getState) => {
    let index = 0;
    
    const dispatch = (currentAction: BaseAction): any => {
      if (index >= middlewares.length) {
        return next(currentAction);
      }
      
      const middleware = middlewares[index++];
      return middleware(currentAction, next, getState);
    };
    
    return dispatch(action);
  };
};

// Default middleware stack
export const defaultMiddleware = composeMiddleware(
  validationMiddleware,
  rateLimitMiddleware,
  performanceMiddleware,
  optimisticMiddleware,
  debounceMiddleware,
  errorMiddleware,
  persistenceMiddleware,
  analyticsMiddleware,
  realtimeMiddleware,
  loggerMiddleware
);

// Helper functions
function calculateAverage(durations: number[], newDuration: number): number {
  const allDurations = [...durations, newDuration];
  return allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length;
}

// Optimistic registry for rollbacks
const optimisticRegistry = new Map<number, {
  action?: BaseAction;
  timestamp: number;
  state: any;
}>();

// Rollback function for optimistic updates
export const rollbackOptimisticUpdate = (timestamp: number, dispatch: ActionDispatcher): boolean => {
  const rollbackInfo = optimisticRegistry.get(timestamp);
  
  if (rollbackInfo && rollbackInfo.action) {
    dispatch(rollbackInfo.action);
    optimisticRegistry.delete(timestamp);
    return true;
  }
  
  return false;
};

// Clear all optimistic updates
export const clearOptimisticUpdates = (dispatch: ActionDispatcher): void => {
  for (const [_timestamp, rollbackInfo] of optimisticRegistry.entries()) {
    if (rollbackInfo.action) {
      dispatch(rollbackInfo.action);
    }
  }
  optimisticRegistry.clear();
};

// Performance metrics getter
export const getPerformanceMetrics = (): Record<string, any> => {
  if (typeof window !== 'undefined' && (window as any).__ACTION_PERFORMANCE__) {
    return (window as any).__ACTION_PERFORMANCE__;
  }
  return {};
};