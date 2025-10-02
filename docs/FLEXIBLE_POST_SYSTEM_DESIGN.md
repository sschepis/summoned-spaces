# Flexible Multi-Post-Type System Architecture

## 🎯 Overview

Design for a flexible, extensible post system supporting multiple content types with clean separation of concerns and type safety.

## 📋 Supported Post Types

### 1. Rich Text Updates
- **Features**: @mentions, #hashtags, rich formatting
- **Use Cases**: Status updates, discussions, announcements
- **Components**: RichTextEditor, MentionParser, HashtagParser

### 2. Article Links
- **Features**: Auto-preview generation, metadata extraction
- **Use Cases**: Sharing articles, blog posts, news
- **Components**: LinkPreviewGenerator, MetadataExtractor

### 3. YouTube Videos
- **Features**: Embedded player, thumbnail preview, metadata
- **Use Cases**: Video sharing, educational content
- **Components**: YouTubeEmbedder, VideoMetadataFetcher

### 4. Binary Files
- **Features**: File upload, preview generation, metadata
- **Use Cases**: Document sharing, image uploads, file distribution
- **Components**: FileUploader, PreviewGenerator, MetadataExtractor

## 🏗️ Architecture Design

### Core Type System

```typescript
// Base Post Interface
interface BasePost {
  id: string;
  author: Author;
  spaceName: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  type: PostType;
}

// Post Type Enum
enum PostType {
  RICH_TEXT = 'rich_text',
  ARTICLE_LINK = 'article_link', 
  YOUTUBE_VIDEO = 'youtube_video',
  BINARY_FILE = 'binary_file'
}

// Specific Post Types
interface RichTextPost extends BasePost {
  type: PostType.RICH_TEXT;
  content: string;
  mentions: Mention[];
  hashtags: Hashtag[];
  formatting: RichTextFormatting;
}

interface ArticleLinkPost extends BasePost {
  type: PostType.ARTICLE_LINK;
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  siteName: string;
  caption?: string;
}

interface YouTubeVideoPost extends BasePost {
  type: PostType.YOUTUBE_VIDEO;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  channelName: string;
  caption?: string;
}

interface BinaryFilePost extends BasePost {
  type: PostType.BINARY_FILE;
  files: FileAttachment[];
  caption?: string;
}
```

### Component Architecture

```
src/components/posts/
├── composer/
│   ├── PostComposer.tsx           # Main composer with type switching
│   ├── RichTextComposer.tsx       # Rich text editor
│   ├── ArticleLinkComposer.tsx    # URL input with preview
│   ├── YouTubeComposer.tsx        # YouTube URL input
│   └── FileUploadComposer.tsx     # File upload interface
├── renderers/
│   ├── PostRenderer.tsx           # Universal post renderer
│   ├── RichTextRenderer.tsx       # Rich text display
│   ├── ArticleLinkRenderer.tsx    # Article preview card
│   ├── YouTubeRenderer.tsx        # Embedded video player
│   └── BinaryFileRenderer.tsx     # File display/download
├── common/
│   ├── PostActions.tsx            # Like/Comment/Share
│   ├── PostHeader.tsx             # Author info, timestamp
│   └── PostTypeSelector.tsx       # Type selection tabs
└── parsers/
    ├── MentionParser.ts           # @username parsing
    ├── HashtagParser.ts           # #hashtag parsing
    └── LinkDetector.ts            # Auto-link detection
```

## 🔧 Implementation Strategy

### Phase 1: Core Infrastructure
1. **Type Definitions**: Create comprehensive TypeScript interfaces
2. **Base Components**: Build foundational UI components
3. **Post Renderer**: Universal renderer with type switching

### Phase 2: Rich Text System
1. **Rich Text Editor**: Implement with @mention and #hashtag support
2. **Text Parsing**: Build parsers for mentions and hashtags
3. **Formatting**: Add bold, italic, code formatting

### Phase 3: Link & Media Support
1. **Link Preview**: Auto-generate previews for article URLs
2. **YouTube Integration**: Embed videos with metadata
3. **File Upload**: Handle binary files with previews

### Phase 4: Enhanced Features
1. **Type Filtering**: Filter feed by post type
2. **Search**: Search within posts by type
3. **Analytics**: Track engagement by post type

## 🎨 User Experience Flow

### Composer Experience
```
1. User opens composer
2. Selects post type via tabs:
   📝 Text  🔗 Link  📺 Video  📎 File
3. Type-specific UI appears
4. Content is validated and formatted
5. Preview shown before posting
6. Post is created and appears in feed
```

