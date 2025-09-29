import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Space, ActivityItem, User } from '../types/common';
import { View } from '../App';

// App State Types
interface AppState {
  currentView: View;
  selectedSpaceId: string | null;
  spaces: Space[];
  activities: ActivityItem[];
  users: User[];
  searchQuery: string;
  loading: {
    spaces: boolean;
    activities: boolean;
    users: boolean;
  };
  errors: {
    spaces: string | null;
    activities: string | null;
    users: string | null;
  };
  lastUpdated: {
    spaces: Date | null;
    activities: Date | null;
    users: Date | null;
  };
}

// App Actions
type AppAction =
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_SELECTED_SPACE'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SPACES_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVITIES_LOADING'; payload: boolean }
  | { type: 'SET_USERS_LOADING'; payload: boolean }
  | { type: 'SET_SPACES'; payload: Space[] }
  | { type: 'SET_ACTIVITIES'; payload: ActivityItem[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_SPACE'; payload: Space }
  | { type: 'UPDATE_SPACE'; payload: { id: string; updates: Partial<Space> } }
  | { type: 'DELETE_SPACE'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: ActivityItem }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; updates: Partial<ActivityItem> } }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'SET_SPACES_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVITIES_ERROR'; payload: string | null }
  | { type: 'SET_USERS_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_ERRORS' };

// App Context Type
interface AppContextType extends AppState {
  setCurrentView: (view: View) => void;
  setSelectedSpace: (spaceId: string | null) => void;
  setSearchQuery: (query: string) => void;
  loadSpaces: () => Promise<void>;
  loadActivities: () => Promise<void>;
  loadUsers: () => Promise<void>;
  addSpace: (space: Space) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  deleteSpace: (id: string) => void;
  addActivity: (activity: ActivityItem) => void;
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  clearErrors: () => void;
  refreshData: () => Promise<void>;
}

// Initial State
const initialState: AppState = {
  currentView: 'feed',
  selectedSpaceId: null,
  spaces: [],
  activities: [],
  users: [],
  searchQuery: '',
  loading: {
    spaces: false,
    activities: false,
    users: false,
  },
  errors: {
    spaces: null,
    activities: null,
    users: null,
  },
  lastUpdated: {
    spaces: null,
    activities: null,
    users: null,
  },
};

// App Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_SELECTED_SPACE':
      return { ...state, selectedSpaceId: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SPACES_LOADING':
      return {
        ...state,
        loading: { ...state.loading, spaces: action.payload },
      };
    
    case 'SET_ACTIVITIES_LOADING':
      return {
        ...state,
        loading: { ...state.loading, activities: action.payload },
      };
    
    case 'SET_USERS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, users: action.payload },
      };
    
    case 'SET_SPACES':
      return {
        ...state,
        spaces: action.payload,
        lastUpdated: { ...state.lastUpdated, spaces: new Date() },
        errors: { ...state.errors, spaces: null },
      };
    
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
        lastUpdated: { ...state.lastUpdated, activities: new Date() },
        errors: { ...state.errors, activities: null },
      };
    
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
        lastUpdated: { ...state.lastUpdated, users: new Date() },
        errors: { ...state.errors, users: null },
      };
    
    case 'ADD_SPACE':
      return {
        ...state,
        spaces: [action.payload, ...state.spaces],
      };
    
    case 'UPDATE_SPACE':
      return {
        ...state,
        spaces: state.spaces.map(space =>
          space.id === action.payload.id
            ? { ...space, ...action.payload.updates }
            : space
        ),
      };
    
    case 'DELETE_SPACE':
      return {
        ...state,
        spaces: state.spaces.filter(space => space.id !== action.payload),
        selectedSpaceId: state.selectedSpaceId === action.payload ? null : state.selectedSpaceId,
      };
    
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id
            ? { ...activity, ...action.payload.updates }
            : activity
        ),
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        ),
      };
    
    case 'SET_SPACES_ERROR':
      return {
        ...state,
        errors: { ...state.errors, spaces: action.payload },
      };
    
    case 'SET_ACTIVITIES_ERROR':
      return {
        ...state,
        errors: { ...state.errors, activities: action.payload },
      };
    
    case 'SET_USERS_ERROR':
      return {
        ...state,
        errors: { ...state.errors, users: action.payload },
      };
    
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {
          spaces: null,
          activities: null,
          users: null,
        },
      };
    
    default:
      return state;
  }
};

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// App Provider Props
interface AppProviderProps {
  children: ReactNode;
}

