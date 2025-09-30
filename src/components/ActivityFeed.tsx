import { useState } from 'react';
import { useNetworkState, PostBeaconInfo } from '../contexts/NetworkContext';
import { holographicMemoryManager } from '../services/holographic-memory';
import { webSocketService } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';

export function ActivityFeed() {
  const { recentBeacons } = useNetworkState();
  const { user } = useAuth();
  const [decodedContent, setDecodedContent] = useState<string | null>(null);
  const [selectedBeacon, setSelectedBeacon] = useState<number | null>(null);

  const handleBeaconClick = (beaconInfo: PostBeaconInfo, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = holographicMemoryManager.decodeMemory(beaconInfo.beacon as any);
    setDecodedContent(decoded);
    setSelectedBeacon(index);
  };

  const handleTeleport = (beaconInfo: PostBeaconInfo) => {
    if (!user) return;
    // For simplicity, we'll try to teleport to the first other user on the network
    const target = recentBeacons.find(b => b.authorId !== user.id);
    if (target) {
      webSocketService.sendMessage({
        kind: 'requestTeleport',
        payload: {
          targetUserId: target.authorId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          memoryId: (beaconInfo.beacon as any).id || 'mock_memory_id'
        }
      });
      alert(`Teleport request sent to ${target.authorId}`);
    } else {
      alert('No other users found to teleport to.');
    }
  };

  return (
    <div className="panel bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
      <h3 className="font-semibold text-lg text-purple-300 mb-4">
        Live Network Activity
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
        {recentBeacons.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Awaiting network activity...</p>
        ) : (
          recentBeacons.map((beaconInfo, index) => (
            <div key={beaconInfo.receivedAt} className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => handleBeaconClick(beaconInfo, index)}>
              <p className="text-sm text-cyan-300">
                <span className="font-bold">New Beacon</span> from node:
                <span className="font-mono ml-2 bg-cyan-900/50 px-2 py-1 rounded">
                  {beaconInfo.authorId.substring(0, 8)}...
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Received at: {new Date(beaconInfo.receivedAt).toLocaleTimeString()}
              </p>
              {user && beaconInfo.authorId !== user.id && (
                <button
                  onClick={() => handleTeleport(beaconInfo)}
                  className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mt-2"
                >
                  Teleport to Self
                </button>
              )}
              {selectedBeacon === index && decodedContent && (
                <div className="mt-2 p-2 bg-black/20 rounded">
                  <p className="text-white text-sm">{decodedContent}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}