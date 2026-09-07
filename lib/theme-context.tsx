'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';
type TextSize = 'normal' | 'large';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  textSize: TextSize;
  isLargeText: boolean;
  toggleTextSize: () => void;
  setTextSize: (size: TextSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ================= THEME STORE =================
function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getServerThemeSnapshot(): Theme {
  return 'light';
}

const themeListeners = new Set<() => void>();
function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  return () => {
    themeListeners.delete(callback);
  };
}

function notifyThemeChange(newTheme: Theme) {
  try {
    localStorage.setItem('theme', newTheme);
  } catch {
    // Ignore
  }
  if (typeof document !== 'undefined') {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  themeListeners.forEach((l) => l());
}

// ================= TEXT SIZE STORE =================
function getTextSizeSnapshot(): TextSize {
  if (typeof window === 'undefined') return 'normal';
  try {
    const saved = localStorage.getItem('text_size');
    if (saved === 'large' || saved === 'normal') return saved;
    return 'normal';
  } catch {
    return 'normal';
  }
}

function getServerTextSizeSnapshot(): TextSize {
  return 'normal';
}

const textSizeListeners = new Set<() => void>();
function subscribeTextSize(callback: () => void) {
  textSizeListeners.add(callback);
  return () => {
    textSizeListeners.delete(callback);
  };
}

function notifyTextSizeChange(newSize: TextSize) {
  try {
    localStorage.setItem('text_size', newSize);
  } catch {
    // Ignore
  }
  if (typeof document !== 'undefined') {
    if (newSize === 'large') {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }
  textSizeListeners.forEach((l) => l());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const textSize = useSyncExternalStore(subscribeTextSize, getTextSizeSnapshot, getServerTextSizeSnapshot);

  const setTheme = (newTheme: Theme) => {
    notifyThemeChange(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setTextSize = (newSize: TextSize) => {
    notifyTextSizeChange(newSize);
  };

  const toggleTextSize = () => {
    setTextSize(textSize === 'large' ? 'normal' : 'large');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        textSize,
        isLargeText: textSize === 'large',
        toggleTextSize,
        setTextSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      toggleTheme: () => {},
      setTheme: () => {},
      textSize: 'normal',
      isLargeText: false,
      toggleTextSize: () => {},
      setTextSize: () => {},
    };
  }
  return context;
}