### Feed Experience
```
1. Posts appear in chronological order
2. Each post renders with appropriate component
3. Rich text shows formatted content with clickable @mentions/#hashtags
4. Links show preview cards with images
5. Videos show embedded players
6. Files show download/preview options
7. All posts have consistent action bar
```

## 🔍 Technical Details

### Rich Text Features
- **@Mentions**: `@username` becomes clickable link to user profile
- **#Hashtags**: `#topic` becomes clickable link to topic feed  
- **Formatting**: Bold, italic, code blocks, lists
- **Auto-linking**: URLs become clickable links
- **Character limit**: 500 characters with counter

### Link Preview Generation
```
Process:
1. User pastes URL
2. Fetch metadata via Open Graph/Twitter Cards
3. Extract title, description, image
4. Generate preview card
5. Allow user to edit caption
```

### YouTube Integration
```
Process:
1. User pastes YouTube URL
2. Extract video ID
3. Fetch metadata via YouTube API
4. Show thumbnail and info
5. Embed player in feed
```

### File Upload System
```
Process:
1. User selects files (drag & drop or browse)
2. Validate file types and sizes
3. Generate previews for images
4. Upload to storage
5. Create file attachment metadata
```

## 🛡️ Validation & Security

### Input Validation
- **Rich Text**: Sanitize HTML, validate mentions/hashtags
- **URLs**: Validate format, check for malicious sites
- **Files**: Validate types, scan for malware, size limits
- **Content**: Spam detection, profanity filtering

### Security Measures
- **File Uploads**: Virus scanning, type validation
- **Link Previews**: Fetch via proxy, timeout limits
- **User Input**: XSS prevention, SQL injection protection
- **Rate Limiting**: Prevent spam posting

## 📊 Data Models

### Database Schema
```sql
-- Posts table
posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES users(id),
  space_id UUID REFERENCES spaces(id),
  type POST_TYPE_ENUM,
  content JSONB, -- Type-specific content
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0
);

-- Post interactions
post_likes (
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

-- Mentions and hashtags
post_mentions (
  post_id UUID REFERENCES posts(id),
  mentioned_user_id UUID REFERENCES users(id),
  position INTEGER
);

post_hashtags (
  post_id UUID REFERENCES posts(id),
  hashtag_id UUID REFERENCES hashtags(id)
);
```

### Content Storage
- **Rich Text**: Stored as structured JSON with formatting metadata
- **File Attachments**: Stored in object storage (S3) with metadata in DB
- **Link Previews**: Cached metadata to avoid repeated fetching
- **Video Metadata**: Cached YouTube API responses

## 🚀 Performance Optimizations

### Frontend
- **Lazy Loading**: Load post content as user scrolls
- **Virtual Scrolling**: Handle large feeds efficiently
- **Image Optimization**: Progressive loading, responsive images
- **Caching**: Cache rendered posts, user profiles

### Backend
- **CDN**: Serve static assets via CDN
- **Caching**: Redis for frequently accessed data
- **Database**: Optimized queries, proper indexing
- **File Storage**: Distributed storage with regional replicas

## 🔮 Future Enhancements

### Additional Post Types
- **Poll Posts**: Interactive polls with voting
- **Event Posts**: Calendar events with RSVP
- **Location Posts**: Posts with geographic data
- **Code Posts**: Syntax-highlighted code snippets

### Advanced Features
- **Post Scheduling**: Schedule posts for future publication
- **Post Templates**: Reusable post formats
- **Collaborative Posts**: Multiple authors
- **Post Analytics**: Detailed engagement metrics
- **AI Integration**: Auto-tagging, content suggestions

## 📝 Implementation Checklist

### Core System ✅
- [ ] Define TypeScript interfaces
- [ ] Create base post components
- [ ] Build universal post renderer
- [ ] Implement post type selector

### Rich Text ⏳
- [ ] Rich text editor component
- [ ] @mention parsing and linking
- [ ] #hashtag parsing and linking
- [ ] Text formatting (bold, italic, etc.)

### Link Previews ⏳
- [ ] URL detection and validation
- [ ] Metadata fetching service
- [ ] Preview card component
- [ ] Caching system

### YouTube Integration ⏳
- [ ] YouTube URL parsing
- [ ] Metadata API integration
- [ ] Embedded player component
- [ ] Responsive video display

### File System ⏳
- [ ] File upload component
- [ ] Preview generation
- [ ] File type validation
- [ ] Storage integration

### Testing & Polish 🔄
- [ ] Unit tests for all components
- [ ] Integration tests for workflows
- [ ] Performance testing
- [ ] Accessibility compliance
- [ ] Mobile responsiveness

---

This flexible architecture provides a solid foundation for supporting multiple post types while maintaining clean code organization and extensibility for future enhancements.