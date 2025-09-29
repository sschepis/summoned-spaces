import { 
  ACTION_TYPES, 
  BaseAction, 
  ActionHandler, 
  ActionRegistryEntry, 
  ThunkAction,
  ActionDispatcher,
  ActionMiddleware 
} from './types';
import { defaultMiddleware } from './middleware';

// Enhanced Action Registry Class
class EnhancedActionRegistry {
  private handlers = new Map<string, ActionRegistryEntry>();
  private globalMiddleware: ActionMiddleware[] = [];
  private isProcessing = false;
  private actionQueue: BaseAction[] = [];

  constructor() {
    this.registerDefaultHandlers();
  }

  // Register an action handler
  register(entry: ActionRegistryEntry): void {
    this.handlers.set(entry.type, entry);
  }

  // Register multiple handlers
  registerMany(entries: ActionRegistryEntry[]): void {
    entries.forEach(entry => this.register(entry));
  }

  // Unregister an action handler
  unregister(type: string): boolean {
    return this.handlers.delete(type);
  }

  // Get handler for action type
  getHandler(type: string): ActionRegistryEntry | undefined {
    return this.handlers.get(type);
  }

  // Get all registered action types
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  // Add global middleware
  addMiddleware(middleware: ActionMiddleware): void {
    this.globalMiddleware.push(middleware);
  }

  // Create a dispatcher
  createDispatcher(getState: () => any, setState: (newState: any) => void): ActionDispatcher {
    return (action: BaseAction | ThunkAction) => {
      // Handle thunk actions
      if (typeof action === 'function') {
        return action(this.createDispatcher(getState, setState), getState);
      }

      // Process regular actions
      return this.processAction(action as BaseAction, getState, setState);
    };
  }

  // Process an action through the registry
  private processAction(action: BaseAction, getState: () => any, setState: (newState: any) => void): any {
    // Add to queue if currently processing (prevent infinite loops)
    if (this.isProcessing) {
      this.actionQueue.push(action);
      return;
    }

    this.isProcessing = true;

    try {
      // Apply middleware
      const middlewareChain = [...this.globalMiddleware];
      let currentIndex = 0;

      const next = (processedAction: BaseAction): any => {
        if (currentIndex < middlewareChain.length) {
          const middleware = middlewareChain[currentIndex++];
          return middleware(processedAction, next as ActionDispatcher, getState);
        }

        // Final action processing
        return this.executeAction(processedAction, getState, setState);
      };

      const result = next(action);

      // Process queued actions
      while (this.actionQueue.length > 0) {
        const queuedAction = this.actionQueue.shift()!;
        this.executeAction(queuedAction, getState, setState);
      }

      return result;
    } finally {
      this.isProcessing = false;
    }
  }

  // Execute the actual action
  private executeAction(action: BaseAction, getState: () => any, setState: (newState: any) => void): any {
    const entry = this.handlers.get(action.type);

    if (!entry) {
      console.warn(`No handler registered for action type: ${action.type}`);
      return;
    }

    // Validate action if validator exists
    if (entry.validator && !entry.validator(action)) {
      console.warn(`Action validation failed for: ${action.type}`, action);
      return;
    }

    // Transform action if transformer exists
    const transformedAction = entry.transformer ? entry.transformer(action) : action;

    // Apply action-specific middleware
    if (entry.middleware && entry.middleware.length > 0) {
      let middlewareIndex = 0;
      const actionNext = (processedAction: BaseAction): any => {
        if (middlewareIndex < entry.middleware!.length) {
          const middleware = entry.middleware![middlewareIndex++];
          return middleware(processedAction, actionNext as ActionDispatcher, getState);
        }
        return this.applyHandler(transformedAction, entry.handler, getState, setState);
      };
      return actionNext(transformedAction);
    }

    // Apply handler directly
    return this.applyHandler(transformedAction, entry.handler, getState, setState);
  }

  // Apply the handler to update state
  private applyHandler(
    action: BaseAction,
    handler: ActionHandler,
    getState: () => any,
    setState: (newState: any) => void
  ): any {
    try {
      const currentState = getState();
      const newState = handler(currentState, action);
      
      if (newState !== currentState) {
        setState(newState);
      }
      
      return newState;
    } catch (error) {
      console.error(`Error in action handler for ${action.type}:`, error);
      throw error;
    }
  }