// Mock API functions (replace with actual API calls)
const mockApi = {
  fetchSpaces: async (): Promise<Space[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: '1',
        name: 'Project Quantum',
        description: 'Research collaboration space for quantum computing papers',
        isPublic: true,
        memberCount: 12,
        volumeCount: 8,
        resonanceStrength: 0.87,
        lastActivity: '2 hours ago',
        role: 'owner',
        color: 'from-purple-500 to-pink-500',
        tags: ['quantum', 'research', 'collaboration'],
        creator: 'Dr. Sarah Chen',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'Design System',
        description: 'Shared design assets and component library',
        isPublic: false,
        memberCount: 25,
        volumeCount: 15,
        resonanceStrength: 0.92,
        lastActivity: '1 hour ago',
        role: 'admin',
        color: 'from-blue-500 to-cyan-500',
        tags: ['design', 'components', 'ui'],
        creator: 'Elena Kowalski',
        createdAt: '2024-02-01',
      },
    ];
  },

  fetchActivities: async (): Promise<ActivityItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: '1',
        type: 'file_contributed',
        user: {
          id: 'sarah-chen',
          name: 'Sarah Chen',
          username: '@sarahc',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          isFollowing: true,
          verified: true,
        },
        action: 'shared some epic photos from their weekend trip',
        target: 'mountain_adventure_2024.zip',
        space: 'Photography Collective',
        details: 'Amazing mountain shots with perfect lighting! Check out these captures from the summit 📸✨',
        timestamp: '2 minutes ago',
        metrics: { likes: 47, comments: 12, shares: 8, hasLiked: false, hasBookmarked: false },
      },
    ];
  },

  fetchUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        username: '@sarahchen_quantum',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms.',
        isFollowing: true,
        stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
        recentActivity: 'Published breakthrough paper on quantum entanglement',
        tags: ['quantum-computing', 'research', 'algorithms'],
      },
    ];
  },
};

// App Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-load data on mount
  useEffect(() => {
    loadSpaces();
    loadActivities();
    loadUsers();
  }, []);

  const setCurrentView = (view: View): void => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  const setSelectedSpace = (spaceId: string | null): void => {
    dispatch({ type: 'SET_SELECTED_SPACE', payload: spaceId });
  };

  const setSearchQuery = (query: string): void => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const loadSpaces = async (): Promise<void> => {
    dispatch({ type: 'SET_SPACES_LOADING', payload: true });
    try {
      const spaces = await mockApi.fetchSpaces();
      dispatch({ type: 'SET_SPACES', payload: spaces });
    } catch (error) {
      dispatch({
        type: 'SET_SPACES_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load spaces',
      });
    } finally {
      dispatch({ type: 'SET_SPACES_LOADING', payload: false });
    }
  };

  const loadActivities = async (): Promise<void> => {
    dispatch({ type: 'SET_ACTIVITIES_LOADING', payload: true });
    try {
      const activities = await mockApi.fetchActivities();
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      dispatch({
        type: 'SET_ACTIVITIES_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load activities',
      });
    } finally {
      dispatch({ type: 'SET_ACTIVITIES_LOADING', payload: false });
    }
  };

  const loadUsers = async (): Promise<void> => {
    dispatch({ type: 'SET_USERS_LOADING', payload: true });
    try {
      const users = await mockApi.fetchUsers();
      dispatch({ type: 'SET_USERS', payload: users });
    } catch (error) {
      dispatch({
        type: 'SET_USERS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load users',
      });
    } finally {
      dispatch({ type: 'SET_USERS_LOADING', payload: false });
    }
  };

  const addSpace = (space: Space): void => {
    dispatch({ type: 'ADD_SPACE', payload: space });
  };

  const updateSpace = (id: string, updates: Partial<Space>): void => {
    dispatch({ type: 'UPDATE_SPACE', payload: { id, updates } });
  };

  const deleteSpace = (id: string): void => {
    dispatch({ type: 'DELETE_SPACE', payload: id });
  };

  const addActivity = (activity: ActivityItem): void => {
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
  };

  const updateActivity = (id: string, updates: Partial<ActivityItem>): void => {
    dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, updates } });
  };

  const updateUser = (id: string, updates: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: { id, updates } });
  };

  const clearErrors = (): void => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  const refreshData = async (): Promise<void> => {
    await Promise.all([loadSpaces(), loadActivities(), loadUsers()]);
  };

  const value: AppContextType = {
    ...state,
    setCurrentView,
    setSelectedSpace,
    setSearchQuery,
    loadSpaces,
    loadActivities,
    loadUsers,
    addSpace,
    updateSpace,
    deleteSpace,
    addActivity,
    updateActivity,
    updateUser,
    clearErrors,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Helper hooks for specific app states
export const useCurrentView = (): View => {
  const { currentView } = useApp();
  return currentView;
};

export const useSelectedSpace = (): string | null => {
  const { selectedSpaceId } = useApp();
  return selectedSpaceId;
};

export const useSpaces = (): { spaces: Space[]; loading: boolean; error: string | null } => {
  const { spaces, loading, errors } = useApp();
  return { spaces, loading: loading.spaces, error: errors.spaces };
};

export const useActivities = (): { activities: ActivityItem[]; loading: boolean; error: string | null } => {
  const { activities, loading, errors } = useApp();
  return { activities, loading: loading.activities, error: errors.activities };
};

export const useUsers = (): { users: User[]; loading: boolean; error: string | null } => {
  const { users, loading, errors } = useApp();
  return { users, loading: loading.users, error: errors.users };
};