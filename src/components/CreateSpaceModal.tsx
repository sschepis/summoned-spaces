import { useState } from 'react';
import { X, Zap, Clock, Users, Globe } from 'lucide-react';
import { webSocketService } from '../services/websocket';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'standard',
    privacy: 'private',
    maxMembers: 50
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    webSocketService.sendMessage({
      kind: 'createSpace',
      payload: {
        name: formData.name,
        description: formData.description,
        isPublic: formData.privacy === 'public'
      }
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-white/10 
                      w-full max-w-2xl p-8 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create New Space</h2>
              <p className="text-gray-400">Set up a new quantum-inspired collaboration space</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Space Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                         focus:border-transparent"
                placeholder="Enter space name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                         focus:border-transparent"
                placeholder="Describe the purpose of this space..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Space Type
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'standard', icon: Zap, label: 'Standard', desc: 'Permanent collaborative space' },
                    { id: 'temporal', icon: Clock, label: 'Temporal', desc: 'Auto-expiring space' }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center p-3 bg-white/5 rounded-lg border 
                                                   border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type.id}
                        checked={formData.type === type.id}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="sr-only"
                      />
                      <type.icon className="w-5 h-5 text-cyan-400 mr-3" />
                      <div className="flex-1">
                        <div className="text-white font-medium">{type.label}</div>
                        <div className="text-sm text-gray-400">{type.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.type === type.id ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'
                      }`} />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Privacy
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'private', icon: Users, label: 'Private', desc: 'Invite-only access' },
                    { id: 'public', icon: Globe, label: 'Public', desc: 'Anyone can join' }
                  ].map((privacy) => (
                    <label key={privacy.id} className="flex items-center p-3 bg-white/5 rounded-lg border 
                                                     border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value={privacy.id}
                        checked={formData.privacy === privacy.id}
                        onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                        className="sr-only"
                      />
                      <privacy.icon className="w-5 h-5 text-purple-400 mr-3" />
                      <div className="flex-1">
                        <div className="text-white font-medium">{privacy.label}</div>
                        <div className="text-sm text-gray-400">{privacy.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.privacy === privacy.id ? 'border-blue-400 bg-blue-400' : 'border-gray-500'
                      }`} />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                         rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                         duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Create Space
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}