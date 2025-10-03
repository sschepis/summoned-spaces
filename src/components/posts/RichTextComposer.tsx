import { useState, useEffect, useRef } from 'react';
import { Hash, AtSign, Bold, Italic, Code } from 'lucide-react';
import { CreateRichTextPost, Mention, Hashtag, RichTextFormatting } from '../../types/posts';

interface RichTextComposerProps {
  isExpanded: boolean;
  placeholder: string;
  onChange: (data: Partial<CreateRichTextPost>, isValid: boolean) => void;
  maxLength?: number;
}

export function RichTextComposer({ 
  isExpanded, 
  placeholder, 
  onChange, 
  maxLength = 500 
}: RichTextComposerProps) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [formatting] = useState<RichTextFormatting>({
    bold: [],
    italic: [],
    code: [],
    links: []
  });
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // User suggestions and popular hashtags
  const [userSuggestions, setUserSuggestions] = useState<Array<{ id: string; username: string; name: string }>>([]);
  const [hashtagSuggestions] = useState<string[]>([
    'quantum', 'resonance', 'holographic', 'network', 'research', 'update', 'collaboration', 'innovation'
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const isValid = content.trim().length > 0 && content.length <= maxLength;
    onChange({ content, mentions, hashtags, formatting }, isValid);
  }, [content, mentions, hashtags, formatting, onChange, maxLength]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const curPos = e.target.selectionStart;
    
    setContent(newContent);
    setCursorPosition(curPos);
    
    // Parse mentions and hashtags
    parseMentionsAndHashtags(newContent);
    
    // Check for mention/hashtag triggers
    checkForSuggestionTriggers(newContent, curPos);
  };

  const parseMentionsAndHashtags = (text: string) => {
    // Parse @mentions
    const mentionRegex = /@(\w+)/g;
    const foundMentions: Mention[] = [];
    let mentionMatch;

    while ((mentionMatch = mentionRegex.exec(text)) !== null) {
      const username = mentionMatch[1];
      const user = userSuggestions.find(u => u.username === username);
      if (user) {
        foundMentions.push({
          id: user.id,
          username: user.username,
          name: user.name,
          position: mentionMatch.index,
          length: mentionMatch[0].length
        });
      }
    }

    // Parse #hashtags
    const hashtagRegex = /#(\w+)/g;
    const foundHashtags: Hashtag[] = [];
    let hashtagMatch;

    while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
      foundHashtags.push({
        id: hashtagMatch[1],
        tag: hashtagMatch[1],
        position: hashtagMatch.index,
        length: hashtagMatch[0].length
      });
    }

    setMentions(foundMentions);
    setHashtags(foundHashtags);
  };

  const checkForSuggestionTriggers = (text: string, curPos: number) => {
    const beforeCursor = text.substring(0, curPos);
    
    // Check for @ trigger
    const atMatch = beforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setShowMentionSuggestions(true);
      setShowHashtagSuggestions(false);
      const query = atMatch[1];
      setSearchQuery(query);
      
      // Fetch user suggestions based on partial input
      if (query.length > 0) {
        fetchUserSuggestions(query);
      }
    }
    // Check for # trigger
    else if (beforeCursor.match(/#(\w*)$/)) {
      setShowHashtagSuggestions(true);
      setShowMentionSuggestions(false);
    }
    // Hide suggestions
    else {
      setShowMentionSuggestions(false);
      setShowHashtagSuggestions(false);
      setSearchQuery('');
    }
  };

  const fetchUserSuggestions = async (query: string) => {
    try {
      // Fetch user suggestions from API
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const users = await response.json();
        setUserSuggestions(users);
      } else {
        console.error('Failed to fetch user suggestions:', response.statusText);
        setUserSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch user suggestions:', error);
      // Fallback to empty suggestions on error
      setUserSuggestions([]);
    }
  };

  const insertMention = (user: typeof userSuggestions[0]) => {
    if (!textareaRef.current) return;
    
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    const newContent = 
      content.substring(0, atIndex) + 
      `@${user.username} ` + 
      afterCursor;
    
    setContent(newContent);
    setShowMentionSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = atIndex + user.username.length + 2;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertHashtag = (tag: string) => {
    if (!textareaRef.current) return;
    
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const hashIndex = beforeCursor.lastIndexOf('#');
    
    const newContent = 
      content.substring(0, hashIndex) + 
      `#${tag} ` + 
      afterCursor;
    
    setContent(newContent);
    setShowHashtagSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = hashIndex + tag.length + 2;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const getDisplayContent = () => {
    if (!isExpanded || content.length === 0) return content;
    
    // Highlight mentions and hashtags
    let displayContent = content;
    
    // Replace mentions with styled spans (for display purposes)
    mentions.forEach(mention => {
      const mentionText = `@${mention.username}`;
      displayContent = displayContent.replace(mentionText, `<span class="text-cyan-400 font-medium">${mentionText}</span>`);
    });
    
    // Replace hashtags with styled spans
    hashtags.forEach(hashtag => {
      const hashtagText = `#${hashtag.tag}`;
      displayContent = displayContent.replace(hashtagText, `<span class="text-purple-400 font-medium">${hashtagText}</span>`);
    });
    
    return displayContent;
  };

  return (
    <div className="relative">
      {/* Text Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder={placeholder}
          className={`w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white text-sm
                     placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 
                     focus:border-transparent transition-all duration-200 ${
                       isExpanded ? 'min-h-[120px]' : 'h-12'
                     }`}
          rows={isExpanded ? 5 : 1}
          maxLength={maxLength}
        />
        
        {/* Character Counter */}
        {isExpanded && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            <span className={content.length > maxLength * 0.9 ? 'text-yellow-400' : ''}>
              {content.length}
            </span>
            /{maxLength}
          </div>
        )}
      </div>

      {/* Formatting Toolbar */}
      {isExpanded && (
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-white/5 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-white/5 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-green-400 hover:bg-white/5 rounded transition-colors"
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <AtSign className="w-3 h-3" />
              <span>mention</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Hash className="w-3 h-3" />
              <span>hashtag</span>
            </div>
          </div>
        </div>
      )}

      {/* Mention Suggestions */}
      {showMentionSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {userSuggestions.length > 0 ? (
            userSuggestions.map((user) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{user.name}</div>
                  <div className="text-gray-400 text-xs">@{user.username}</div>
                </div>
              </button>
            ))
          ) : searchQuery.length > 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">
              No users found matching "{searchQuery}"
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-400 text-sm">
              Start typing to search for users
            </div>
          )}
        </div>
      )}

      {/* Hashtag Suggestions */}
      {showHashtagSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {hashtagSuggestions.map((tag) => (
            <button
              key={tag}
              onClick={() => insertHashtag(tag)}
              className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-white/10 transition-colors text-left"
            >
              <Hash className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm">#{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Preview */}
      {isExpanded && content && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-2">Preview:</div>
          <div 
            className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm text-gray-200"
            dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
          />
        </div>
      )}
    </div>
  );
}