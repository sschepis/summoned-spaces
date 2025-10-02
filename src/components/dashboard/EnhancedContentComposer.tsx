import { useState } from 'react';
import { Plus, Image, Paperclip, Send, Globe, Users, Hash } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Space {
  id: string;
  name: string;
  memberCount: number;
}

interface EnhancedContentComposerProps {
  spaces: Space[];
  onPost: (content: string, selectedSpace: string, attachments: File[]) => void;
}

export function EnhancedContentComposer({ spaces, onPost }: EnhancedContentComposerProps) {
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (content.trim() && selectedSpace) {
      onPost(content, selectedSpace, attachments);
      setContent('');
      setAttachments([]);
      setIsExpanded(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Share Something</h3>
      </div>
      
      <div className="space-y-4">
        {/* Space Selection */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300 font-medium">Post to Space:</label>
          <select
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            <option value="" className="bg-slate-800">Select a space...</option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id} className="bg-slate-800">
                {space.name} ({space.memberCount} members)
              </option>
            ))}
          </select>
        </div>

        {/* Content Input */}
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's on your mind? Share an update, ask a question, or start a discussion..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white text-sm
                     placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 
                     focus:border-transparent transition-all duration-200"
            rows={isExpanded ? 4 : 2}
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-300 font-medium">Attachments:</div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center">
                      <span className="text-cyan-400 text-xs">📄</span>
                    </div>
                    <span className="text-white text-xs">{file.name}</span>
                    <span className="text-gray-400 text-xs">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="text-gray-400 hover:text-cyan-400"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-purple-400"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-green-400"
            >
              <Hash className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              {content.length}/500
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedSpace || content.length > 500}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </Button>
          </div>
        </div>

        {/* Post Preview */}
        {isExpanded && content && selectedSpace && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-2">Preview:</div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-xs">
                  {spaces.find(s => s.id === selectedSpace)?.name}
                </span>
              </div>
              <p className="text-gray-200 text-sm">{content}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}