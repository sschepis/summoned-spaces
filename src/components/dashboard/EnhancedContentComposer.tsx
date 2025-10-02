import { useState, useRef, useEffect } from 'react';
import { 
  Plus, Image, Paperclip, Send, Globe, Users, Hash, 
  Bold, Italic, Smile, Clock, Zap, FileText, Video,
  X, Eye, Upload, Sparkles, Target, Save
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Space {
  id: string;
  name: string;
  memberCount: number;
}

interface PostOptions {
  scheduled: boolean;
  hasAttachments: boolean;
}

interface EnhancedContentComposerProps {
  spaces: Space[];
  onPost: (content: string, selectedSpace: string, attachments: File[], options?: PostOptions) => void;
}

const POST_TEMPLATES = [
  { id: 'update', name: 'Update', icon: Zap, prompt: "What's new in your project?" },
  { id: 'question', name: 'Question', icon: Target, prompt: "Ask the community..." },
  { id: 'share', name: 'Share', icon: Sparkles, prompt: "Share something interesting..." },
  { id: 'announcement', name: 'Announce', icon: Globe, prompt: "Make an announcement..." }
];

const QUICK_EMOJIS = ['🚀', '💡', '🎉', '🤔', '💪', '🔥', '✨', '🎯', '👍', '❤️'];

export function EnhancedContentComposer({ spaces, onPost }: EnhancedContentComposerProps) {
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save draft
  useEffect(() => {
    if (content.trim()) {
      const timer = setTimeout(() => {
        localStorage.setItem('composer-draft', JSON.stringify({
          content,
          selectedSpace,
          timestamp: Date.now()
        }));
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, selectedSpace]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('composer-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const ageHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (ageHours < 24) { // Only load if less than 24 hours old
          setContent(parsed.content || '');
          setSelectedSpace(parsed.selectedSpace || '');
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleSubmit = () => {
    if (content.trim() && selectedSpace) {
      const options: PostOptions = {
        scheduled: isScheduled,
        hasAttachments: attachments.length > 0
      };
      onPost(content, selectedSpace, attachments, options);
      setContent('');
      setAttachments([]);
      setIsExpanded(false);
      setIsScheduled(false);
      localStorage.removeItem('composer-draft');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
    setIsExpanded(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const applyTemplate = (template: typeof POST_TEMPLATES[0]) => {
    setContent(template.prompt);
    setShowTemplates(false);
    setIsExpanded(true);
    textareaRef.current?.focus();
  };

  const getCharacterCountColor = () => {
    const ratio = content.length / 500;
    if (ratio >= 0.9) return 'text-red-400';
    if (ratio >= 0.8) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const isPostDisabled = !content.trim() || !selectedSpace || content.length > 500;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Card className={`bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-200 ${
        isDragging ? 'border-cyan-400 bg-cyan-500/10 scale-105' : ''
      }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Share Something</h3>
        </div>
        <div className="flex items-center space-x-2">
          {savedDraft && (
            <div className="flex items-center space-x-1 text-green-400 text-xs animate-pulse">
              <Save className="w-3 h-3" />
              <span>Draft saved</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-gray-400 hover:text-cyan-400"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Quick Templates */}
      {showTemplates && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-sm text-gray-300 font-medium mb-2">Quick Templates:</div>
          <div className="grid grid-cols-2 gap-2">
            {POST_TEMPLATES.map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                size="sm"
                onClick={() => applyTemplate(template)}
                className="flex items-center space-x-2 text-left justify-start text-gray-300 hover:text-white"
              >
                <template.icon className="w-4 h-4" />
                <span>{template.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Space Selection */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300 font-medium">Post to Space:</label>
          <select
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent
                     transition-all duration-200"
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
        <div className="space-y-2 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={isDragging ? "Drop files here to attach..." : "What's on your mind? Share an update, ask a question, or start a discussion..."}
            className={`w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white text-sm
                     placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 
                     focus:border-transparent transition-all duration-200 ${
                       isDragging ? 'bg-cyan-500/20 border-cyan-400' : ''
                     }`}
            rows={isExpanded ? 6 : 2}
          />
          
          {/* Formatting Toolbar */}
          {isExpanded && (
            <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/50 rounded-lg px-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertText('**bold**')}
                className="text-gray-400 hover:text-white p-1"
              >
                <Bold className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertText('*italic*')}
                className="text-gray-400 hover:text-white p-1"
              >
                <Italic className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojis(!showEmojis)}
                className="text-gray-400 hover:text-yellow-400 p-1"
              >
                <Smile className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Quick Emojis */}
        {showEmojis && (
          <div className="flex flex-wrap gap-1 p-2 bg-white/5 rounded-lg">
            {QUICK_EMOJIS.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => {
                  insertText(emoji);
                  setShowEmojis(false);
                }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-300 font-medium">Attachments:</div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2
                                           hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <Image className="w-3 h-3 text-cyan-400" />
                      ) : file.type.startsWith('video/') ? (
                        <Video className="w-3 h-3 text-purple-400" />
                      ) : (
                        <FileText className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">{file.name}</div>
                      <div className="text-gray-400 text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        {isExpanded && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`text-gray-400 hover:text-cyan-400 ${isScheduled ? 'text-cyan-400' : ''}`}
              >
                <Clock className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-cyan-400"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-400">
              {isScheduled && "Will post later"}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-cyan-400"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-purple-400"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertText('#')}
              className="text-gray-400 hover:text-green-400"
            >
              <Hash className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojis(!showEmojis)}
              className="text-gray-400 hover:text-yellow-400"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`text-xs ${getCharacterCountColor()} transition-colors`}>
              {content.length}/500
            </div>
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setShowEmojis(false);
                  setShowTemplates(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isPostDisabled}
              className="flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isScheduled ? 'Schedule' : 'Post'}</span>
            </Button>
          </div>
        </div>

        {/* Post Preview */}
        {isExpanded && content && selectedSpace && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-2 flex items-center space-x-2">
              <Eye className="w-3 h-3" />
              <span>Preview:</span>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-xs font-medium">
                  {spaces.find(s => s.id === selectedSpace)?.name}
                </span>
                {isScheduled && (
                  <span className="text-yellow-400 text-xs">• Scheduled</span>
                )}
              </div>
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{content}</p>
              {attachments.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  +{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
     </Card>
   </div>
 );
}