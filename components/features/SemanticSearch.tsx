import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { performSemanticSearch } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Loader } from '../ui/Loader';
import { Slider } from '../ui/Slider';
import { EmptyState } from '../ui/EmptyState';

const SEARCH_HISTORY_KEY = 'semanticSearchHistory';

export const SemanticSearch: React.FC = () => {
  const { ingestedText, addNotification, llm } = useAppContext();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topK, setTopK] = useState(4);
  const [results, setResults] = useState<string[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse search history from localStorage", error);
    }
  }, []);

  const updateSearchHistory = (newQuery: string) => {
    const updatedHistory = [newQuery, ...searchHistory.filter(item => item.toLowerCase() !== newQuery.toLowerCase())].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const runSearch = useCallback(async (currentQuery: string) => {
    if (!ingestedText) {
      addNotification('Please ingest some text first.', 'info');
      return;
    }
    if (!currentQuery.trim()) {
      addNotification('Please enter a search query.', 'info');
      return;
    }
    setIsLoading(true);
    setSearchAttempted(true);
    setResults([]);
    try {
      updateSearchHistory(currentQuery);
      const searchResults = await performSemanticSearch(llm, ingestedText, currentQuery, topK);
      setResults(searchResults);
    } catch (e: any) {
      addNotification(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [ingestedText, topK, addNotification, searchHistory, llm]);
  
  const handleSearch = () => {
    runSearch(query);
  };
  
  const handleHistoryClick = (term: string) => {
    setQuery(term);
    runSearch(term);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  if (!ingestedText) {
    return <EmptyState 
      title="Semantic Search"
      message="Find the most relevant information in your notes. Ingest your study material to enable powerful, meaning-based search."
    />;
  }

  return (
    <Card title="Semantic Search">
      <div className="space-y-6">
        <div className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your indexed notes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Slider label="Top K" min={1} max={10} value={topK} onChange={setTopK} />
        </div>
        <div>
          <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        {searchHistory.length > 0 && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-slate-400">Recent Searches</h4>
              <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                Clear History
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(term)}
                  className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-full text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && <Loader />}
        
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200 mt-4">Search Results</h3>
            {results.map((result, index) => (
              <div 
                key={index} 
                className="bg-slate-800/50 p-4 rounded-md border border-slate-700 fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-slate-300 leading-relaxed">{result}</p>
              </div>
            ))}
          </div>
        )}

        {searchAttempted && !isLoading && results.length === 0 && (
             <p className="text-slate-400 mt-4">No relevant snippets found for your query.</p>
        )}
      </div>
    </Card>
  );
};