import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * Provides automatic serialization/deserialization and sync across tabs
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch custom event to sync across tabs
        window.dispatchEvent(new CustomEvent('localStorage', {
          detail: { key, value: valueToStore }
        }));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // Dispatch custom event to sync across tabs
      window.dispatchEvent(new CustomEvent('localStorage', {
        detail: { key, value: initialValue }
      }));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage', handleCustomStorageChange as EventListener);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing boolean values in localStorage
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false
): [boolean, () => void, () => void, (value: boolean) => void] {
  const [value, setValue, _removeValue] = useLocalStorage<boolean>(key, initialValue);

  const setTrue = useCallback(() => setValue(true), [setValue]);
  const setFalse = useCallback(() => setValue(false), [setValue]);

  return [value, setTrue, setFalse, setValue];
}

/**
 * Hook for managing arrays in localStorage with common array operations
 */
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [
  T[],
  {
    add: (item: T) => void;
    remove: (index: number) => void;
    removeBy: (predicate: (item: T) => boolean) => void;
    update: (index: number, item: T) => void;
    clear: () => void;
    set: (items: T[]) => void;
  }
] {
  const [array, setArray, _removeValue] = useLocalStorage<T[]>(key, initialValue);

  const operations = {
    add: useCallback((item: T) => {
      setArray(prev => [...prev, item]);
    }, [setArray]),

    remove: useCallback((index: number) => {
      setArray(prev => prev.filter((_, i) => i !== index));
    }, [setArray]),

    removeBy: useCallback((predicate: (item: T) => boolean) => {
      setArray(prev => prev.filter(item => !predicate(item)));
    }, [setArray]),

    update: useCallback((index: number, item: T) => {
      setArray(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
    }, [setArray]),

    clear: useCallback(() => {
      setArray([]);
    }, [setArray]),

    set: useCallback((items: T[]) => {
      setArray(items);
    }, [setArray]),
  };

  return [array, operations];
}

/**
 * Hook for managing object values in localStorage with merge functionality
 */
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, (value: T) => void, () => void] {
  const [object, setObject, removeValue] = useLocalStorage<T>(key, initialValue);

  const updateObject = useCallback((updates: Partial<T>) => {
    setObject(prev => ({ ...prev, ...updates }));
  }, [setObject]);

  return [object, updateObject, setObject, removeValue];
}

/**
 * Hook for managing user preferences with default fallbacks
 */
export function useUserPreferences() {
  const defaultPreferences = {
    theme: 'dark' as 'dark' | 'light' | 'auto',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      resonance: true,
      mentions: true,
    },
    privacy: {
      showOnline: true,
      showActivity: true,
      allowDiscovery: true,
    },
    display: {
      animationsEnabled: true,
      reducedMotion: false,
      highContrast: false,
    },
  };

  return useLocalStorageObject('user_preferences', defaultPreferences);
}

/**
 * Hook for managing recent searches
 */
export function useRecentSearches(maxItems: number = 10) {
  const [searches, operations] = useLocalStorageArray<string>('recent_searches', []);

  const addSearch = useCallback((query: string) => {
    if (query.trim()) {
      // Remove existing instances of the same query
      operations.removeBy(item => item.toLowerCase() === query.toLowerCase());
      // Add to the beginning
      operations.add(query.trim());
      // Keep only the most recent items
      if (searches.length >= maxItems) {
        const newSearches = [query.trim(), ...searches.slice(0, maxItems - 1)];
        operations.set(newSearches);
      }
    }
  }, [searches, operations, maxItems]);

  const removeSearch = useCallback((query: string) => {
    operations.removeBy(item => item === query);
  }, [operations]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches: operations.clear,
  };
}

/**
 * Hook for managing draft content (posts, messages, etc.)
 */
export function useDraftContent(contentType: string) {
  const key = `draft_${contentType}`;
  const [draft, setDraft, removeDraft] = useLocalStorage<string>(key, '');

  const saveDraft = useCallback((content: string) => {
    if (content.trim()) {
      setDraft(content);
    } else {
      removeDraft();
    }
  }, [setDraft, removeDraft]);

  const clearDraft = useCallback(() => {
    removeDraft();
  }, [removeDraft]);

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft: draft.trim().length > 0,
  };
}