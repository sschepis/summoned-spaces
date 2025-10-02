import { Network } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NetworkTopology } from '../NetworkTopology';

export function NetworkVisualizationSection() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Network className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Live Quantum Network Visualization</h3>
      </div>
      <div className="h-96">
        <NetworkTopology />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span className="text-gray-300">You</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Connected Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-green-400"></div>
            <span className="text-gray-300">Quantum Entanglement</span>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          View Full Network
        </Button>
      </div>
    </Card>
  );
}