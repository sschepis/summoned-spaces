import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/common';

// Auth State Types
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Auth Context Type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
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

// Mock API functions (replace with actual API calls)
const mockApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Mock user data
    const user: User = {
      id: 'user-1',
      name: 'John Doe',
      username: '@johndoe',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Software engineer and quantum computing enthusiast',
      isFollowing: false,
      stats: {
        followers: 234,
        following: 123,
        spaces: 8,
        resonanceScore: 0.87,
      },
      recentActivity: 'Recently joined Project Quantum space',
      tags: ['developer', 'quantum', 'react'],
    };

    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock validation
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Mock user data
    const user: User = {
      id: 'user-' + Date.now(),
      name,
      username: '@' + name.toLowerCase().replace(/\s+/g, ''),
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'New to the quantum realm',
      isFollowing: false,
      stats: {
        followers: 0,
        following: 0,
        spaces: 0,
        resonanceScore: 0.5,
      },
      recentActivity: 'Just joined Summoned Spaces',
      tags: ['newbie'],
    };

    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
    };
  },
};

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Persist auth state to localStorage
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token) {
      localStorage.setItem('auth_token', state.token);
      localStorage.setItem('auth_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }, [state.isAuthenticated, state.user, state.token]);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await mockApi.login(email, password);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: result,
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await mockApi.register(email, password, name);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: result,
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
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