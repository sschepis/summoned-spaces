import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Sparkles, User, Users, FileText, TrendingUp, Filter, Import as SortAsc, Clock, Heart, MessageCircle, Share, UserPlus, Plus, Globe, Lock, Zap, Star, ChevronDown } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface SemanticSearchProps {
  onBack: () => void;
}

type SearchCategory = 'all' | 'people' | 'spaces' | 'posts';
type SortOption = 'relevance' | 'recent' | 'popular' | 'trending';

interface SearchResult {
  id: string;
  type: 'person' | 'space' | 'post';
  title: string;
  description: string;
  relevanceScore: number;
  metadata: any;
}

interface Person {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
  isVerified: boolean;
  followers: number;
  spaces: number;
  resonanceScore: number;
  recentActivity: string;
  tags: string[];
}

interface SpaceResult {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  isJoined: boolean;
  memberCount: number;
  fileCount: number;
  resonanceStrength: number;
  recentActivity: string;
  creator: string;
  tags: string[];
  growthRate: number;
}

interface PostResult {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  hasLiked: boolean;
  space?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  };
  tags: string[];
}

const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms and quantum file systems.',
    isFollowing: false,
    isVerified: true,
    followers: 2847,
    spaces: 12,
    resonanceScore: 0.94,
    recentActivity: 'Published breakthrough paper on quantum entanglement',
    tags: ['quantum-computing', 'research', 'algorithms', 'physics']
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    username: '@marcustech',
    avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Full-stack developer building the future of collaborative platforms. Open source enthusiast.',
    isFollowing: true,
    isVerified: false,
    followers: 892,
    spaces: 8,
    resonanceScore: 0.89,
    recentActivity: 'Launched new open-source framework',
    tags: ['development', 'open-source', 'collaboration']
  },
  {
    id: '3',
    name: 'Elena Kowalski',
    username: '@elenakdesign',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Design systems architect creating quantum-inspired interfaces. Leading design at multiple startups.',
    isFollowing: false,
    isVerified: true,
    followers: 1543,
    spaces: 15,
    resonanceScore: 0.87,
    recentActivity: 'Released comprehensive design system',
    tags: ['design', 'ui-ux', 'design-systems', 'quantum-ui']
  }
];

const mockSpaces: SpaceResult[] = [
  {
    id: '1',
    name: 'Quantum Computing Research Hub',
    description: 'Advanced quantum computing discussions, research papers, and collaborative breakthrough projects.',
    isPublic: true,
    isJoined: false,
    memberCount: 2847,
    fileCount: 1249,
    resonanceStrength: 0.94,
    recentActivity: 'New breakthrough paper on quantum supremacy shared',
    creator: 'Dr. Sarah Chen',
    tags: ['quantum', 'computing', 'research', 'physics'],
    growthRate: 23.5
  },
  {
    id: '2',
    name: 'Open Source Collective',
    description: 'Collaborate on open source projects, share code, and build the future of software together.',
    isPublic: true,
    isJoined: true,
    memberCount: 3421,
    fileCount: 5678,
    resonanceStrength: 0.91,
    recentActivity: 'Major framework update released',
    creator: 'Marcus Rodriguez',
    tags: ['development', 'open-source', 'collaboration', 'coding'],
    growthRate: 31.7
  },
  {
    id: '3',
    name: 'Design Systems Guild',
    description: 'Professional designers sharing advanced techniques, component libraries, and design philosophies.',
    isPublic: false,
    isJoined: false,
    memberCount: 892,
    fileCount: 1834,
    resonanceStrength: 0.85,
    recentActivity: 'New design token system published',
    creator: 'Elena Kowalski',
    tags: ['design', 'ui-ux', 'design-systems'],
    growthRate: 18.4
  }
];

