import { useState, useEffect } from 'react';
import { Activity, Zap, Target, Waves } from 'lucide-react';

const lockingStages = [
  { name: 'Prime Basis Calculation', progress: 100, color: 'text-green-400' },
  { name: 'Phase Relationship Mapping', progress: 87, color: 'text-yellow-400' },
  { name: 'Entropy-Guided Convergence', progress: 64, color: 'text-orange-400' },
  { name: 'Quantum State Reconstruction', progress: 23, color: 'text-red-400' }
];

const activeFiles = [
  {
    name: 'quantum_algorithms.pdf',
    size: '2.4 MB',
    fingerprint: 'FA7B9C2D...',
    lockingProgress: 0.78,
    resonanceStrength: 0.94
  },
  {
    name: 'entanglement_theory.docx',
    size: '1.8 MB',
    fingerprint: '8E3C91A5...',
    lockingProgress: 0.45,
    resonanceStrength: 0.82
  },
  {
    name: 'measurement_data.csv',
    size: '5.2 MB',
    fingerprint: '2B4F7E8A...',
    lockingProgress: 0.23,
    resonanceStrength: 0.67
  }
];

export function ResonanceLockingVisualizer() {
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Resonance Locking Chamber</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real-time visualization of quantum-inspired file reconstruction processes across the space network
        </p>
      </div>

      {/* Main Visualization */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <div className="relative aspect-square max-w-md mx-auto mb-8">
          {/* Central Core */}
          <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full 
                          animate-pulse flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Orbital Rings */}
          {[0, 1, 2].map((ring) => (
            <div
              key={ring}
              className={`absolute inset-0 border border-cyan-400/30 rounded-full 
                        animate-spin opacity-${70 - ring * 20}`}
              style={{
                margin: `${ring * 40 + 20}px`,
                animationDuration: `${(ring + 1) * 8}s`,
                animationDirection: ring % 2 === 0 ? 'normal' : 'reverse'
              }}
            >
              {/* Resonance Points */}
              {[...Array(4 + ring * 2)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `
                      translate(-50%, -50%) 
                      rotate(${(i * 360) / (4 + ring * 2)}deg) 
                      translateY(-${(ring * 40 + 20) + 100}px)
                    `
                  }}
                />
              ))}
            </div>
          ))}

          {/* Wave Effects */}
          <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-ping" 
               style={{ animationDuration: '4s' }} />
          <div className="absolute inset-4 rounded-full border border-cyan-400/20 animate-ping" 
               style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        {/* Phase Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {lockingStages.map((stage, index) => (
            <div
              key={stage.name}
              className={`p-4 rounded-lg border transition-all duration-500 ${
                activePhase === index
                  ? 'bg-white/10 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {activePhase === index && <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />}
                <h4 className={`text-sm font-medium ${activePhase === index ? 'text-cyan-300' : 'text-gray-300'}`}>
                  {stage.name}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-1000 ${
                      activePhase === index ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
                <span className={`text-xs font-mono ${stage.color}`}>
                  {stage.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Files */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Waves className="w-5 h-5 text-cyan-400" />
          <span>Active Resonance Locks</span>
        </h3>
        <div className="space-y-3">
          {activeFiles.map((file, index) => (
            <div
              key={file.name}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 
                       hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-medium text-white">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {file.size} • Fingerprint: {file.fingerprint}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-cyan-400">
                    {(file.lockingProgress * 100).toFixed(0)}% locked
                  </div>
                  <div className="text-xs text-gray-400">
                    Resonance: {(file.resonanceStrength * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Locking Progress</div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full 
                               transition-all duration-1000"
                      style={{ width: `${file.lockingProgress * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Resonance Strength</div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full 
                               transition-all duration-1000"
                      style={{ width: `${file.resonanceStrength * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}