import { useState, useEffect } from 'react';
import { Search, Sparkles, User, Users, FileText } from 'lucide-react';
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
// WebSocket service removed - using SSE communication manager
import { ServerMessage } from '../../server/protocol';
import { useAuth } from '../contexts/AuthContext';

interface SemanticSearchProps {
  onBack: () => void;
}

type SearchCategory = 'all' | 'people' | 'spaces' | 'posts';
type SortOption = 'relevance' | 'recent' | 'popular' | 'trending';

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
  const { waitForAuth } = useAuth();

  useEffect(() => {
    const handleMessage = (message: ServerMessage) => {
      if (message.kind === 'searchResponse') {
        setResults({
          people: message.payload.users.map(u => ({
            id: u.user_id,
            name: u.username,
            username: `@${u.username}`,
            avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${u.user_id}`,
            bio: 'Network user',
            isFollowing: false,
            stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0.5 },
            recentActivity: 'Active',
            tags: [],
          })),
          spaces: message.payload.spaces.map(s => ({
            id: s.space_id,
            name: s.name,
            description: s.description,
            isPublic: true,
            isJoined: false,
            memberCount: 0,
            tags: [],
          })),
          posts: message.payload.beacons.map((b) => ({
            id: b.beacon_id,
            author: {
              name: b.author_id.substring(0, 8),
              username: `@${b.author_id.substring(0, 8)}`,
              avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${b.author_id}`,
              verified: false,
            },
            content: '[Holographic Memory - Click to Summon]',
            timestamp: 'Recent',
            likes: 0,
            comments: 0,
            shares: 0,
            hasLiked: false,
            tags: ['memory'],
          })),
        });
        setIsSearching(false);
      }
    };

    webSocketService.addMessageListener(handleMessage);
    return () => webSocketService.removeMessageListener(handleMessage);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ people: [], spaces: [], posts: [] });
      return;
    }

    setIsSearching(true);
    
    // Wait for auth before searching
    await waitForAuth();
    
    webSocketService.sendMessage({
      kind: 'search',
      payload: { query: searchQuery, category }
    });
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