import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/common';
import webSocketService from '../services/websocket';
import { holographicMemoryManager, PrimeResonanceIdentity } from '../services/holographic-memory';
import { userDataManager } from '../services/user-data-manager';
import { spaceManager } from '../services/space-manager';
import { beaconCacheManager } from '../services/beacon-cache';
import { ServerMessage } from '../../server/protocol';

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
  const restoreSession = async () => {
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
          
          // Ensure WebSocket is truly ready before sending
          if (!webSocketService.isReady()) {
            console.log('[AUTH] WebSocket not ready, waiting...');
            await webSocketService.waitForConnection();
          }
          
          // Browser-specific delays to prevent race conditions
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
          
          if (isSafari) {
            console.log('[AUTH] Safari detected, adding 200ms delay before session restore');
            await new Promise(resolve => setTimeout(resolve, 200));
          } else if (isChrome) {
            console.log('[AUTH] Chrome detected, adding 250ms delay before session restore');
            await new Promise(resolve => setTimeout(resolve, 250));
          }
          
          // Mark session as restoring BEFORE sending the message
          dispatch({ type: 'SESSION_RESTORE_START' });
          
          // Re-authenticate with the server using stored session token
          console.log('[AUTH] Sending restoreSession message to server...');
          webSocketService.sendMessage({
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
  };

  // Set up reconnection listener and session restoration message handler
  useEffect(() => {
    const handleSessionRestoredMessage = (message: ServerMessage) => {
      if (message.kind === 'sessionRestored') {
        console.log('[AUTH] Received sessionRestored message:', message.payload);
        if (message.payload.success) {
          console.log('[AUTH] Server session restored successfully for user:', message.payload.userId);
          // Chrome fix: Add a small delay to ensure server-side state is fully synchronized
          const isChrome = typeof navigator !== 'undefined' &&
            /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
          
          if (isChrome) {
            console.log('[AUTH] Chrome detected, adding synchronization delay');
            setTimeout(() => {
              dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
            }, 150);
          } else {
            dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
          }
        } else {
          console.log('[AUTH] Server session restoration failed, logging out');
          localStorage.removeItem('holographic_session');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    webSocketService.addReconnectionListener(restoreSession);
    webSocketService.addMessageListener(handleSessionRestoredMessage);
    
    return () => {
      webSocketService.removeReconnectionListener(restoreSession);
      webSocketService.removeMessageListener(handleSessionRestoredMessage);
    };
  }, [state.isAuthenticated]); // Re-run when auth state changes

  // Load session from localStorage on mount
  useEffect(() => {
    console.log('[AUTH] Initial session restoration on mount');
    console.log('[AUTH] state.isAuthenticated:', state.isAuthenticated);
    console.log('[AUTH] state.loading:', state.loading);
    console.log('[AUTH] state.sessionRestoring:', state.sessionRestoring);
    
    // Safari fix: Ensure localStorage is accessible
    const loadSession = () => {
      try {
        const savedSession = localStorage.getItem('holographic_session');
        console.log('[AUTH] LocalStorage session exists:', !!savedSession);
        
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            const user: User = session.user;
            const pri: PrimeResonanceIdentity = session.pri;
            
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
            });
            
            console.log('[AUTH] Client-side session restored for user:', user.username);
            
            // Mark session as restoring
            dispatch({ type: 'SESSION_RESTORE_START' });
            
            // Wait for WebSocket connection then restore session on server
            console.log('[AUTH] Waiting for WebSocket connection...');
            webSocketService.waitForConnection().then(() => {
              console.log('[AUTH] WebSocket connected, restoring server session...');
              restoreSession();
            }).catch(error => {
              console.error('[AUTH] Failed to connect WebSocket:', error);
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
          dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
        }
      } catch (error) {
        console.error('[AUTH] Failed to access localStorage:', error);
        // Safari might block localStorage in certain scenarios
        dispatch({ type: 'SESSION_RESTORE_COMPLETE' });
      }
    };
    
    // Safari fix: Sometimes localStorage is not immediately available
    if (typeof window !== 'undefined' && window.localStorage) {
      loadSession();
    } else {
      // Wait a bit for localStorage to be available
      setTimeout(loadSession, 100);
    }
  }, []);

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
    return new Promise((resolve, reject) => {
      const handleAuthMessage = (message: ServerMessage) => {
        if (message.kind === 'loginSuccess') {
          const user: User = {
            id: message.payload.userId,
            name: username, // Placeholder
            username: `@${username}`,
            avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
            bio: 'Logged in via PRI',
            isFollowing: false,
            stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0.5 },
            recentActivity: 'Just logged in',
            tags: ['resonant-being'],
          };
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token: message.payload.sessionToken, pri: message.payload.pri },
          });
          
          // Initialize the HolographicMemoryManager with the user's PRI
          holographicMemoryManager.setCurrentUser(message.payload.pri);

          // Initialize user data manager
          userDataManager.setCurrentUser(user.id);
          
          // Critical: Load beacon data FIRST during login too
          Promise.all([
            userDataManager.loadUserData(),
            beaconCacheManager.preloadUserBeacons(user.id)
          ]).then(() => {
            console.log('[AUTH] User data and beacons loaded after login');
            
            // Initialize SpaceManager after beacon data is ready
            return spaceManager.initializeForUser(user.id);
          }).then(() => {
            console.log('[AUTH] SpaceManager initialized after login');
          }).catch(error => {
            console.error('[AUTH] Failed to initialize user services after login:', error);
          });

          webSocketService.removeMessageListener(handleAuthMessage);
          resolve();
        } else if (message.kind === 'error' && (message.payload.requestKind === 'login' || !message.payload.requestKind)) {
          dispatch({ type: 'AUTH_FAILURE', payload: message.payload.message });
          webSocketService.removeMessageListener(handleAuthMessage);
          reject(new Error(message.payload.message));
        }
      };
      webSocketService.addMessageListener(handleAuthMessage);
      webSocketService.sendMessage({ kind: 'login', payload: { username, password } });
    });
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    return new Promise((resolve, reject) => {
        const handleRegisterMessage = (message: ServerMessage) => {
            if (message.kind === 'registerSuccess') {
                // Automatically log in after successful registration
                login(username, password).then(resolve).catch(reject);
                webSocketService.removeMessageListener(handleRegisterMessage);
            } else if (message.kind === 'error' && message.payload.requestKind === 'register') {
                dispatch({ type: 'AUTH_FAILURE', payload: message.payload.message });
                webSocketService.removeMessageListener(handleRegisterMessage);
                reject(new Error(message.payload.message));
            }
        };
        webSocketService.addMessageListener(handleRegisterMessage);
        webSocketService.sendMessage({ kind: 'register', payload: { username, email, password } });
    });
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