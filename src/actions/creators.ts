/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  ACTION_TYPES, 
  BaseAction, 
  AsyncAction, 
  OptimisticAction, 
  ErrorAction, 
  SuccessAction,
  ThunkAction,
} from './types';

// Helper function to create action with metadata
const createAction = (type: string, payload?: unknown, meta?: Record<string, unknown>): BaseAction => ({
  type,
  payload,
  meta: {
    timestamp: Date.now(),
    ...meta,
  },
});

// Helper function for async actions
const createAsyncActions = (baseType: string) => ({
  start: (payload?: unknown): AsyncAction => ({
    ...createAction(`${baseType}_START`, payload),
    loading: true,
  }),
  success: (payload: unknown): SuccessAction => ({
    type: `${baseType}_SUCCESS`,
    payload: { data: payload },
    meta: { timestamp: Date.now() },
  }),
  failure: (error: string | Error): ErrorAction => ({
    type: `${baseType}_FAILURE`,
    error: true,
    payload: {
      message: error instanceof Error ? error.message : error,
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
    },
    meta: { timestamp: Date.now(), error: true },
  }),
});

// Helper function for optimistic actions
const createOptimisticAction = (type: string, payload: unknown, rollback?: BaseAction): OptimisticAction => ({
  type,
  payload,
  meta: {
    timestamp: Date.now(),
    optimistic: true,
    rollback,
  },
});

// Auth Action Creators
export const authActions = {
  ...createAsyncActions(ACTION_TYPES.AUTH.LOGIN_START.replace('_START', '')),
  
  login: (email: string, password: string): ThunkAction => async (dispatch) => {
    dispatch(authActions.start());
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = { id: '1', email, name: 'User' };
      const token = `jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch(authActions.success({ user, token }));
      return { user, token };
    } catch (error) {
      dispatch(authActions.failure(error as Error));
      throw error;
    }
  },

  register: (email: string, password: string, name: string): ThunkAction => async (dispatch) => {
    dispatch(createAction(ACTION_TYPES.AUTH.REGISTER_START));
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const user = { id: Date.now().toString(), email, name };
      const token = `jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch(createAction(ACTION_TYPES.AUTH.REGISTER_SUCCESS, { user, token }));
      return { user, token };
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.AUTH.REGISTER_FAILURE, { 
        message: error instanceof Error ? error.message : 'Registration failed' 
      }));
      throw error;
    }
  },

  logout: (): BaseAction => createAction(ACTION_TYPES.AUTH.LOGOUT),
  
  updateProfile: (updates: Record<string, unknown>): BaseAction =>
    createAction(ACTION_TYPES.AUTH.UPDATE_PROFILE, updates),
  
  clearError: (): BaseAction => createAction(ACTION_TYPES.AUTH.CLEAR_ERROR),
};

// Space Action Creators
export const spaceActions = {
  ...createAsyncActions(ACTION_TYPES.SPACES.FETCH_START.replace('_START', '')),
  
  fetchSpaces: (): ThunkAction => async (dispatch) => {
    dispatch(spaceActions.start());
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const spaces = [
        { id: '1', name: 'Space 1', memberCount: 10 },
        { id: '2', name: 'Space 2', memberCount: 15 },
      ];
      dispatch(spaceActions.success(spaces));
      return spaces;
    } catch (error) {
      dispatch(spaceActions.failure(error as Error));
      throw error;
    }
  },

  createSpace: (spaceData: Record<string, unknown>): ThunkAction => async (dispatch) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticSpace = { ...spaceData, id: tempId };
    
    // Optimistic update
    const optimisticAction = createOptimisticAction(
      ACTION_TYPES.SPACES.CREATE_SUCCESS,
      optimisticSpace
    );
    dispatch(optimisticAction);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newSpace = { ...spaceData, id: Date.now().toString() };
      dispatch(createAction(ACTION_TYPES.SPACES.CREATE_SUCCESS, newSpace));
      return newSpace;
    } catch (error) {
      // Rollback optimistic update
      dispatch(createAction(ACTION_TYPES.SPACES.CREATE_FAILURE, {
        message: 'Failed to create space',
        rollbackId: tempId,
      }));
      throw error;
    }
  },

  updateSpace: (id: string, updates: Record<string, unknown>): ThunkAction => async (dispatch, getState) => {
    const currentState = getState();
    const currentSpace = currentState.spaces?.find((s: any) => s.id === id);
    
    // Optimistic update
    dispatch(createOptimisticAction(
      ACTION_TYPES.SPACES.UPDATE_SUCCESS,
      { id, updates },
      createAction(ACTION_TYPES.SPACES.UPDATE_SUCCESS, { id, updates: currentSpace })
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      dispatch(createAction(ACTION_TYPES.SPACES.UPDATE_SUCCESS, { id, updates }));
      return { id, updates };
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.SPACES.UPDATE_FAILURE, {
        message: 'Failed to update space',
        id,
      }));
      throw error;
    }
  },

  deleteSpace: (id: string): ThunkAction => async (dispatch, getState) => {
    const currentState = getState();
    const spaceToDelete = currentState.spaces?.find((s: any) => s.id === id);
    
    // Optimistic removal
    dispatch(createOptimisticAction(
      ACTION_TYPES.SPACES.DELETE_SUCCESS,
      { id },
      createAction(ACTION_TYPES.SPACES.CREATE_SUCCESS, spaceToDelete)
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      dispatch(createAction(ACTION_TYPES.SPACES.DELETE_SUCCESS, { id }));
      return { id };
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.SPACES.DELETE_FAILURE, {
        message: 'Failed to delete space',
        id,
      }));
      throw error;
    }
  },

  joinSpace: (id: string): BaseAction => 
    createAction(ACTION_TYPES.SPACES.JOIN_SPACE, { id }),
  
  leaveSpace: (id: string): BaseAction => 
    createAction(ACTION_TYPES.SPACES.LEAVE_SPACE, { id }),
  
  setSelected: (id: string | null): BaseAction => 
    createAction(ACTION_TYPES.SPACES.SET_SELECTED, { id }),
};

