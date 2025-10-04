import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/common';
import { communicationManager } from '../services/communication-manager';
import { holographicMemoryManager, PrimeResonanceIdentity } from '../services/holographic-memory';
import { userDataManager } from '../services/user-data';
import { spaceManager } from '../services/space-manager';
import { beaconCacheManager } from '../services/beacon-cache';

// Auth State Types
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  sessionRestoring: boolean; // New flag for session restoration
  servicesInitializing: boolean; // New flag for service layer initialization
  error: string | null;
  token: string | null;
  pri: PrimeResonanceIdentity | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; pri: PrimeResonanceIdentity } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'SESSION_RESTORE_START' }
  | { type: 'SESSION_RESTORE_COMPLETE' }
  | { type: 'SERVICES_INIT_START' }
  | { type: 'SERVICES_INIT_COMPLETE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Auth Context Type
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  waitForAuth: () => Promise<void>;
}

// Initial State
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Start with loading true to handle session restoration
  sessionRestoring: false,
  servicesInitializing: false,
  error: null,
  token: null,
  pri: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        pri: action.payload.pri,
        loading: false,
        sessionRestoring: false,
        // Don't automatically set servicesInitializing to false
        // It will be set by SERVICES_INIT_COMPLETE
        error: null,
      };
    case 'AUTH_FAILURE':
      return { ...state, isAuthenticated: false, user: null, token: null, pri: null, loading: false, sessionRestoring: false, servicesInitializing: false, error: action.payload };
    case 'SESSION_RESTORE_START':
      return { ...state, sessionRestoring: true };
    case 'SESSION_RESTORE_COMPLETE':
      return { ...state, loading: false, sessionRestoring: false };
    case 'SERVICES_INIT_START':
      return { ...state, servicesInitializing: true };
    case 'SERVICES_INIT_COMPLETE':
      return { ...state, servicesInitializing: false };
    case 'LOGOUT':
      return { ...initialState, loading: false, sessionRestoring: false, servicesInitializing: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);


  // Load session from localStorage on mount (ONLY ONCE)
  useEffect(() => {
    let mounted = true;

    console.log('[AUTH] Initial session restoration on mount');

    // Safari fix: Ensure localStorage is accessible
    const loadSession = () => {
      if (!mounted) return;

      try {
        const savedSession = localStorage.getItem('holographic_session');
        console.log('[AUTH] LocalStorage session exists:', !!savedSession);

        if (savedSession && mounted) {
          try {
            const session = JSON.parse(savedSession);
            const user: User = session.user;
            const pri: PrimeResonanceIdentity = session.pri;

            if (!mounted) return;

            console.log('[AUTH] Restoring client-side auth state for user:', user.username);

            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token: session.token, pri },
            });

            // Re-initialize the HolographicMemoryManager
            holographicMemoryManager.setCurrentUser(pri);

            // Initialize user data manager
            userDataManager.setCurrentUser(user.id);

            // Don't initialize services here - wait for session restoration to complete first

            console.log('[AUTH] Client-side session restored for user:', user.username);

            // Mark services as initializing
            dispatch({ type: 'SERVICES_INIT_START' });
            
            // Initialize services first
            Promise.all([
              userDataManager.loadUserData(),
              beaconCacheManager.preloadUserBeacons(user.id)
            ]).then(() => {
              console.log('[AUTH] User data and beacons loaded successfully');
              return spaceManager.initializeForUser(user.id);
            }).then(() => {
              console.log('[AUTH] SpaceManager initialized after beacon data load, isReady:', spaceManager.isReady());
              dispatch({ type: 'SERVICES_INIT_COMPLETE' });
              dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
            }).catch((error: Error) => {
              console.error('[AUTH] Failed to initialize services:', error);
              dispatch({ type: 'SERVICES_INIT_COMPLETE' });
              dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
            });
          } catch (error) {
            console.error('[AUTH] Failed to restore session:', error);
            localStorage.removeItem('holographic_session');
            // Set loading to false when session restoration fails
            dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
          }
        } else {
          console.log('[AUTH] No saved session found');
          // No saved session, set loading to false
          if (mounted) {
            dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
          }
        }
      } catch (error) {
        console.error('[AUTH] Failed to access localStorage:', error);
        // Safari might block localStorage in certain scenarios
        if (mounted) {
          dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
        }
      }
    };

    // Only load session if we're not already authenticated (i.e., just logged in)
    if (!state.isAuthenticated) {
      loadSession();
    } else {
      console.log('[AUTH] Skipping session restoration - user already authenticated');
      dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty array: run ONLY ONCE on mount - removing state.isAuthenticated to prevent double-run

  // Save session to localStorage whenever auth state changes
  useEffect(() => {
    try {
      if (state.isAuthenticated && state.user && state.token && state.pri) {
        const session = {
          user: state.user,
          token: state.token,
          pri: state.pri,
        };
        console.log('[AUTH] Saving session to localStorage for user:', state.user.username);
        
        // Safari fix: Ensure localStorage write completes
        const sessionString = JSON.stringify(session);
        localStorage.setItem('holographic_session', sessionString);
        
        // Verify the write (Safari sometimes fails silently)
        const verified = localStorage.getItem('holographic_session');
        if (verified !== sessionString) {
          console.error('[AUTH] localStorage write verification failed');
        }
      } else {
        console.log('[AUTH] Clearing session from localStorage');
        localStorage.removeItem('holographic_session');
      }
    } catch (error) {
      console.error('[AUTH] Failed to save session to localStorage:', error);
    }
  }, [state.isAuthenticated, state.user, state.token, state.pri]);

  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Use dedicated auth endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', username, password })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      const payload = result.payload;
      const user: User = {
        id: payload.userId as string,
        name: username,
        username: `@${username}`,
        avatar: payload.avatar as string || '',
        bio: payload.bio as string || '',
        isFollowing: false,
        stats: payload.stats as User['stats'] || { followers: 0, following: 0, spaces: 0, resonanceScore: 0.5 },
        recentActivity: payload.recentActivity as string || 'Just logged in',
        tags: payload.tags as string[] || [],
      };
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token: payload.sessionToken as string,
          pri: payload.pri as PrimeResonanceIdentity
        },
      });
      
      // Mark services as initializing
      dispatch({ type: 'SERVICES_INIT_START' });
      
      try {
        // Initialize the HolographicMemoryManager with the user's PRI
        holographicMemoryManager.setCurrentUser(payload.pri as PrimeResonanceIdentity);

        // Initialize user data manager
        userDataManager.setCurrentUser(user.id);

        // Critical: Load beacon data FIRST during login too
        await Promise.all([
          userDataManager.loadUserData(),
          beaconCacheManager.preloadUserBeacons(user.id)
        ]);

        console.log('[AUTH] User data and beacons loaded after login');

        // Initialize SpaceManager after beacon data is ready with explicit error handling
        console.log('[AUTH] Initializing SpaceManager with user ID:', user.id);
        await spaceManager.initializeForUser(user.id);
        console.log('[AUTH] SpaceManager initialized successfully, isReady:', spaceManager.isReady());
        
        // Mark services initialization complete
        dispatch({ type: 'SERVICES_INIT_COMPLETE' });
      } catch (serviceError) {
        console.error('[AUTH] Failed to initialize services:', serviceError);
        dispatch({ type: 'SERVICES_INIT_COMPLETE' });
        // Don't fail the login, but log the error
        // The user can still use basic features
      }
      
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Use dedicated auth endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'register', username, email, password })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      
      // Automatically log in after successful registration
      await login(username, password);
      
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Registration failed' });
      throw error;
    }
  };

  const logout = (): void => {
    console.log('[AUTH] Logging out user, current state:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user?.id,
      token: !!state.token
    });

    // Clear communication manager session
    communicationManager.disconnect();

    // Clear holographic memory manager
    // holographicMemoryManager.clearCurrentUser(); // Method doesn't exist

    // Clear user data manager
    // userDataManager.clearCurrentUser(); // Method doesn't exist

    // Clear space manager
    spaceManager.clearCache();

    // Clear beacon cache
    beaconCacheManager.clearCache();

    // Clear localStorage
    try {
      localStorage.removeItem('holographic_session');
      localStorage.removeItem('summoned_spaces_session');
      console.log('[AUTH] Cleared localStorage');
    } catch (error) {
      console.error('[AUTH] Failed to clear localStorage during logout:', error);
    }

    // Dispatch logout action
    console.log('[AUTH] Dispatching LOGOUT action');
    dispatch({ type: 'LOGOUT' });

    console.log('[AUTH] User logged out successfully');
  };

  const updateUser = (updates: Partial<User>): void => {
    dispatch({
      type: 'UPDATE_USER',
      payload: updates,
    });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Wait for authentication to be ready (not loading, restoring, or initializing services)
  const waitForAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      // If not loading, not restoring, and not initializing services, resolve immediately
      if (!state.loading && !state.sessionRestoring && !state.servicesInitializing) {
        resolve();
        return;
      }
      
      // Otherwise, poll until ready
      const checkInterval = setInterval(() => {
        if (!state.loading && !state.sessionRestoring && !state.servicesInitializing) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Add timeout to prevent infinite waiting
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('[AUTH] waitForAuth timed out after 30 seconds');
        resolve();
      }, 30000);
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    waitForAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hooks for specific auth states
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

export const useAuthLoading = (): boolean => {
  const { loading } = useAuth();
  return loading;
};

export const useAuthError = (): string | null => {
  const { error } = useAuth();
  return error;
};