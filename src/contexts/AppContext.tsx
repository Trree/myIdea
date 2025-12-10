'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { BusinessIdea } from '@/types';

interface HistoryItem {
  id: string;
  timestamp: number;
  interests: string;
  generationType: string;
  model: string;
  ideas: BusinessIdea[];
}

interface AppContextType {
  // Model selection
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // History
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;

  // Favorites
  favorites: BusinessIdea[];
  addFavorite: (idea: BusinessIdea) => void;
  removeFavorite: (ideaTitle: string) => void;
  isFavorite: (ideaTitle: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<BusinessIdea[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('selectedModel');
      if (savedModel) setSelectedModel(savedModel);

      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }

      const savedHistory = localStorage.getItem('history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }

      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('Failed to parse favorites:', e);
        }
      }
    }
  }, []);

  // Save model to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedModel', selectedModel);
    }
  }, [selectedModel]);

  // Save theme to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 0) {
      localStorage.setItem('history', JSON.stringify(history));
    }
  }, [history]);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
  };

  const clearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('history');
    }
  };

  const addFavorite = (idea: BusinessIdea) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.title === idea.title)) {
        return prev;
      }
      return [...prev, idea];
    });
  };

  const removeFavorite = (ideaTitle: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.title !== ideaTitle));
  };

  const isFavorite = (ideaTitle: string) => {
    return favorites.some((fav) => fav.title === ideaTitle);
  };

  return (
    <AppContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        theme,
        toggleTheme,
        history,
        addToHistory,
        clearHistory,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