  // Register default handlers for common patterns
  private registerDefaultHandlers(): void {
    // Auth handlers
    this.register({
      type: ACTION_TYPES.AUTH.LOGIN_START,
      handler: (state) => ({
        ...state,
        auth: {
          ...state.auth,
          loading: true,
          error: null,
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.AUTH.LOGIN_SUCCESS,
      handler: (state, action) => ({
        ...state,
        auth: {
          ...state.auth,
          loading: false,
          isAuthenticated: true,
          user: action.payload.data.user,
          token: action.payload.data.token,
          error: null,
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.AUTH.LOGIN_FAILURE,
      handler: (state, action) => ({
        ...state,
        auth: {
          ...state.auth,
          loading: false,
          isAuthenticated: false,
          user: null,
          token: null,
          error: action.payload.message,
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.AUTH.LOGOUT,
      handler: (state) => ({
        ...state,
        auth: {
          loading: false,
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        },
      }),
    });

    // Spaces handlers
    this.register({
      type: ACTION_TYPES.SPACES.FETCH_SUCCESS,
      handler: (state, action) => ({
        ...state,
        spaces: {
          ...state.spaces,
          items: action.payload.data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.SPACES.CREATE_SUCCESS,
      handler: (state, action) => ({
        ...state,
        spaces: {
          ...state.spaces,
          items: [action.payload.data || action.payload, ...(state.spaces?.items || [])],
          loading: false,
          error: null,
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.SPACES.UPDATE_SUCCESS,
      handler: (state, action) => ({
        ...state,
        spaces: {
          ...state.spaces,
          items: (state.spaces?.items || []).map((space: any) =>
            space.id === action.payload.id
              ? { ...space, ...action.payload.updates }
              : space
          ),
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.SPACES.DELETE_SUCCESS,
      handler: (state, action) => ({
        ...state,
        spaces: {
          ...state.spaces,
          items: (state.spaces?.items || []).filter((space: any) => space.id !== action.payload.id),
        },
      }),
    });

    // Activities handlers
    this.register({
      type: ACTION_TYPES.ACTIVITIES.FETCH_SUCCESS,
      handler: (state, action) => ({
        ...state,
        activities: {
          ...state.activities,
          items: action.payload.data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.ACTIVITIES.LIKE_ACTIVITY,
      handler: (state, action) => ({
        ...state,
        activities: {
          ...state.activities,
          items: (state.activities?.items || []).map((activity: any) =>
            activity.id === action.payload.id
              ? {
                  ...activity,
                  metrics: {
                    ...activity.metrics,
                    likes: activity.metrics.likes + (activity.metrics.hasLiked ? -1 : 1),
                    hasLiked: !activity.metrics.hasLiked,
                  },
                }
              : activity
          ),
        },
      }),
    });

    // UI handlers
    this.register({
      type: ACTION_TYPES.UI.SET_THEME,
      handler: (state, action) => ({
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload.theme,
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.UI.SET_LOADING,
      handler: (state, action) => ({
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui?.loading,
            [action.payload.key]: action.payload.isLoading,
          },
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.UI.SET_ERROR,
      handler: (state, action) => ({
        ...state,
        ui: {
          ...state.ui,
          errors: {
            ...state.ui?.errors,
            [action.payload.key]: action.payload.error,
          },
        },
      }),
    });

    // Notification handlers
    this.register({
      type: ACTION_TYPES.NOTIFICATIONS.ADD_NOTIFICATION,
      handler: (state, action) => ({
        ...state,
        notifications: {
          ...state.notifications,
          items: [action.payload, ...(state.notifications?.items || [])],
        },
      }),
    });

    this.register({
      type: ACTION_TYPES.NOTIFICATIONS.REMOVE_NOTIFICATION,
      handler: (state, action) => ({
        ...state,
        notifications: {
          ...state.notifications,
          items: (state.notifications?.items || []).filter((n: any) => n.id !== action.payload.id),
        },
      }),
    });

    // Error handler for any unhandled errors
    this.register({
      type: 'GLOBAL_ERROR',
      handler: (state, action) => ({
        ...state,
        ui: {
          ...state.ui,
          globalError: {
            message: action.payload.error,
            timestamp: action.meta?.timestamp || Date.now(),
            originalAction: action.payload.originalAction,
          },
        },
      }),
    });
  }
}

// Create default registry instance
export const actionRegistry = new EnhancedActionRegistry();

// Add default middleware
actionRegistry.addMiddleware(defaultMiddleware);

// Helper function to create a complete action dispatcher
export const createActionDispatcher = (
  getState: () => any,
  setState: (newState: any) => void
): ActionDispatcher => {
  return actionRegistry.createDispatcher(getState, setState);
};

// Helper function to register custom handlers
export const registerActionHandler = (entry: ActionRegistryEntry): void => {
  actionRegistry.register(entry);
};

// Helper function to register multiple handlers
export const registerActionHandlers = (entries: ActionRegistryEntry[]): void => {
  actionRegistry.registerMany(entries);
};

// Validation helpers
export const validators = {
  hasPayload: (action: BaseAction): boolean => action.payload !== undefined,
  hasType: (action: BaseAction): boolean => typeof action.type === 'string' && action.type.length > 0,
  isValidAuth: (action: BaseAction): boolean => 
    action.type.startsWith('AUTH/') && validators.hasType(action),
  isValidSpace: (action: BaseAction): boolean => 
    action.type.startsWith('SPACES/') && validators.hasType(action),
  hasValidTimestamp: (action: BaseAction): boolean => 
    action.meta?.timestamp ? typeof action.meta.timestamp === 'number' : true,
};

// Transformer helpers
export const transformers = {
  addTimestamp: (action: BaseAction): BaseAction => ({
    ...action,
    meta: {
      ...action.meta,
      timestamp: action.meta?.timestamp || Date.now(),
    },
  }),
  addSource: (source: string) => (action: BaseAction): BaseAction => ({
    ...action,
    meta: {
      ...action.meta,
      timestamp: action.meta?.timestamp || Date.now(),
      source,
    },
  }),
  normalizePayload: (action: BaseAction): BaseAction => ({
    ...action,
    payload: action.payload || {},
  }),
};

// Export enhanced registry
export { EnhancedActionRegistry as ActionRegistry };
export default actionRegistry;