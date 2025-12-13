import { useState, useEffect, useCallback } from 'react';

interface UseSmartSearchReturn {
  searchTerm: string;
  debouncedTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
}

export const useSmartSearch = (initialTerm = '', delay = 400): UseSmartSearchReturn => {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(initialTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, delay]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    debouncedTerm,
    setSearchTerm,
    clearSearch,
    isSearching,
  };
};

export default useSmartSearch;