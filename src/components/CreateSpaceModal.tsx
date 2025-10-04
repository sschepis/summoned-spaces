import { useState, useEffect } from 'react';
import { X, Zap, Clock, Users, Globe, Loader2 } from 'lucide-react';
import { spaceManager } from '../services/space-manager';
import { useNotifications } from './NotificationSystem';
import { useAuth } from '../contexts/AuthContext';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated?: (spaceId: string) => void;
}

export function CreateSpaceModal({ isOpen, onClose, onSpaceCreated }: CreateSpaceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'standard',
    privacy: 'private',
    maxMembers: 50
  });
  const [isCreating, setIsCreating] = useState(false);
  const [servicesReady, setServicesReady] = useState(false);
  const { showError } = useNotifications();
  const { user } = useAuth();

  // Check if services are ready
  useEffect(() => {
    if (isOpen && user) {
      const checkReady = () => {
        const ready = spaceManager.isReady();
        setServicesReady(ready);
        if (!ready) {
          console.log('[CreateSpaceModal] Services not ready, checking again...');
        }
      };
      
      // Initial check
      checkReady();
      
      // Poll for readiness if not ready
      const interval = setInterval(checkReady, 500);
      
      // Clear interval after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!spaceManager.isReady()) {
          console.warn('[CreateSpaceModal] Services initialization timed out');
          setServicesReady(true); // Allow creation anyway, will show error if it fails
        }
      }, 10000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Space name is required';
    }
    if (formData.name.trim().length < 3) {
      return 'Space name must be at least 3 characters long';
    }
    if (formData.name.trim().length > 50) {
      return 'Space name must be 50 characters or less';
    }
    if (formData.description.length > 500) {
      return 'Description must be 500 characters or less';
    }
    // Basic name validation - alphanumeric, spaces, hyphens, underscores only
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name.trim())) {
      return 'Space name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form input
    const validationError = validateForm();
    if (validationError) {
      showError('Validation Error', validationError);
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Ensure we have a valid user
      if (!user || !user.id) {
        showError('Authentication Error', 'Please log in to create a space.');
        setIsCreating(false);
        return;
      }
      
      // Check if services are ready
      if (!spaceManager.isReady()) {
        showError('System Initializing', 'The system is still initializing. Please wait a moment and try again.');
        setIsCreating(false);
        return;
      }
      
      // Create space using spaceManager - this automatically adds creator as owner
      // Pass the user ID explicitly to avoid race conditions
      const spaceId = await spaceManager.createSpace(
        formData.name.trim(),
        formData.description.trim(),
        formData.privacy === 'public',
        user.id  // Explicitly pass user ID
      );
      
      console.log(`Space created successfully: ${spaceId}`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'standard',
        privacy: 'private',
        maxMembers: 50
      });
      
      onSpaceCreated?.(spaceId);
      onClose();
    } catch (error) {
      console.error('Failed to create space:', error);
      showError('Space Creation Failed', error instanceof Error ? error.message : 'Failed to create space. Please try again.');
    } finally {
      setIsCreating(false);
    }
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
                maxLength={50}
                minLength={3}
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
                maxLength={500}
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
                disabled={isCreating || !servicesReady}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white
                         rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all
                         duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center gap-2"
              >
                {!servicesReady ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Space'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}