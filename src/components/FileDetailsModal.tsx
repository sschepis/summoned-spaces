import { useState, useEffect } from 'react';
import { X, Download, Eye, Clock, User, Fingerprint, Activity, Zap, AlertCircle } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileEntry | null;
}

interface FileEntry {
  id: string;
  name: string;
  size: string;
  type: string;
  fingerprint: string;
  contributor: string;
  uploadedAt: string;
  lastAccessed?: string;
  accessCount: number;
  resonanceStrength: number;
  description?: string;
  tags: string[];
}

interface SummonProgress {
  stage: string;
  progress: number;
  resonance: number;
  entropy: number;
  eta: string;
}

const mockSummonProgress: SummonProgress = {
  stage: 'Phase Relationship Mapping',
  progress: 0.67,
  resonance: 0.82,
  entropy: 0.34,
  eta: '12s'
};

export function FileDetailsModal({ isOpen, onClose, file }: FileDetailsModalProps) {
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonProgress, setSummonProgress] = useState<SummonProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'resonance' | 'history'>('details');

  useEffect(() => {
    if (!isSummoning) {
      setSummonProgress(null);
    }
  }, [isSummoning]);

  if (!isOpen || !file) return null;

  const handleSummon = async () => {
    setIsSummoning(true);
    setSummonProgress(mockSummonProgress);
    
    // Simulate summoning progress
    const interval = setInterval(() => {
      setSummonProgress(prev => {
        if (!prev) return null;
        const newProgress = Math.min(prev.progress + 0.1, 1.0);
        if (newProgress >= 1.0) {
          clearInterval(interval);
          setIsSummoning(false);
          return null;
        }
        return { ...prev, progress: newProgress };
      });
    }, 500);
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Eye },
    { id: 'resonance', label: 'Resonance', icon: Zap },
    { id: 'history', label: 'History', icon: Clock }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-white/10 
                      w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Fingerprint className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{file.name}</h2>
                <p className="text-sm text-gray-400">{file.size} • {file.type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10">
            <nav className="flex px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">File Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Size:</span>
                          <span className="text-white font-mono">{file.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Type:</span>
                          <span className="text-white">{file.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Accessed:</span>
                          <span className="text-white">{file.accessCount} times</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Contributor</h3>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{file.contributor}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Fingerprint</h3>
                      <div className="bg-black/20 rounded-lg p-3 font-mono text-sm text-cyan-400 break-all">
                        {file.fingerprint}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Resonance Strength</h3>
                      <ResonanceIndicator strength={file.resonanceStrength} size="large" animated />
                      <div className="text-right mt-2">
                        <span className="text-sm font-mono text-cyan-400">
                          {(file.resonanceStrength * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {file.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 
                       <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 
                                                   text-xs rounded-full border border-blue-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resonance' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Resonance Analysis</h3>
                  <p className="text-gray-400">Current quantum state and summoning readiness</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Phase Coherence', value: '94.2%', color: 'text-green-400' },
                    { label: 'Quantum Entanglement', value: '87.6%', color: 'text-cyan-400' },
                    { label: 'Entropy Level', value: '12.3%', color: 'text-purple-400' }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center p-4 bg-white/5 rounded-lg">
                      <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {isSummoning && summonProgress && (
                  <div className="bg-black/20 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center space-x-2 mb-3">
                      <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="text-white font-medium">Summoning in Progress</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-400">{summonProgress.stage}</span>
                          <span className="text-sm text-cyan-400">ETA: {summonProgress.eta}</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full 
                                     transition-all duration-500"
                            style={{ width: `${summonProgress.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Access History</h3>
                <div className="space-y-3">
                  {[
                    { action: 'File summoned', user: 'Dr. Sarah Chen', time: '2 hours ago' },
                    { action: 'Resonance updated', user: 'System', time: '1 day ago' },
                    { action: 'File contributed', user: 'Marcus Rodriguez', time: '3 days ago' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 
                                             bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <div>
                          <div className="text-white text-sm">{event.action}</div>
                          <div className="text-gray-400 text-xs">by {event.user}</div>
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs">{event.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-white/10 bg-slate-800/50">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Uploaded {file.uploadedAt}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSummon}
                disabled={isSummoning}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                         rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                         duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 
                         flex items-center space-x-2"
              >
                {isSummoning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Summoning...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Summon File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}