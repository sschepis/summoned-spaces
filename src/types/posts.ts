// Post Type System for Flexible Multi-Content Social Feed

export enum PostType {
  RICH_TEXT = 'rich_text',
  ARTICLE_LINK = 'article_link',
  YOUTUBE_VIDEO = 'youtube_video',
  BINARY_FILE = 'binary_file'
}

export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface Mention {
  id: string;
  username: string;
  name: string;
  position: number;
  length: number;
}

export interface Hashtag {
  id: string;
  tag: string;
  position: number;
  length: number;
}

export interface RichTextFormatting {
  bold: Array<{ start: number; end: number }>;
  italic: Array<{ start: number; end: number }>;
  code: Array<{ start: number; end: number }>;
  links: Array<{ start: number; end: number; url: string }>;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  mimeType: string;
  previewUrl?: string;
  metadata?: Record<string, any>;
}

// Base Post Interface
export interface BasePost {
  id: string;
  author: Author;
  spaceId: string;
  spaceName: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  type: PostType;
}

// Specific Post Types
export interface RichTextPost extends BasePost {
  type: PostType.RICH_TEXT;
  content: string;
  mentions: Mention[];
  hashtags: Hashtag[];
  formatting: RichTextFormatting;
}

export interface ArticleLinkPost extends BasePost {
  type: PostType.ARTICLE_LINK;
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  siteName: string;
  caption?: string;
  metadata?: {
    publishedAt?: Date;
    author?: string;
    readTime?: number;
  };
}

export interface YouTubeVideoPost extends BasePost {
  type: PostType.YOUTUBE_VIDEO;
  videoId: string;
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  channelName: string;
  channelId: string;
  caption?: string;
  metadata?: {
    viewCount?: number;
    publishedAt?: Date;
    tags?: string[];
  };
}

export interface BinaryFilePost extends BasePost {
  type: PostType.BINARY_FILE;
  files: FileAttachment[];
  caption?: string;
}

// Union type for all post types
export type Post = RichTextPost | ArticleLinkPost | YouTubeVideoPost | BinaryFilePost;

// Post creation interfaces
export interface CreateRichTextPost {
  content: string;
  spaceId: string;
  mentions?: Mention[];
  hashtags?: Hashtag[];
  formatting?: RichTextFormatting;
}

export interface CreateArticleLinkPost {
  url: string;
  spaceId: string;
  caption?: string;
}

export interface CreateYouTubeVideoPost {
  videoUrl: string;
  spaceId: string;
  caption?: string;
}

export interface CreateBinaryFilePost {
  files: File[];
  spaceId: string;
  caption?: string;
}

export type CreatePost = 
  | CreateRichTextPost 
  | CreateArticleLinkPost 
  | CreateYouTubeVideoPost 
  | CreateBinaryFilePost;

// Post interaction interfaces
export interface PostInteraction {
  postId: string;
  userId: string;
  type: 'like' | 'comment' | 'share' | 'bookmark';
  timestamp: Date;
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  parentCommentId?: string;
  mentions?: Mention[];
}

// Post filter and search interfaces
export interface PostFilter {
  types?: PostType[];
  authorIds?: string[];
  spaceIds?: string[];
  hashtags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
}

export interface PostSearchQuery {
  query: string;
  filter?: PostFilter;
  sortBy?: 'timestamp' | 'likes' | 'comments' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Utility types
export interface PostDraft {
  id: string;
  type: PostType;
  content: Partial<CreatePost>;
  lastSaved: Date;
  autoSave: boolean;
}

export interface PostAnalytics {
  postId: string;
  views: number;
  uniqueViews: number;
  engagementRate: number;
  clickThroughRate?: number;
  topReferrers: string[];
  demographicData?: Record<string, any>;
}