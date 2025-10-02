import { useState } from 'react';
import { MessageSquare, Link, Video, Paperclip, Send, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PostType, CreatePost } from '../../types/posts';
import { Space } from '../../types/common';
import { RichTextComposer } from './RichTextComposer';
import { ArticleLinkComposer } from './ArticleLinkComposer';
import { YouTubeComposer } from './YouTubeComposer';
import { FileUploadComposer } from './FileUploadComposer';

interface PostComposerProps {
  spaces: Space[];
  onPost: (post: CreatePost, type: PostType) => void;
  onCancel?: () => void;
  defaultSpace?: string;
  isExpanded?: boolean;
  placeholder?: string;
}

const postTypeConfig = [
  {
    type: PostType.RICH_TEXT,
    label: 'Text',
    icon: MessageSquare,
    description: 'Share thoughts, updates, or start discussions'
  },
  {
    type: PostType.ARTICLE_LINK,
    label: 'Link',
    icon: Link,
    description: 'Share articles, blog posts, or websites'
  },
  {
    type: PostType.YOUTUBE_VIDEO,
    label: 'Video',
    icon: Video,
    description: 'Share YouTube videos'
  },
  {
    type: PostType.BINARY_FILE,
    label: 'Files',
    icon: Paperclip,
    description: 'Upload documents, images, or other files'
  }
];

export function PostComposer({ 
  spaces, 
  onPost, 
  onCancel, 
  defaultSpace,
  isExpanded: initialExpanded = false,
  placeholder = "What's on your mind?" 
}: PostComposerProps) {
  const [selectedType, setSelectedType] = useState<PostType>(PostType.RICH_TEXT);
  const [selectedSpace, setSelectedSpace] = useState<string>(defaultSpace || '');
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isValid, setIsValid] = useState(false);
  const [postData, setPostData] = useState<Partial<CreatePost>>({});

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!isValid) {
      setIsExpanded(false);
      setSelectedType(PostType.RICH_TEXT);
      setPostData({});
    }
  };

  const handleTypeChange = (type: PostType) => {
    setSelectedType(type);
    setPostData({});
    setIsValid(false);
  };

  const handleContentChange = (data: Partial<CreatePost>, valid: boolean) => {
    setPostData(data);
    setIsValid(valid && !!selectedSpace);
  };

  const handleSubmit = () => {
    if (isValid && selectedSpace) {
      const finalPost = { ...postData, spaceId: selectedSpace } as CreatePost;
      onPost(finalPost, selectedType);
      
      // Reset form
      setPostData({});
      setIsValid(false);
      setIsExpanded(false);
      setSelectedType(PostType.RICH_TEXT);
    }
  };

  const currentConfig = postTypeConfig.find(config => config.type === selectedType);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {currentConfig && <currentConfig.icon className="w-5 h-5 text-cyan-400" />}
          <h3 className="text-lg font-semibold text-white">
            {isExpanded ? `Create ${currentConfig?.label} Post` : 'Share Something'}
          </h3>
        </div>
        {isExpanded && onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Space Selection */}
      {isExpanded && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Post to Space:
          </label>
          <select
            value={selectedSpace}
            onChange={(e) => {
              setSelectedSpace(e.target.value);
              setIsValid(!!postData && !!e.target.value);
            }}
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
      )}

      {/* Post Type Selector */}
      {isExpanded && (
        <div className="mb-6">
          <div className="flex space-x-2 mb-3">
            {postTypeConfig.map((config) => (
              <button
                key={config.type}
                onClick={() => handleTypeChange(config.type)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === config.type
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <config.icon className="w-4 h-4" />
                <span>{config.label}</span>
              </button>
            ))}
          </div>
          {currentConfig && (
            <p className="text-xs text-gray-400">{currentConfig.description}</p>
          )}
        </div>
      )}

      {/* Type-Specific Composer */}
      <div onClick={!isExpanded ? handleExpand : undefined}>
        {selectedType === PostType.RICH_TEXT && (
          <RichTextComposer
            isExpanded={isExpanded}
            placeholder={placeholder}
            onChange={handleContentChange}
          />
        )}
        
        {selectedType === PostType.ARTICLE_LINK && isExpanded && (
          <ArticleLinkComposer onChange={handleContentChange} />
        )}
        
        {selectedType === PostType.YOUTUBE_VIDEO && isExpanded && (
          <YouTubeComposer onChange={handleContentChange} />
        )}
        
        {selectedType === PostType.BINARY_FILE && isExpanded && (
          <FileUploadComposer onChange={handleContentChange} />
        )}
      </div>

      {/* Actions */}
      {isExpanded && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400">
            {selectedSpace && (
              <span>
                Posting to <span className="text-cyan-400">{spaces.find(s => s.id === selectedSpace)?.name}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapse}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}