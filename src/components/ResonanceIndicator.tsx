interface ResonanceIndicatorProps {
  strength: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export function ResonanceIndicator({ 
  strength, 
  size = 'medium', 
  animated = false 
}: ResonanceIndicatorProps) {
  const getBarHeight = () => {
    switch (size) {
      case 'small': return 'h-1';
      case 'large': return 'h-3';
      default: return 'h-2';
    }
  };

  const getColor = () => {
    if (strength >= 0.8) return 'bg-green-400';
    if (strength >= 0.6) return 'bg-yellow-400';
    if (strength >= 0.4) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="relative">
      <div className={`w-full ${getBarHeight()} bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${getBarHeight()} ${getColor()} rounded-full transition-all duration-1000 
                    ${animated ? 'animate-pulse' : ''} relative overflow-hidden`}
          style={{ width: `${strength * 100}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          animate-shimmer -skew-x-12" />
          )}
        </div>
      </div>
      
      {size === 'large' && (
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      )}

      {animated && strength > 0.85 && (
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute inset-0 w-2 h-2 bg-cyan-300 rounded-full" />
        </div>
      )}
    </div>
  );
}