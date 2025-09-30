import { useMemo } from 'react';
import { useNetworkState } from '../contexts/NetworkContext';

export function NetworkTopology() {
  const { nodes } = useNetworkState();

  const nodePositions = useMemo(() => {
    const positions: { x: number; y: number; id: string; connectionId: string }[] = [];
    const count = nodes.length;
    const radius = 100;
    const centerX = 150;
    const centerY = 125;

    nodes.forEach((node, i) => {
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

  return (
    <div className="panel bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
      <h3 className="font-semibold text-lg text-purple-300 mb-4">
        Quantum Network Topology
      </h3>
      <div className="holographic-field rounded-lg overflow-hidden" style={{ minHeight: '250px' }}>
        <svg width="100%" height="250" className="bg-black/20">
          {nodePositions.map((pos) => (
            <g key={pos.connectionId}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="15"
                fill="rgba(59, 130, 246, 0.8)"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {pos.id.substring(0, 4)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}