// Activity Action Creators
export const activityActions = {
  ...createAsyncActions(ACTION_TYPES.ACTIVITIES.FETCH_START.replace('_START', '')),
  
  fetchActivities: (filters?: Record<string, unknown>): ThunkAction => async (dispatch) => {
    dispatch(activityActions.start(filters));
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const activities = [
        { id: '1', type: 'file_contributed', userId: 'user1' },
        { id: '2', type: 'space_created', userId: 'user2' },
      ];
      dispatch(activityActions.success(activities));
      return activities;
    } catch (error) {
      dispatch(activityActions.failure(error as Error));
      throw error;
    }
  },

  likeActivity: (id: string): ThunkAction => async (dispatch, getState) => {
    const currentState = getState();
    const activity = currentState.activities?.find((a: any) => a.id === id);
    
    if (!activity) return;

    const optimisticUpdate = {
      ...activity,
      metrics: {
        ...activity.metrics,
        likes: activity.metrics.likes + 1,
        hasLiked: true,
      },
    };

    // Optimistic update
    dispatch(createOptimisticAction(
      ACTION_TYPES.ACTIVITIES.LIKE_ACTIVITY,
      { id, activity: optimisticUpdate }
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch(createAction(ACTION_TYPES.ACTIVITIES.LIKE_ACTIVITY, { id }));
    } catch (_error) {
      dispatch(createAction(ACTION_TYPES.ACTIVITIES.UPDATE_FAILURE, {
        message: 'Failed to like activity',
        id,
      }));
    }
  },

  bookmarkActivity: (id: string): BaseAction => 
    createAction(ACTION_TYPES.ACTIVITIES.BOOKMARK_ACTIVITY, { id }),
  
  addComment: (activityId: string, comment: string): ThunkAction => async (dispatch) => {
    const tempCommentId = `temp-${Date.now()}`;
    
    // Optimistic comment addition
    dispatch(createOptimisticAction(
      ACTION_TYPES.ACTIVITIES.ADD_COMMENT,
      { 
        activityId, 
        comment: { 
          id: tempCommentId, 
          content: comment, 
          timestamp: new Date().toISOString() 
        } 
      }
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newComment = { 
        id: Date.now().toString(), 
        content: comment, 
        timestamp: new Date().toISOString() 
      };
      dispatch(createAction(ACTION_TYPES.ACTIVITIES.ADD_COMMENT, {
        activityId,
        comment: newComment,
      }));
      return newComment;
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.ACTIVITIES.UPDATE_FAILURE, {
        message: 'Failed to add comment',
        tempCommentId,
      }));
      throw error;
    }
  },
};

