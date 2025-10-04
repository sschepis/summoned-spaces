import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/common';
import { communicationManager, type CommunicationMessage } from '../services/communication-manager';
import { holographicMemoryManager, PrimeResonanceIdentity } from '../services/holographic-memory';
import { userDataManager } from '../services/user-data-manager';
import { spaceManager } from '../services/space-manager';
import { beaconCacheManager } from '../services/beacon-cache';
import { useCallback } from 'react';

// Auth State Types
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  sessionRestoring: boolean; // New flag for session restoration
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
        error: null,
      };
    case 'AUTH_FAILURE':
      return { ...state, isAuthenticated: false, user: null, token: null, pri: null, loading: false, sessionRestoring: false, error: action.payload };
    case 'SESSION_RESTORE_START':
      return { ...state, sessionRestoring: true };
    case 'SESSION_RESTORE_COMPLETE':
      return { ...state, loading: false, sessionRestoring: false };
    case 'LOGOUT':
      return { ...initialState, loading: false, sessionRestoring: false };
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

  // Session restoration function
  const restoreSession = useCallback(async () => {
    console.log('[AUTH] restoreSession called');
    console.log('[AUTH] state.isAuthenticated:', state.isAuthenticated);
    console.log('[AUTH] state.loading:', state.loading);
    console.log('[AUTH] state.sessionRestoring:', state.sessionRestoring);
    
    try {
      const savedSession = localStorage.getItem('holographic_session');
      console.log('[AUTH] Saved session exists:', !!savedSession);
      
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          console.log('[AUTH] Parsed session data:', {
            hasToken: !!session.token,
            userId: session.user?.id,
            hasPri: !!session.pri
          });
          
          // Ensure communication manager is ready before sending
          if (!communicationManager.isConnected()) {
            console.log('[AUTH] Communication manager not ready, connecting...');
            await communicationManager.connect();
          }
          
          // Add a small delay to ensure WebSocket connection is established
          // This is more reliable than browser-specific hacks
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Mark session as restoring BEFORE sending the message
          dispatch({ type: 'SESSION_RESTORE_START' });
          
          // Re-authenticate with the server using stored session token
          console.log('[AUTH] Sending restoreSession message to server...');
          await communicationManager.send({
            kind: 'restoreSession',
            payload: {
              sessionToken: session.token,
              userId: session.user.id,
              pri: session.pri
            }
          });
          
        } catch (error) {
          console.error('[AUTH] Failed to restore session on reconnection:', error);
          // Clear invalid session data
          try {
            localStorage.removeItem('holographic_session');
          } catch (e) {
            console.error('[AUTH] Failed to clear localStorage:', e);
          }
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.log('[AUTH] No saved session to restore');
      }
    } catch (error) {
      console.error('[AUTH] Failed to access localStorage during restore:', error);
      dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
    }
  }, [state.isAuthenticated, state.loading, state.sessionRestoring]);

  // Set up message handler for session restoration
  useEffect(() => {
    const handleMessage = (message: CommunicationMessage) => {
      if (message.kind === 'sessionRestored') {
        console.log('[AUTH] Received sessionRestored message:', message.payload);
        const payload = message.payload as Record<string, unknown>;
        if (payload.success) {
          console.log('[AUTH] Server session restored successfully for user:', payload.userId);
          // Add a small delay to ensure server-side state is synchronized
          // This prevents race conditions across all browsers
          setTimeout(() => {
            dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
          }, 50);
        } else {
          console.log('[AUTH] Server session restoration failed, logging out');
          localStorage.removeItem('holographic_session');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    communicationManager.onMessage(handleMessage);
    
    // Note: SSE doesn't have explicit reconnection events, reconnection is automatic
    // If needed, session restoration will happen through the initial connection
  }, [state.isAuthenticated]); // Re-run when auth state changes

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

            // Critical: Load beacon data FIRST, then initialize SpaceManager
            // This prevents race conditions that cause membership loss
            Promise.all([
              userDataManager.loadUserData(),
              beaconCacheManager.preloadUserBeacons(user.id)
            ]).then(() => {
              console.log('[AUTH] User data and beacons loaded successfully');

              // Only initialize SpaceManager after beacon data is available
              return spaceManager.initializeForUser(user.id);
            }).then(() => {
              console.log('[AUTH] SpaceManager initialized after beacon data load');
            }).catch(error => {
              console.error('[AUTH] Failed to initialize user data/SpaceManager:', error);
              // Don't fail silently - show error to user
              dispatch({
                type: 'AUTH_FAILURE',
                payload: 'Failed to load user data. Please try refreshing the page.'
              });
            });

            console.log('[AUTH] Client-side session restored for user:', user.username);

            // Mark session as restoring
            dispatch({ type: 'SESSION_RESTORE_START' });

            // Set a timeout for session restoration to prevent infinite loading
            const sessionTimeout = setTimeout(() => {
              console.warn('[AUTH] Session restoration timed out after 10 seconds');
              dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
            }, 10000); // 10 second timeout

            // Wait for communication manager connection then restore session on server
            console.log('[AUTH] Waiting for communication manager connection...');
            communicationManager.connect().then(() => {
              console.log('[AUTH] Communication manager connected, restoring server session...');
              restoreSession();

              // Add another timeout specifically for the server response
              setTimeout(() => {
                console.warn('[AUTH] Server session restoration timed out, completing anyway');
                clearTimeout(sessionTimeout);
                dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
              }, 5000); // 5 seconds for server to respond
            }).catch((error: Error) => {
              console.error('[AUTH] Failed to connect communication manager:', error);
              clearTimeout(sessionTimeout);
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
  }, [restoreSession, state.isAuthenticated]); // Empty array: run ONLY ONCE on mount

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

      // Initialize SpaceManager after beacon data is ready
      console.log('[AUTH] Initializing SpaceManager with user ID:', user.id);
      await spaceManager.initializeForUser(user.id);
      console.log('[AUTH] SpaceManager initialized after login, current user should be:', spaceManager['currentUserId']);
      
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
    dispatch({ type: 'LOGOUT' });
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

  // Wait for authentication to be ready (not loading or restoring session)
  const waitForAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      // If not loading and not restoring, resolve immediately
      if (!state.loading && !state.sessionRestoring) {
        resolve();
        return;
      }
      
      // Otherwise, poll until ready
      const checkInterval = setInterval(() => {
        if (!state.loading && !state.sessionRestoring) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
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