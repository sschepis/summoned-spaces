import { useState } from 'react';
import { ArrowLeft, Plus, Upload, Settings, Users, Zap } from 'lucide-react';
import { VolumeCard } from './VolumeCard';
import { FileUploadZone } from './FileUploadZone';
import { FileExplorer } from './FileExplorer';
import { MemberList } from './MemberList';
import { ResonanceLockingVisualizer } from './ResonanceLockingVisualizer';
import { SpaceChat } from './SpaceChat';
import { SpaceSettings } from './SpaceSettings';
import { FileDetailsModal } from './FileDetailsModal';

interface SpaceViewProps {
  spaceId: string | null;
  onBack: () => void;
}

const mockVolumes = [
  {
    id: '1',
    name: 'Research Papers',
    fileCount: 45,
    totalSize: '2.3 GB',
    resonanceStrength: 0.94,
    lastUpdate: '5 minutes ago',
    color: 'from-blue-500 to-cyan-500',
    isLocking: false
  },
  {
    id: '2',
    name: 'Design Assets',
    fileCount: 128,
    totalSize: '856 MB',
    resonanceStrength: 0.87,
    lastUpdate: '2 hours ago',
    color: 'from-purple-500 to-pink-500',
    isLocking: true
  },
  {
    id: '3',
    name: 'Documentation',
    fileCount: 23,
    totalSize: '124 MB',
    resonanceStrength: 0.76,
    lastUpdate: '1 day ago',
    color: 'from-green-500 to-emerald-500',
    isLocking: false
  }
];

export function SpaceView({ spaceId, onBack }: SpaceViewProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'volumes' | 'upload' | 'members' | 'chat' | 'resonance'>('files');
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileDetails, setShowFileDetails] = useState(false);

  const tabs = [
    { id: 'files', label: 'Files', icon: Zap },
    { id: 'volumes', label: 'Volumes', icon: Zap },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'chat', label: 'Chat', icon: Users },
    { id: 'resonance', label: 'Resonance', icon: Zap }
  ];

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setShowFileDetails(true);
  };

  const handleFileAction = (action: string, fileIds: string[]) => {
    console.log('File action:', action, fileIds);
    // Handle file actions like summon, delete, etc.
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">Project Quantum</h1>
          <p className="text-gray-400">Research collaboration space for quantum computing papers</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="border-b border-white/10 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
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

      {activeTab === 'files' && (
        <FileExplorer
          spaceId={spaceId || ''}
          onFileSelect={handleFileSelect}
          onFileAction={handleFileAction}
        />
      )}

      {activeTab === 'volumes' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Virtual Volumes</h2>
            <button
               className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white 
                       rounded-lg hover:from-blue-400 hover:to-teal-400 transition-all 
                       duration-200 flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Volume</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVolumes.map((volume) => (
              <VolumeCard key={volume.id} volume={volume} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <FileUploadZone onClose={() => setShowUploadZone(false)} />
      )}

      {activeTab === 'members' && <MemberList />}

      {activeTab === 'chat' && (
        <div className="h-[600px]">
          <SpaceChat spaceId={spaceId || ''} currentUserId="current-user" />
        </div>
      )}

      {activeTab === 'resonance' && <ResonanceLockingVisualizer />}

      <SpaceSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        spaceId={spaceId || ''}
      />

      <FileDetailsModal
        isOpen={showFileDetails}
        onClose={() => setShowFileDetails(false)}
        file={selectedFile}
      />
    </div>
  );
}