import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/common';
import { webSocketService } from '../services/websocket';
import { holographicMemoryManager, PrimeResonanceIdentity } from '../services/holographic-memory';
import { ServerMessage } from '../../server/protocol';

// Auth State Types
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  pri: PrimeResonanceIdentity | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; pri: PrimeResonanceIdentity } }
  | { type: 'AUTH_FAILURE'; payload: string }
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
}

// Initial State
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
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
        error: null,
      };
    case 'AUTH_FAILURE':
      return { ...state, isAuthenticated: false, user: null, token: null, pri: null, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState };
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

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('holographic_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const user: User = session.user;
        const pri: PrimeResonanceIdentity = session.pri;
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: session.token, pri },
        });
        
        // Re-initialize the HolographicMemoryManager
        holographicMemoryManager.setCurrentUser(pri);
        console.log('Session restored for user:', user.username);
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('holographic_session');
      }
    }
  }, []);

  // Save session to localStorage whenever auth state changes
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token && state.pri) {
      const session = {
        user: state.user,
        token: state.token,
        pri: state.pri,
      };
      localStorage.setItem('holographic_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('holographic_session');
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

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
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