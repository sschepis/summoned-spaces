import { useState, useRef } from 'react';
import { Image, Video, FileText, Smile, MapPin, Users, Globe, Lock, Zap, X, Plus, ChevronDown, Hash, User } from 'lucide-react';

interface ContentComposerProps {
  onPost: (content: PostContent) => void;
}

interface PostContent {
  text: string;
  media?: {
    type: 'image' | 'video' | 'file';
    url: string;
    filename?: string;
    size?: string;
  }[];
  feedId: string;
  feedName: string;
  location?: string;
  tags: string[];
}

const spaceOptions = [
  { 
    id: 'personal-space', 
    name: 'Your Personal Space', 
    icon: User, 
    description: 'Share to your personal space',
    type: 'personal' as const
  },
  { 
    id: 'global-space', 
    name: 'Global Space', 
    icon: Globe, 
    description: 'Share publicly to the global space',
    type: 'global' as const
  },
  { 
    id: 'photography-space', 
    name: 'Photography Collective', 
    icon: Hash, 
    description: 'Space • 2.4k members',
    type: 'space' as const
  },
  { 
    id: 'music-space', 
    name: 'Beat Makers United', 
    icon: Hash, 
    description: 'Space • 892 members',
    type: 'space' as const
  },
  { 
    id: 'design-space', 
    name: 'Digital Art Hub', 
    icon: Hash, 
    description: 'Space • 1.2k members',
    type: 'space' as const
  }
];

export function ContentComposer({ onPost }: ContentComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(spaceOptions[0]);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!content.trim() && attachedFiles.length === 0) return;

    const postContent: PostContent = {
      text: content,
      media: attachedFiles,
      feedId: selectedSpace.id,
      feedName: selectedSpace.name,
      tags
    };

    onPost(postContent);
    
    // Reset form
    setContent('');
    setAttachedFiles([]);
    setTags([]);
    setIsExpanded(false);
    setSelectedSpace(spaceOptions[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'file',
        url: URL.createObjectURL(file),
        filename: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      }));
      setAttachedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };


  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden 
                    hover:bg-white/8 transition-all duration-300">
      {/* Composer Header */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
            alt="You"
            className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
          />
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's happening in your quantum space?"
              className="w-full bg-transparent text-white text-lg placeholder-gray-400 
                       resize-none focus:outline-none min-h-[60px] max-h-[200px]"
              rows={isExpanded ? 4 : 2}
            />
          </div>
        </div>

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 
                                        rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  {file.type === 'image' ? (
                    <Image className="w-5 h-5 text-green-400" />
                  ) : file.type === 'video' ? (
                    <Video className="w-5 h-5 text-purple-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-cyan-400" />
                  )}
                  <div>
                    <div className="text-white text-sm">{file.filename}</div>
                    <div className="text-gray-400 text-xs">{file.size}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {(tags.length > 0 || isExpanded) && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                   className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-300 
                           text-sm rounded-full border border-blue-500/30">
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {isExpanded && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tags..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                           text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-lg 
                           hover:bg-purple-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}

        {/* Expanded Options */}
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-white/10">
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg 
                           hover:bg-cyan-400/10"
                  title="Attach files"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg 
                           hover:bg-yellow-400/10"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg 
                           hover:bg-green-400/10"
                  title="Add location"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-400">
                  {content.length}/2000
                </div>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                <div className="relative">
                  <div className="flex items-center">
                    <button
                      onClick={handlePost}
                      disabled={!content.trim() && attachedFiles.length === 0}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                               rounded-l-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                               duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 
                               disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <selectedSpace.icon className="w-4 h-4" />
                      <span>Share to {selectedSpace.name}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowSpaceSelector(!showSpaceSelector)}
                      className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                               rounded-r-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                               duration-200 shadow-lg hover:shadow-xl border-l border-white/20"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Space Selection Dropdown */}
                  {showSpaceSelector && (
                    <div className="absolute bottom-12 right-0 z-50 bg-slate-800 rounded-lg shadow-2xl 
                                  border border-white/10 py-2 min-w-72">
                      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">
                        Choose space
                      </div>
                      {spaceOptions.map((space) => (
                        <button
                          key={space.id}
                          onClick={() => {
                            setSelectedSpace(space);
                            setShowSpaceSelector(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors 
                                   flex items-start space-x-3 ${
                            selectedSpace.id === space.id ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                          }`}
                        >
                          <space.icon className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{space.name}</div>
                            <div className="text-gray-400 text-xs">{space.description}</div>
                          </div>
                          {selectedSpace.id === space.id && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Bar (when collapsed) */}
      {!isExpanded && (
        <div className="px-6 pb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Image className="w-4 h-4" />
              <span className="text-sm">Photo</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Video className="w-4 h-4" />
              <span className="text-sm">Video</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
              <FileText className="w-4 h-4" />
              <span className="text-sm">File</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <selectedSpace.icon className="w-3 h-3" />
            <span>Sharing to {selectedSpace.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}