const mockPosts: PostResult[] = [
  {
    id: '1',
    author: {
      name: 'Dr. Sarah Chen',
      username: '@sarahchen_quantum',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      verified: true
    },
    content: 'Just achieved a breakthrough in quantum resonance algorithms! Our new approach reduces file summoning time by 73%. The implications for collaborative platforms are incredible 🚀⚡',
    timestamp: '2 hours ago',
    likes: 247,
    comments: 68,
    shares: 43,
    hasLiked: false,
    space: 'Quantum Computing Research Hub',
    tags: ['quantum', 'breakthrough', 'algorithms'],
    media: {
      type: 'image',
      url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '2',
    author: {
      name: 'Marcus Rodriguez',
      username: '@marcustech',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      verified: false
    },
    content: 'Finally open-sourced our collaborative file-sharing framework! Built with quantum-inspired architecture and prime-resonant algorithms. Contributors welcome 💻✨',
    timestamp: '5 hours ago',
    likes: 189,
    comments: 34,
    shares: 67,
    hasLiked: true,
    space: 'Open Source Collective',
    tags: ['open-source', 'framework', 'collaboration']
  },
  {
    id: '3',
    author: {
      name: 'Elena Kowalski',
      username: '@elenakdesign',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      verified: true
    },
    content: 'New design system is live! Quantum-inspired components with resonance-based interactions. Each element responds to user energy and context. The future of UI is here 🎨',
    timestamp: '1 day ago',
    likes: 456,
    comments: 92,
    shares: 128,
    hasLiked: false,
    space: 'Design Systems Guild',
    tags: ['design-system', 'quantum-ui', 'components']
  }
];

const trendingSearches = [
  'quantum algorithms',
  'design systems',
  'open source collaboration',
  'resonance locking',
  'prime numbers',
  'distributed computing',
  'ui components',
  'machine learning'
];

export function SemanticSearch({ onBack }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [spaces, setSpaces] = useState<SpaceResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPeople([]);
      setSpaces([]);
      setPosts([]);
      return;
    }

    setIsSearching(true);
    // Simulate semantic search processing
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Filter results based on query
    setPeople(mockPeople);
    setSpaces(mockSpaces);
    setPosts(mockPosts);
    setIsSearching(false);
  };

  const handleFollow = (personId: string) => {
    setPeople(prev =>
      prev.map(person =>
        person.id === personId
          ? { ...person, isFollowing: !person.isFollowing }
          : person
      )
    );
  };

  const handleJoinSpace = (spaceId: string) => {
    setSpaces(prev =>
      prev.map(space =>
        space.id === spaceId
          ? { ...space, isJoined: !space.isJoined }
          : space
      )
    );
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { 
              ...post, 
              hasLiked: !post.hasLiked,
              likes: post.hasLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getResultCounts = () => {
    return {
      all: people.length + spaces.length + posts.length,
      people: people.length,
      spaces: spaces.length,
      posts: posts.length
    };
  };

  const counts = getResultCounts();

  const categories = [
    { id: 'all', label: 'All', count: counts.all, icon: Sparkles },
    { id: 'people', label: 'People', count: counts.people, icon: User },
    { id: 'spaces', label: 'Spaces', count: counts.spaces, icon: Users },
    { id: 'posts', label: 'Posts', count: counts.posts, icon: FileText }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discover Everything</h1>
          <p className="text-gray-400">Search across people, spaces, and posts using quantum-semantic analysis</p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) {
                handleSearch(e.target.value);
              }
            }}
            placeholder="Search for people, spaces, posts, or topics..."
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 
                     rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500 focus:border-transparent text-lg"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Trending Searches */}
        {!query && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-400 mr-2">Trending:</span>
            {trendingSearches.slice(0, 5).map((trend, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(trend);
                  handleSearch(trend);
                }}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 
                         rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200
                         hover:border-cyan-500/30"
              >
                {trend}
              </button>
            ))}
          </div>
        )}

        {/* Category Tabs & Filters */}
        {query && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as SearchCategory)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    category === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="relevance" className="bg-slate-800">Most Relevant</option>
                <option value="recent" className="bg-slate-800">Most Recent</option>
                <option value="popular" className="bg-slate-800">Most Popular</option>
                <option value="trending" className="bg-slate-800">Trending</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <p className="text-gray-400">Analyzing quantum semantic patterns...</p>
              </div>
            </div>
          ) : (
            <>
              {/* People Results */}
              {(category === 'all' || category === 'people') && people.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <span>People ({people.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {people.map((person) => (
                      <div key={person.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                                                   hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                            />
                            {person.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full 
                                            flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-white">{person.name}</h4>
                                <p className="text-sm text-gray-400">{person.username}</p>
                              </div>
                              <button
                                onClick={() => handleFollow(person.id)}
                                className={`px-3 py-1.5 text-xs rounded-full transition-colors font-medium ${
                                  person.isFollowing
                                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                                }`}
                              >
                                {person.isFollowing ? 'Following' : 'Follow'}
                              </button>
                            </div>

                            <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">{person.bio}</p>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center">
                                <div className="text-sm font-bold text-white">{formatNumber(person.followers)}</div>
                                <div className="text-xs text-gray-400">Followers</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-white">{person.spaces}</div>
                                <div className="text-xs text-gray-400">Spaces</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-cyan-400">{(person.resonanceScore * 100).toFixed(0)}%</div>
                                <div className="text-xs text-gray-400">Resonance</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {person.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full 
                                                       border border-purple-500/30">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spaces Results */}
              {(category === 'all' || category === 'spaces') && spaces.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Spaces ({spaces.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {spaces.map((space) => (
                      <div key={space.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                                                   hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 
                                          rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {space.name.split(' ').map(word => word[0]).join('')}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-semibold text-white truncate">{space.name}</h4>
                                {space.isPublic ? (
                                  <Globe className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Lock className="w-4 h-4 text-orange-400" />
                                )}
                              </div>
                              
                              <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                                {space.description}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleJoinSpace(space.id)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                              space.isJoined
                                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                            }`}
                          >
                            {space.isJoined ? 'Joined' : 'Join'}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{formatNumber(space.memberCount)}</div>
                            <div className="text-xs text-gray-400">Members</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{formatNumber(space.fileCount)}</div>
                            <div className="text-xs text-gray-400">Files</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-cyan-400">+{space.growthRate}%</div>
                            <div className="text-xs text-gray-400">Growth</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Resonance Strength</span>
                            <span className="text-xs font-mono text-cyan-400">
                              {(space.resonanceStrength * 100).toFixed(1)}%
                            </span>
                          </div>
                          <ResonanceIndicator strength={space.resonanceStrength} size="small" animated />
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {space.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full 
                                                   border border-purple-500/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {(category === 'all' || category === 'posts') && posts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    <span>Posts ({posts.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                                                  hover:bg-white/8 transition-all duration-300">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                            />
                            {post.author.verified && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full 
                                            flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-white">{post.author.name}</span>
                              <span className="text-sm text-gray-400">{post.author.username}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{post.timestamp}</span>
                              {post.space && (
                                <>
                                  <span className="text-sm text-gray-500">in</span>
                                  <span className="text-sm text-purple-300">{post.space}</span>
                                </>
                              )}
                            </div>

                            <p className="text-white mb-4 leading-relaxed">{post.content}</p>

                            {post.media && (
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <img
                                  src={post.media.url}
                                  alt="Post media"
                                  className="w-full max-h-64 object-cover"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center space-x-2 transition-colors ${
                                    post.hasLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                                  }`}
                                >
                                  <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
                                  <span className="text-sm">{formatNumber(post.likes)}</span>
                                </button>
                                
                                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                                  <MessageCircle className="w-5 h-5" />
                                  <span className="text-sm">{formatNumber(post.comments)}</span>
                                </button>
                                
                                <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                                  <Share className="w-5 h-5" />
                                  <span className="text-sm">{formatNumber(post.shares)}</span>
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!isSearching && people.length === 0 && spaces.length === 0 && posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full 
                                flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-gray-400">
                    No results found for "{query}". Try different keywords or explore trending searches.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query && (
        <div className="text-center py-12">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full 
                          flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Discover Your Universe
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Use quantum-semantic search to find fascinating people, amazing spaces, and inspiring posts. 
                Our AI understands context and meaning, not just keywords.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <User className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Find People</h4>
                <p className="text-sm text-gray-400">Connect with creators, researchers, and innovators</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Join Spaces</h4>
                <p className="text-sm text-gray-400">Discover collaborative spaces for your interests</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Explore Posts</h4>
                <p className="text-sm text-gray-400">Find trending discussions and breakthrough ideas</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}