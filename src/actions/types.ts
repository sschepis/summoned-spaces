/* eslint-disable @typescript-eslint/no-explicit-any */
// Action types for the entire application
export const ACTION_TYPES = {
  // Authentication Actions
  AUTH: {
    LOGIN_START: 'AUTH/LOGIN_START',
    LOGIN_SUCCESS: 'AUTH/LOGIN_SUCCESS',
    LOGIN_FAILURE: 'AUTH/LOGIN_FAILURE',
    REGISTER_START: 'AUTH/REGISTER_START',
    REGISTER_SUCCESS: 'AUTH/REGISTER_SUCCESS',
    REGISTER_FAILURE: 'AUTH/REGISTER_FAILURE',
    LOGOUT: 'AUTH/LOGOUT',
    REFRESH_TOKEN: 'AUTH/REFRESH_TOKEN',
    UPDATE_PROFILE: 'AUTH/UPDATE_PROFILE',
    CLEAR_ERROR: 'AUTH/CLEAR_ERROR',
  },

  // Space Actions
  SPACES: {
    FETCH_START: 'SPACES/FETCH_START',
    FETCH_SUCCESS: 'SPACES/FETCH_SUCCESS',
    FETCH_FAILURE: 'SPACES/FETCH_FAILURE',
    CREATE_START: 'SPACES/CREATE_START',
    CREATE_SUCCESS: 'SPACES/CREATE_SUCCESS',
    CREATE_FAILURE: 'SPACES/CREATE_FAILURE',
    UPDATE_START: 'SPACES/UPDATE_START',
    UPDATE_SUCCESS: 'SPACES/UPDATE_SUCCESS',
    UPDATE_FAILURE: 'SPACES/UPDATE_FAILURE',
    DELETE_START: 'SPACES/DELETE_START',
    DELETE_SUCCESS: 'SPACES/DELETE_SUCCESS',
    DELETE_FAILURE: 'SPACES/DELETE_FAILURE',
    JOIN_SPACE: 'SPACES/JOIN_SPACE',
    LEAVE_SPACE: 'SPACES/LEAVE_SPACE',
    SET_SELECTED: 'SPACES/SET_SELECTED',
    CLEAR_SELECTED: 'SPACES/CLEAR_SELECTED',
  },

  // Activity Actions
  ACTIVITIES: {
    FETCH_START: 'ACTIVITIES/FETCH_START',
    FETCH_SUCCESS: 'ACTIVITIES/FETCH_SUCCESS',
    FETCH_FAILURE: 'ACTIVITIES/FETCH_FAILURE',
    CREATE_START: 'ACTIVITIES/CREATE_START',
    CREATE_SUCCESS: 'ACTIVITIES/CREATE_SUCCESS',
    CREATE_FAILURE: 'ACTIVITIES/CREATE_FAILURE',
    UPDATE_START: 'ACTIVITIES/UPDATE_START',
    UPDATE_SUCCESS: 'ACTIVITIES/UPDATE_SUCCESS',
    UPDATE_FAILURE: 'ACTIVITIES/UPDATE_FAILURE',
    DELETE_START: 'ACTIVITIES/DELETE_START',
    DELETE_SUCCESS: 'ACTIVITIES/DELETE_SUCCESS',
    DELETE_FAILURE: 'ACTIVITIES/DELETE_FAILURE',
    LIKE_ACTIVITY: 'ACTIVITIES/LIKE_ACTIVITY',
    UNLIKE_ACTIVITY: 'ACTIVITIES/UNLIKE_ACTIVITY',
    BOOKMARK_ACTIVITY: 'ACTIVITIES/BOOKMARK_ACTIVITY',
    UNBOOKMARK_ACTIVITY: 'ACTIVITIES/UNBOOKMARK_ACTIVITY',
    ADD_COMMENT: 'ACTIVITIES/ADD_COMMENT',
    REMOVE_COMMENT: 'ACTIVITIES/REMOVE_COMMENT',
  },

  // User Actions
  USERS: {
    FETCH_START: 'USERS/FETCH_START',
    FETCH_SUCCESS: 'USERS/FETCH_SUCCESS',
    FETCH_FAILURE: 'USERS/FETCH_FAILURE',
    FOLLOW_USER: 'USERS/FOLLOW_USER',
    UNFOLLOW_USER: 'USERS/UNFOLLOW_USER',
    BLOCK_USER: 'USERS/BLOCK_USER',
    UNBLOCK_USER: 'USERS/UNBLOCK_USER',
    UPDATE_PROFILE: 'USERS/UPDATE_PROFILE',
    SEARCH_USERS: 'USERS/SEARCH_USERS',
    SET_ONLINE_STATUS: 'USERS/SET_ONLINE_STATUS',
  },

  // File Actions
  FILES: {
    FETCH_START: 'FILES/FETCH_START',
    FETCH_SUCCESS: 'FILES/FETCH_SUCCESS',
    FETCH_FAILURE: 'FILES/FETCH_FAILURE',
    UPLOAD_START: 'FILES/UPLOAD_START',
    UPLOAD_PROGRESS: 'FILES/UPLOAD_PROGRESS',
    UPLOAD_SUCCESS: 'FILES/UPLOAD_SUCCESS',
    UPLOAD_FAILURE: 'FILES/UPLOAD_FAILURE',
    DELETE_FILE: 'FILES/DELETE_FILE',
    STAR_FILE: 'FILES/STAR_FILE',
    UNSTAR_FILE: 'FILES/UNSTAR_FILE',
    SUMMON_FILE: 'FILES/SUMMON_FILE',
    SET_SELECTED: 'FILES/SET_SELECTED',
  },

  // Chat Actions
  CHAT: {
    CONNECT: 'CHAT/CONNECT',
    DISCONNECT: 'CHAT/DISCONNECT',
    SEND_MESSAGE: 'CHAT/SEND_MESSAGE',
    RECEIVE_MESSAGE: 'CHAT/RECEIVE_MESSAGE',
    EDIT_MESSAGE: 'CHAT/EDIT_MESSAGE',
    DELETE_MESSAGE: 'CHAT/DELETE_MESSAGE',
    START_TYPING: 'CHAT/START_TYPING',
    STOP_TYPING: 'CHAT/STOP_TYPING',
    USER_JOINED: 'CHAT/USER_JOINED',
    USER_LEFT: 'CHAT/USER_LEFT',
    LOAD_HISTORY: 'CHAT/LOAD_HISTORY',
  },

  // Notification Actions
  NOTIFICATIONS: {
    ADD_NOTIFICATION: 'NOTIFICATIONS/ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'NOTIFICATIONS/REMOVE_NOTIFICATION',
    MARK_READ: 'NOTIFICATIONS/MARK_READ',
    MARK_ALL_READ: 'NOTIFICATIONS/MARK_ALL_READ',
    CLEAR_ALL: 'NOTIFICATIONS/CLEAR_ALL',
    SET_PREFERENCES: 'NOTIFICATIONS/SET_PREFERENCES',
  },

  // UI Actions
  UI: {
    SET_THEME: 'UI/SET_THEME',
    SET_SIDEBAR_OPEN: 'UI/SET_SIDEBAR_OPEN',
    SET_MODAL_OPEN: 'UI/SET_MODAL_OPEN',
    SET_LOADING: 'UI/SET_LOADING',
    SET_ERROR: 'UI/SET_ERROR',
    CLEAR_ERROR: 'UI/CLEAR_ERROR',
    SET_VIEW: 'UI/SET_VIEW',
    SET_SEARCH_QUERY: 'UI/SET_SEARCH_QUERY',
  },

  // Real-time Actions (SSE-based)
  REALTIME: {
    SSE_CONNECT: 'REALTIME/SSE_CONNECT',
    SSE_DISCONNECT: 'REALTIME/SSE_DISCONNECT',
    SSE_ERROR: 'REALTIME/SSE_ERROR',
    SSE_MESSAGE: 'REALTIME/SSE_MESSAGE',
    SUBSCRIBE_SPACE: 'REALTIME/SUBSCRIBE_SPACE',
    UNSUBSCRIBE_SPACE: 'REALTIME/UNSUBSCRIBE_SPACE',
    RESONANCE_UPDATE: 'REALTIME/RESONANCE_UPDATE',
    RESONANCE_LOCK: 'REALTIME/RESONANCE_LOCK',
    RESONANCE_UNLOCK: 'REALTIME/RESONANCE_UNLOCK',
  },

  // Search Actions
  SEARCH: {
    SET_QUERY: 'SEARCH/SET_QUERY',
    SET_FILTERS: 'SEARCH/SET_FILTERS',
    SEARCH_START: 'SEARCH/SEARCH_START',
    SEARCH_SUCCESS: 'SEARCH/SEARCH_SUCCESS',
    SEARCH_FAILURE: 'SEARCH/SEARCH_FAILURE',
    CLEAR_RESULTS: 'SEARCH/CLEAR_RESULTS',
    ADD_RECENT_SEARCH: 'SEARCH/ADD_RECENT_SEARCH',
    CLEAR_RECENT_SEARCHES: 'SEARCH/CLEAR_RECENT_SEARCHES',
  },
} as const;

