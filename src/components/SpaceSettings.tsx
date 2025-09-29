import { useState } from 'react';
import { X, Save, Settings, Shield, Users, Clock, Database, Trash2, AlertTriangle } from 'lucide-react';

interface SpaceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
}

interface SpaceConfig {
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'invite-only';
  maxMembers: number;
  autoArchive: boolean;
  archiveDays: number;
  requireApproval: boolean;
  defaultPermissions: string[];
  resonanceConfig: {
    primeCount: number;
    quantization: number;
    epochDuration: number;
  };
}

const initialConfig: SpaceConfig = {
  name: 'Project Quantum',
  description: 'Research collaboration space for quantum computing papers',
  visibility: 'private',
  maxMembers: 50,
  autoArchive: false,
  archiveDays: 90,
  requireApproval: true,
  defaultPermissions: ['view_space', 'view_volumes', 'summon_files'],
  resonanceConfig: {
    primeCount: 32,
    quantization: 64,
    epochDuration: 2000
  }
};

export function SpaceSettings({ isOpen, onClose, spaceId }: SpaceSettingsProps) {
  const [config, setConfig] = useState<SpaceConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'resonance' | 'danger'>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    // Save configuration
    console.log('Saving space config:', config);
    onClose();
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'resonance', label: 'Resonance', icon: Database },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-white/10 
                      w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">Space Settings</h2>
              <p className="text-sm text-gray-400">Configure {config.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 bg-slate-900/50">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Space Name
                        </label>
                        <input
                          type="text"
                          value={config.name}
                          onChange={(e) => setConfig({ ...config, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                   focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={config.description}
                          onChange={(e) => setConfig({ ...config, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                   focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Visibility
                        </label>
                        <select
                          value={config.visibility}
                          onChange={(e) => setConfig({ ...config, visibility: e.target.value as any })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="invite-only">Invite Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Maximum Members
                        </label>
                        <input
                          type="number"
                          value={config.maxMembers}
                          onChange={(e) => setConfig({ ...config, maxMembers: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                   focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">Require Approval</h4>
                          <p className="text-sm text-gray-400">New members must be approved by admins</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.requireApproval}
                            onChange={(e) => setConfig({ ...config, requireApproval: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                        peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">Auto Archive</h4>
                          <p className="text-sm text-gray-400">Automatically archive inactive files</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.autoArchive}
                            onChange={(e) => setConfig({ ...config, autoArchive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                        peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>

                      {config.autoArchive && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Archive after (days)
                          </label>
                          <input
                            type="number"
                            value={config.archiveDays}
                            onChange={(e) => setConfig({ ...config, archiveDays: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                     focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resonance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Resonance Configuration</h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Advanced quantum-inspired parameters for file encoding and reconstruction
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Prime Count ({config.resonanceConfig.primeCount})
                        </label>
                        <input
                          type="range"
                          min="16"
                          max="128"
                          value={config.resonanceConfig.primeCount}
                          onChange={(e) => setConfig({
                            ...config,
                            resonanceConfig: {
                              ...config.resonanceConfig,
                              primeCount: parseInt(e.target.value)
                            }
                          })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                                   slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 
                                   slider-thumb:rounded-full slider-thumb:bg-cyan-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Higher values increase security but require more computation
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Quantization Level ({config.resonanceConfig.quantization})
                        </label>
                        <input
                          type="range"
                          min="32"
                          max="256"
                          value={config.resonanceConfig.quantization}
                          onChange={(e) => setConfig({
                            ...config,
                            resonanceConfig: {
                              ...config.resonanceConfig,
                              quantization: parseInt(e.target.value)
                            }
                          })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Affects reconstruction precision and beacon size
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Epoch Duration ({config.resonanceConfig.epochDuration}ms)
                        </label>
                        <input
                          type="range"
                          min="1000"
                          max="10000"
                          step="100"
                          value={config.resonanceConfig.epochDuration}
                          onChange={(e) => setConfig({
                            ...config,
                            resonanceConfig: {
                              ...config.resonanceConfig,
                              epochDuration: parseInt(e.target.value)
                            }
                          })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Time between resonance synchronization cycles
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Irreversible actions that will permanently affect this space
                    </p>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-red-300 mb-2">Delete Space</h4>
                            <p className="text-sm text-gray-400 mb-4">
                              Permanently delete this space and all its volumes. This action cannot be undone.
                            </p>
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm 
                                       rounded-lg transition-colors"
                            >
                              Delete Space
                            </button>
                          </div>
                        </div>
                      </div>

                      {showDeleteConfirm && (
                        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <h4 className="font-medium text-red-300 mb-2">Are you absolutely sure?</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Type <strong>DELETE</strong> to confirm deletion of this space.
                          </p>
                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              placeholder="Type DELETE"
                              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg 
                                       text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm 
                                           rounded-lg transition-colors">
                              Confirm Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-white/10 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                       rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                       duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}