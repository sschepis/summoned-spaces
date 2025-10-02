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

// Real beacon-based API functions
const beaconApi = {
  fetchSpaces: async (): Promise<Space[]> => {
    try {
      // TODO: Implement real beacon-based space fetching
      // In a real implementation, this would:
      // 1. Fetch public space beacons from the server
      // 2. Decode each beacon to get space metadata
      // 3. Return the decoded space data
      
      console.log('Fetching spaces from beacon system...');
      
      // For now, return empty array until beacon infrastructure is fully implemented
      return [];
      
      // Example implementation:
      // const spaceBeacons = await beaconCacheManager.getPublicSpaces();
      // return Promise.all(spaceBeacons.map(async (beacon) => {
      //   const decoded = holographicMemoryManager.decodeMemory(beacon);
      //   return JSON.parse(decoded);
      // }));
    } catch (error) {
      console.error('Failed to fetch spaces from beacons:', error);
      return [];
    }
  },

  fetchActivities: async (): Promise<ActivityItem[]> => {
    try {
      // TODO: Implement real beacon-based activity fetching
      // In a real implementation, this would:
      // 1. Fetch recent activity beacons from followed users
      // 2. Decode each beacon to get activity data
      // 3. Return the decoded activity feed
      
      console.log('Fetching activities from beacon system...');
      
      // For now, return empty array until beacon infrastructure is fully implemented
      return [];
      
      // Example implementation:
      // const activityBeacons = await beaconCacheManager.getRecentActivities();
      // return Promise.all(activityBeacons.map(async (beacon) => {
      //   const decoded = holographicMemoryManager.decodeMemory(beacon);
      //   return JSON.parse(decoded);
      // }));
    } catch (error) {
      console.error('Failed to fetch activities from beacons:', error);
      return [];
    }
  },

  fetchUsers: async (): Promise<User[]> => {
    try {
      // TODO: Implement real beacon-based user discovery
      // In a real implementation, this would:
      // 1. Fetch user profile beacons from the network
      // 2. Decode each beacon to get user profile data
      // 3. Return the decoded user profiles
      
      console.log('Fetching users from beacon system...');
      
      // For now, return empty array until beacon infrastructure is fully implemented
      return [];
      
      // Example implementation:
      // const userBeacons = await beaconCacheManager.getDiscoverableUsers();
      // return Promise.all(userBeacons.map(async (beacon) => {
      //   const decoded = holographicMemoryManager.decodeMemory(beacon);
      //   return JSON.parse(decoded);
      // }));
    } catch (error) {
      console.error('Failed to fetch users from beacons:', error);
      return [];
    }
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
      const spaces = await beaconApi.fetchSpaces();
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
      const activities = await beaconApi.fetchActivities();
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
      const users = await beaconApi.fetchUsers();
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