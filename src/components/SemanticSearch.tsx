import { useState } from 'react';
import { Search, ArrowLeft, Sparkles, User, Users, FileText } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { SearchInput } from './ui/SearchInput';
import { Tabs } from './ui/Tabs';
import { Select } from './ui/forms/Select';
import { EmptyState } from './ui/EmptyState';
import { UserCard } from './common/UserCard';
import { SpaceCard } from './common/SpaceCard';
import { SearchResultsSection, PostCard } from './common/search';
import type { PostResult } from './common/search';
import { User as UserType, Space as SpaceType } from '../types/common';

interface SemanticSearchProps {
  onBack: () => void;
}

type SearchCategory = 'all' | 'people' | 'spaces' | 'posts';
type SortOption = 'relevance' | 'recent' | 'popular' | 'trending';

const mockPeople: UserType[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms and quantum file systems.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
    recentActivity: 'Published breakthrough paper on quantum entanglement',
    tags: ['quantum-computing', 'research', 'algorithms', 'physics']
  },
];

const mockSpaces: SpaceType[] = [
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
];

const trendingSearches = [
  'quantum algorithms',
  'design systems',
  'open source collaboration',
  'resonance locking',
];

export function SemanticSearch({ onBack }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ people: UserType[], spaces: SpaceType[], posts: PostResult[] }>({ people: [], spaces: [], posts: [] });

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ people: [], spaces: [], posts: [] });
      return;
    }

    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setResults({
      people: mockPeople,
      spaces: mockSpaces,
      posts: mockPosts,
    });
    setIsSearching(false);
  };

  const handleFollow = (personId: string) => {
    setResults(prev => ({
      ...prev,
      people: prev.people.map(p => p.id === personId ? { ...p, isFollowing: !p.isFollowing } : p)
    }));
  };

  const handleJoinSpace = (spaceId: string) => {
    setResults(prev => ({
      ...prev,
      spaces: prev.spaces.map(s => s.id === spaceId ? { ...s, isJoined: !s.isJoined } : s)
    }));
  };

  const handleLikePost = (postId: string) => {
    setResults(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === postId ? { ...p, hasLiked: !p.hasLiked, likes: p.hasLiked ? p.likes - 1 : p.likes + 1 } : p)
    }));
  };

  const counts = {
    all: results.people.length + results.spaces.length + results.posts.length,
    people: results.people.length,
    spaces: results.spaces.length,
    posts: results.posts.length
  };

  const categories = [
    { id: 'all', label: 'All', count: counts.all, icon: Sparkles },
    { id: 'people', label: 'People', count: counts.people, icon: User },
    { id: 'spaces', label: 'Spaces', count: counts.spaces, icon: Users },
    { id: 'posts', label: 'Posts', count: counts.posts, icon: FileText }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ];

  return (
    <PageLayout
      title="Discover Everything"
      subtitle="Search across people, spaces, and posts using quantum-semantic analysis"
      onBack={onBack}
    >
      <div className="mb-8 space-y-4">
        <SearchInput
          value={query}
          onChange={(q) => {
            setQuery(q);
            if (q) handleSearch(q);
          }}
          placeholder="Search for people, spaces, posts, or topics..."
          size="lg"
        />

        {!query && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-400 mr-2">Trending:</span>
            {trendingSearches.map((trend, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(trend);
                  handleSearch(trend);
                }}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200 hover:border-cyan-500/30"
              >
                {trend}
              </button>
            ))}
          </div>
        )}

        {query && (
          <div className="flex items-center justify-between">
            <Tabs
              tabs={categories}
              activeTab={category}
              onTabChange={(tabId) => setCategory(tabId as SearchCategory)}
              variant="pills"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              options={sortOptions}
            />
          </div>
        )}
      </div>

      {query && (
        <div className="space-y-6">
          {isSearching ? (
            <EmptyState icon={Search} title="Analyzing quantum semantic patterns..." description="Please wait while we search the quantum realm." />
          ) : (
            <>
              {(category === 'all' || category === 'people') && results.people.length > 0 && (
                <SearchResultsSection title="People" icon={User} count={results.people.length}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {results.people.map((person) => (
                      <UserCard key={person.id} user={person} onFollow={handleFollow} />
                    ))}
                  </div>
                </SearchResultsSection>
              )}

              {(category === 'all' || category === 'spaces') && results.spaces.length > 0 && (
                <SearchResultsSection title="Spaces" icon={Users} count={results.spaces.length}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {results.spaces.map((space) => (
                      <SpaceCard key={space.id} space={space} onJoin={handleJoinSpace} showJoinButton />
                    ))}
                  </div>
                </SearchResultsSection>
              )}

              {(category === 'all' || category === 'posts') && results.posts.length > 0 && (
                <SearchResultsSection title="Posts" icon={FileText} count={results.posts.length}>
                  <div className="space-y-4">
                    {results.posts.map((post) => (
                      <PostCard key={post.id} post={post} onLike={handleLikePost} />
                    ))}
                  </div>
                </SearchResultsSection>
              )}

              {!isSearching && counts.all === 0 && (
                <EmptyState icon={Search} title={`No results found for "${query}"`} description="Try different keywords or explore trending searches." />
              )}
            </>
          )}
        </div>
      )}

      {!query && (
        <EmptyState
          icon={Sparkles}
          title="Discover Your Universe"
          description="Use quantum-semantic search to find fascinating people, amazing spaces, and inspiring posts. Our AI understands context and meaning, not just keywords."
        />
      )}
    </PageLayout>
  );
}