import { Hash, AtSign } from 'lucide-react';
import { RichTextPost } from '../../types/posts';

interface RichTextRendererProps {
  post: RichTextPost;
  onMentionClick?: (username: string) => void;
  onHashtagClick?: (hashtag: string) => void;
}

export function RichTextRenderer({ 
  post, 
  onMentionClick, 
  onHashtagClick 
}: RichTextRendererProps) {
  const renderContent = () => {
    let content = post.content;
    const elements: Array<{ type: 'text' | 'mention' | 'hashtag' | 'link'; content: string; position: number; length: number; data?: any }> = [];
    
    // Add mentions
    post.mentions.forEach(mention => {
      elements.push({
        type: 'mention',
        content: `@${mention.username}`,
        position: mention.position,
        length: mention.length,
        data: mention
      });
    });
    
    // Add hashtags
    post.hashtags.forEach(hashtag => {
      elements.push({
        type: 'hashtag',
        content: `#${hashtag.tag}`,
        position: hashtag.position,
        length: hashtag.length,
        data: hashtag
      });
    });
    
    // Add formatted links
    post.formatting.links.forEach(link => {
      elements.push({
        type: 'link',
        content: content.substring(link.start, link.end),
        position: link.start,
        length: link.end - link.start,
        data: { url: link.url }
      });
    });
    
    // Sort elements by position
    elements.sort((a, b) => a.position - b.position);
    
    // Build JSX with proper formatting
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    
    elements.forEach((element, index) => {
      // Add text before this element
      if (element.position > lastIndex) {
        const textBefore = content.substring(lastIndex, element.position);
        if (textBefore) {
          result.push(
            <span key={`text-${index}-before`}>
              {formatTextContent(textBefore, post.formatting)}
            </span>
          );
        }
      }
      
      // Add the formatted element
      switch (element.type) {
        case 'mention':
          result.push(
            <button
              key={`mention-${index}`}
              onClick={() => onMentionClick?.(element.data.username)}
              className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 
                       font-medium transition-colors cursor-pointer"
            >
              <AtSign className="w-3 h-3" />
              <span>{element.data.username}</span>
            </button>
          );
          break;
          
        case 'hashtag':
          result.push(
            <button
              key={`hashtag-${index}`}
              onClick={() => onHashtagClick?.(element.data.tag)}
              className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 
                       font-medium transition-colors cursor-pointer"
            >
              <Hash className="w-3 h-3" />
              <span>{element.data.tag}</span>
            </button>
          );
          break;
          
        case 'link':
          result.push(
            <a
              key={`link-${index}`}
              href={element.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              {element.content}
            </a>
          );
          break;
      }
      
      lastIndex = element.position + element.length;
    });
    
    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      result.push(
        <span key="text-end">
          {formatTextContent(remainingText, post.formatting)}
        </span>
      );
    }
    
    return result;
  };
  
  const formatTextContent = (text: string, formatting: RichTextPost['formatting']) => {
    // Apply bold, italic, code formatting
    // This is a simplified version - in reality you'd need more sophisticated parsing
    let formattedText = text;
    
    // For now, return plain text - full formatting would require more complex logic
    return formattedText;
  };

  return (
    <div className="prose prose-invert max-w-none">
      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
        {post.content.length > 0 ? renderContent() : (
          <span className="text-gray-400 italic">No content</span>
        )}
      </div>
      
      {/* Display mentions and hashtags summary for debugging/info */}
      {(post.mentions.length > 0 || post.hashtags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.mentions.length > 0 && (
            <div className="flex items-center space-x-1 text-xs">
              <AtSign className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">{post.mentions.length} mention{post.mentions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {post.hashtags.length > 0 && (
            <div className="flex items-center space-x-1 text-xs">
              <Hash className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400">{post.hashtags.length} hashtag{post.hashtags.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}