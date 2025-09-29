import { useState } from 'react';
import { Search, ArrowLeft, Sparkles, FileText, Clock, Zap } from 'lucide-react';

interface SemanticSearchProps {
  onBack: () => void;
}

const searchResults = [
  {
    id: '1',
    title: 'Quantum Entanglement Principles',
    snippet: 'Comprehensive analysis of quantum entanglement phenomena and their applications in computing systems...',
    fileName: 'quantum_entanglement.pdf',
    spaceName: 'Project Quantum',
    relevanceScore: 0.94,
    lastModified: '2 days ago',
    fingerprint: 'A7C4E9F2...'
  },
  {
    id: '2',
    title: 'Prime Number Theory in Cryptography',
    snippet: 'Mathematical foundations of prime-based encoding systems used in modern cryptographic applications...',
    fileName: 'prime_crypto_theory.docx',
    spaceName: 'Research Papers',
    relevanceScore: 0.87,
    lastModified: '5 days ago',
    fingerprint: '3B8F1D6A...'
  },
  {
    id: '3',
    title: 'Hilbert Space Applications',
    snippet: 'Advanced mathematical concepts in Hilbert spaces and their practical implementations...',
    fileName: 'hilbert_applications.pdf',
    spaceName: 'Mathematics Archive',
    relevanceScore: 0.82,
    lastModified: '1 week ago',
    fingerprint: '9E2C7F83...'
  }
];

export function SemanticSearch({ onBack }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(searchResults);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate semantic search processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResults(searchResults);
    setIsSearching(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Semantic Search</h1>
          <p className="text-gray-400">Search files by meaning across all accessible spaces</p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="mb-8">
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
            placeholder="Search by meaning, concept, or topic..."
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

        <div className="flex flex-wrap gap-2 mt-4">
          {['quantum computing', 'prime numbers', 'mathematical theory', 'cryptography'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                handleSearch(suggestion);
              }}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 
                       rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Search Results {results.length > 0 && `(${results.length})`}
            </h2>
            {!isSearching && results.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Semantic analysis complete</span>
              </div>
            )}
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <p className="text-gray-400">Analyzing semantic patterns across spaces...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                           hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 
                                     transition-colors">
                          {result.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 mb-3 leading-relaxed">
                        {result.snippet}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{result.fileName}</span>
                        <span>•</span>
                        <span>{result.spaceName}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{result.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-mono text-purple-400">
                          {(result.relevanceScore * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {result.fingerprint}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="bg-gray-700 rounded-full h-1 flex-1 mr-4">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-cyan-400 h-1 rounded-full"
                        style={{ width: `${result.relevanceScore * 100}%` }}
                      />
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 
                                   text-white text-sm rounded-lg hover:from-cyan-400 hover:to-purple-400 
                                   transition-all duration-200">
                      Summon File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : query && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                No results found for "{query}". Try different keywords or concepts.
              </div>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full 
                          flex items-center justify-center mx-auto opacity-50">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Search Across All Spaces
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Use natural language to find files by their meaning and content, not just filenames
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}