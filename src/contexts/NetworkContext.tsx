import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { webSocketService } from '../services/websocket';
import { ServerMessage } from '../../server/protocol';
import { PublicResonance } from '../services/holographic-memory';

// State Types
interface NetworkNode {
    userId: string;
    publicResonance: PublicResonance;
    connectionId: string;
}

export interface PostBeaconInfo {
    authorId: string;
    beacon: unknown;
    receivedAt: number;
}

interface NetworkState {
  nodes: NetworkNode[];
  recentBeacons: PostBeaconInfo[];
}

// Actions
type NetworkAction =
  | { type: 'SET_NETWORK_STATE'; payload: NetworkNode[] }
  | { type: 'ADD_BEACON'; payload: PostBeaconInfo };

// Context Type
type NetworkContextType = NetworkState;

// Initial State
const initialState: NetworkState = {
  nodes: [],
  recentBeacons: [],
};

// Reducer
const networkReducer = (state: NetworkState, action: NetworkAction): NetworkState => {
  switch (action.type) {
    case 'SET_NETWORK_STATE':
      return { ...state, nodes: action.payload };
    case 'ADD_BEACON': {
      // Keep the last 20 beacons for the feed
      const updatedBeacons = [action.payload, ...state.recentBeacons].slice(0, 20);
      return { ...state, recentBeacons: updatedBeacons };
    }
    default:
      return state;
  }
};

// Create Context
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Provider Props
interface NetworkProviderProps {
  children: ReactNode;
}

// Provider Component
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(networkReducer, initialState);

  useEffect(() => {
    const handleServerMessage = (message: ServerMessage) => {
      if (message.kind === 'networkStateUpdate') {
        dispatch({ type: 'SET_NETWORK_STATE', payload: message.payload.nodes });
      } else if (message.kind === 'newPostBeacon') {
        dispatch({
          type: 'ADD_BEACON',
          payload: { ...message.payload, receivedAt: Date.now() },
        });
      }
    };

    webSocketService.addMessageListener(handleServerMessage);

    return () => {
      webSocketService.removeMessageListener(handleServerMessage);
    };
  }, []);

  return (
    <NetworkContext.Provider value={state}>
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook
export const useNetworkState = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkState must be used within a NetworkProvider');
  }
  return context;
};