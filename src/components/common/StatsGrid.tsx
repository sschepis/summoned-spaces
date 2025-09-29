import { Video as LucideIcon } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { Grid } from '../ui/Grid';

interface Stat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  color?: string;
}

interface StatsGridProps {
  stats: Stat[];
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function StatsGrid({ stats, cols = 4, className = '' }: StatsGridProps) {
  return (
    <Grid cols={cols} className={className}>
      {stats.map((stat, index) => (
        <MetricCard
          key={`${stat.label}-${index}`}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          color={stat.color}
        />
      ))}
    </Grid>
  );
}