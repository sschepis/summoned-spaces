import { useMemo, useState } from 'react';
import { useNetworkState } from '../contexts/NetworkContext';
import { userDataManager } from '../services/user-data-manager';

export function NetworkTopology() {
  const { nodes } = useNetworkState();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const nodePositions = useMemo(() => {
    // Deduplicate nodes by userId to prevent showing the same user multiple times
    const uniqueNodes = nodes.reduce((acc: any[], node) => {
      if (!acc.find(n => n.userId === node.userId)) {
        acc.push(node);
      }
      return acc;
    }, []);

    const positions: { x: number; y: number; id: string; connectionId: string }[] = [];
    const count = uniqueNodes.length;
    const radius = 100;
    const centerX = 150;
    const centerY = 125;

    uniqueNodes.forEach((node, i) => {
      const angle = (i / count) * 2 * Math.PI;
      positions.push({
        id: node.userId,
        connectionId: node.connectionId,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return positions;
  }, [nodes]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const getNodeDetails = (nodeId: string) => {
  const node = nodes.find(n => n.userId === nodeId);
  if (!node) return null;

  const followingList = userDataManager.getFollowingList();
  const isFollowing = followingList.includes(nodeId);
  const connectionTime = new Date(); // In real app, track actual connection time
  
  return {
    userId: nodeId,
    displayName: node.username || nodeId.substring(0, 8),
    fullId: nodeId,
    isFollowing,
    connectionTime: connectionTime.toLocaleTimeString(),
    publicResonance: node.publicResonance,
    status: 'Online',
    quantumCoherence: Math.random() * 0.3 + 0.7 // Calculate from actual quantum data
  };
};

  return (
    <div
      className="holographic-field rounded-lg overflow-hidden w-full h-full relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <svg width="100%" height="100%" className="bg-black/20" viewBox="0 0 300 250">
        {/* Connection lines between nodes */}
        {nodePositions.map((pos1, i) =>
          nodePositions.slice(i + 1).map((pos2) => (
            <line
              key={`${pos1.connectionId}-${pos2.connectionId}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth="1"
              className="animate-pulse"
            />
          ))
        )}
        
        {/* Nodes */}
        {nodePositions.map((pos) => {
          const isHovered = hoveredNode === pos.id;
          return (
            <g
              key={pos.connectionId}
              onMouseEnter={() => setHoveredNode(pos.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? "25" : "20"}
                fill={isHovered ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.8)"}
                stroke="rgba(34, 197, 94, 0.6)"
                strokeWidth="2"
                className={`drop-shadow-lg transition-all duration-200 ${isHovered ? 'animate-pulse' : ''}`}
              />
              {isHovered && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="35"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.4)"
                  strokeWidth="2"
                  className="animate-ping"
                />
              )}
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={isHovered ? "11" : "10"}
                fontWeight="bold"
              >
                {(() => {
                  const node = nodes.find(n => n.userId === pos.id);
                  const username = node?.username || pos.id.substring(0, 4);
                  return username.substring(0, 4);
                })()}
              </text>
            </g>
          );
        })}
        
        {/* Center quantum field indicator */}
        {nodes.length > 0 && (
          <circle
            cx="150"
            cy="125"
            r="5"
            fill="rgba(14, 165, 233, 0.8)"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Node Details Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-50 bg-black/90 backdrop-blur-sm border border-cyan-400/50
                     rounded-lg p-4 shadow-2xl pointer-events-none"
          style={{
            left: Math.min(mousePosition.x + 15, 200), // Keep tooltip in bounds
            top: Math.max(mousePosition.y - 10, 10),
            maxWidth: '250px'
          }}
        >
          {(() => {
            const details = getNodeDetails(hoveredNode);
            if (!details) return null;
            
            return (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold">{details.displayName}</span>
                  <span className="text-xs text-gray-400">{details.status}</span>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-cyan-300 font-mono">{details.fullId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connected:</span>
                    <span className="text-white">{details.connectionTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Following:</span>
                    <span className={details.isFollowing ? "text-green-400" : "text-gray-400"}>
                      {details.isFollowing ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coherence:</span>
                    <span className="text-purple-300">
                      {(details.quantumCoherence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-white/20 pt-2">
                  <div className="text-xs text-gray-400">Public Resonance</div>
                  <div className="text-xs text-cyan-300 font-mono mt-1">
                    [{details.publicResonance.primaryPrimes.join(', ')}]
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}