// Base action interface
export interface BaseAction {
  type: string;
  payload?: any;
  meta?: {
    timestamp: number;
    source?: string;
    optimistic?: boolean;
    error?: boolean;
  };
}

// Async action states
export interface AsyncAction extends BaseAction {
  loading?: boolean;
  error?: string | null;
}

// Action with pagination
export interface PaginatedAction extends BaseAction {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Action with sorting
export interface SortableAction extends BaseAction {
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// Action with filters
export interface FilterableAction extends BaseAction {
  filters?: Record<string, unknown>;
}

// Real-time action
export interface RealtimeAction extends BaseAction {
  realtime: {
    channel: string;
    event: string;
    userId?: string;
    spaceId?: string;
  };
}

// Optimistic action
export interface OptimisticAction extends BaseAction {
  meta: {
    timestamp: number;
    optimistic: true;
    rollback?: BaseAction;
  };
}

// Error action
export interface ErrorAction extends BaseAction {
  error: true;
  payload: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// Success action
export interface SuccessAction extends BaseAction {
  payload: {
    data: unknown;
    message?: string;
  };
}

// Action creator function type
export type ActionCreator<T = unknown> = (...args: unknown[]) => BaseAction & T;

// Thunk action type
export type ThunkAction<R = any> = (
  dispatch: ActionDispatcher,
  getState: () => any
) => Promise<R> | R;

// Action dispatcher type
export type ActionDispatcher = (action: BaseAction | ThunkAction) => any;

// Action middleware type
export type ActionMiddleware = (
  action: BaseAction,
  next: ActionDispatcher,
  getState: () => any
) => any;

// Action handler type
export type ActionHandler<TState = any> = (
  state: TState,
  action: BaseAction
) => TState;

// Action registry entry
export interface ActionRegistryEntry {
  type: string;
  handler: ActionHandler;
  middleware?: ActionMiddleware[];
  validator?: (action: BaseAction) => boolean;
  transformer?: (action: BaseAction) => BaseAction;
}