import { Network } from 'lucide-react';
import { Card } from '../ui/Card';
import { NetworkTopology } from '../NetworkTopology';

export function NetworkTopologyCard() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Network className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Quantum Network Topology</h3>
      </div>
      <div className="h-64">
        <NetworkTopology />
      </div>
    </Card>
  );
}