// User Action Creators
export const userActions = {
  ...createAsyncActions(ACTION_TYPES.USERS.FETCH_START.replace('_START', '')),
  
  fetchUsers: (filters?: Record<string, unknown>): ThunkAction => async (dispatch) => {
    dispatch(userActions.start(filters));
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const users = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      dispatch(userActions.success(users));
      return users;
    } catch (error) {
      dispatch(userActions.failure(error as Error));
      throw error;
    }
  },

  followUser: (userId: string): ThunkAction => async (dispatch) => {
    // Optimistic update
    dispatch(createOptimisticAction(
      ACTION_TYPES.USERS.FOLLOW_USER,
      { userId, isFollowing: true }
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      dispatch(createAction(ACTION_TYPES.USERS.FOLLOW_USER, { userId }));
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.USERS.UNFOLLOW_USER, { userId }));
      throw error;
    }
  },

  unfollowUser: (userId: string): ThunkAction => async (dispatch) => {
    dispatch(createOptimisticAction(
      ACTION_TYPES.USERS.UNFOLLOW_USER,
      { userId, isFollowing: false }
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      dispatch(createAction(ACTION_TYPES.USERS.UNFOLLOW_USER, { userId }));
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.USERS.FOLLOW_USER, { userId }));
      throw error;
    }
  },

  searchUsers: (query: string): ThunkAction => async (dispatch) => {
    dispatch(createAction(ACTION_TYPES.USERS.SEARCH_USERS, { query, loading: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const results = [
        { id: '1', name: `User matching ${query}`, email: 'match@example.com' },
      ];
      dispatch(createAction(ACTION_TYPES.USERS.SEARCH_USERS, { 
        query, 
        results, 
        loading: false 
      }));
      return results;
    } catch (error) {
      dispatch(createAction(ACTION_TYPES.USERS.SEARCH_USERS, { 
        query, 
        error: error instanceof Error ? error.message : 'Search failed', 
        loading: false 
      }));
      throw error;
    }
  },
};

// UI Action Creators
export const uiActions = {
  setTheme: (theme: 'light' | 'dark' | 'auto'): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_THEME, { theme }),
  
  setSidebarOpen: (isOpen: boolean): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_SIDEBAR_OPEN, { isOpen }),
  
  setModalOpen: (modalId: string, isOpen: boolean): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_MODAL_OPEN, { modalId, isOpen }),
  
  setLoading: (key: string, isLoading: boolean): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_LOADING, { key, isLoading }),
  
  setError: (key: string, error: string): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_ERROR, { key, error }),
  
  clearError: (key?: string): BaseAction => 
    createAction(ACTION_TYPES.UI.CLEAR_ERROR, { key }),
  
  setView: (view: string): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_VIEW, { view }),
  
  setSearchQuery: (query: string): BaseAction => 
    createAction(ACTION_TYPES.UI.SET_SEARCH_QUERY, { query }),
};

// Real-time Action Creators
export const realtimeActions = {
  connect: (): BaseAction => createAction(ACTION_TYPES.REALTIME.SSE_CONNECT),

  disconnect: (): BaseAction => createAction(ACTION_TYPES.REALTIME.SSE_DISCONNECT),

  subscribeToSpace: (spaceId: string): BaseAction => 
    createAction(ACTION_TYPES.REALTIME.SUBSCRIBE_SPACE, { spaceId }),
  
  unsubscribeFromSpace: (spaceId: string): BaseAction => 
    createAction(ACTION_TYPES.REALTIME.UNSUBSCRIBE_SPACE, { spaceId }),
  
  resonanceUpdate: (entityId: string, resonance: number): BaseAction => 
    createAction(ACTION_TYPES.REALTIME.RESONANCE_UPDATE, { entityId, resonance }),
  
  resonanceLock: (entityId: string, strength: number): BaseAction => 
    createAction(ACTION_TYPES.REALTIME.RESONANCE_LOCK, { entityId, strength }),
};

// Notification Action Creators
export const notificationActions = {
  add: (notification: Record<string, unknown>): BaseAction =>
    createAction(ACTION_TYPES.NOTIFICATIONS.ADD_NOTIFICATION, notification),
  
  remove: (id: string): BaseAction => 
    createAction(ACTION_TYPES.NOTIFICATIONS.REMOVE_NOTIFICATION, { id }),
  
  markRead: (id: string): BaseAction => 
    createAction(ACTION_TYPES.NOTIFICATIONS.MARK_READ, { id }),
  
  markAllRead: (): BaseAction => 
    createAction(ACTION_TYPES.NOTIFICATIONS.MARK_ALL_READ),
  
  clearAll: (): BaseAction => 
    createAction(ACTION_TYPES.NOTIFICATIONS.CLEAR_ALL),
};

// Export all action creators
export const actions = {
  auth: authActions,
  spaces: spaceActions,
  activities: activityActions,
  users: userActions,
  ui: uiActions,
  realtime: realtimeActions,
  notifications: notificationActions,
};

export default actions;