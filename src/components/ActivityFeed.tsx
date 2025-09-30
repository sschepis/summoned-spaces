import React from 'react';
import { useNetworkState } from '../contexts/NetworkContext';

export function ActivityFeed() {
  const { recentBeacons } = useNetworkState();

  return (
    <div className="panel bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
      <h3 className="font-semibold text-lg text-purple-300 mb-4">
        Live Network Activity
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
        {recentBeacons.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Awaiting network activity...</p>
        ) : (
          recentBeacons.map((beaconInfo) => (
            <div key={beaconInfo.receivedAt} className="p-3 bg-white/5 rounded-lg fade-in">
              <p className="text-sm text-cyan-300">
                <span className="font-bold">New Beacon</span> from node: 
                <span className="font-mono ml-2 bg-cyan-900/50 px-2 py-1 rounded">
                  {beaconInfo.authorId.substring(0, 8)}...
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Received at: {new Date(beaconInfo.receivedAt).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}