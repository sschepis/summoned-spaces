import { Video as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  color?: string;
  className?: string;
}

export function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  change, 
  color = 'text-cyan-400',
  className = '' 
}: MetricCardProps) {
  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendSymbol = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '+';
      case 'down': return '-';
      default: return '';
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>
      
      {change && (
        <div className={`text-sm ${getTrendColor(change.trend)}`}>
          {getTrendSymbol(change.trend)}{change.value}
        </div>
      )}
    </div>
  );
}