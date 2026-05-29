import { useMaterialTheme } from "@/hooks/useMaterialTheme";
import { createContext, useContext, useMemo, useState, useLayoutEffect } from "react";

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';

type ThemeProviderState = {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  brandColor: string;
  setBrandColor: (hex: string) => void;
  resetBrandColor: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => null,
  brandColor: '#769CDF',
  setBrandColor: () => null,
  resetBrandColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const normalizeBrandHex = (hex: unknown): string | null => {
  if (typeof hex !== 'string') return null;

  const trimmed = hex.trim();
  const value = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;

  if (/^[0-9A-Fa-f]{3}$/.test(value)) {
    return `#${value.split('').map((char) => char + char).join('').toUpperCase()}`;
  }

  if (/^[0-9A-Fa-f]{6}$/.test(value)) {
    return `#${value.toUpperCase()}`;
  }

  return null;
};

export const isValidBrandHex = (hex: unknown): hex is string => {
  return normalizeBrandHex(hex) !== null;
};

const isValidTheme = (theme: any): theme is ThemeMode => {
  return ['light', 'dark', 'system'].includes(theme);
};

const startThemeTransition = () => {
  if (typeof window === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const root = window.document.documentElement;
  root.classList.add('theme-transition');
  window.setTimeout(() => root.classList.remove('theme-transition'), 320);
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultBrandColor = '#769CDF',
  storageKey = 'aniverse-ui-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultBrandColor?: string;
  storageKey?: string;
}) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      return isValidTheme(saved) ? saved : defaultTheme;
    }
    return defaultTheme;
  });

  const [brandColor, setBrandColorState] = useState<string>(() => {
    const normalizedDefault = normalizeBrandHex(defaultBrandColor) ?? initialState.brandColor;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}-color`);
      return normalizeBrandHex(saved) ?? normalizedDefault;
    }
    return normalizedDefault;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Calculate and apply light/dark theme classes on root HTML element
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (mode: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(mode);
      setResolvedTheme(mode);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handleSystemChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Apply Dynamic Material Theme Colors using our updated hook
  useMaterialTheme(brandColor, resolvedTheme === 'dark');

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: (newTheme: ThemeMode) => {
      startThemeTransition();
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    brandColor,
    setBrandColor: (newColor: string) => {
      const finalColor = normalizeBrandHex(newColor);

      if (!finalColor) {
        return;
      }

      startThemeTransition();
      localStorage.setItem(`${storageKey}-color`, finalColor);
      setBrandColorState(finalColor);
    },
    resetBrandColor: () => {
      const normalizedDefault = normalizeBrandHex(defaultBrandColor) ?? initialState.brandColor;

      startThemeTransition();
      localStorage.setItem(`${storageKey}-color`, normalizedDefault);
      setBrandColorState(normalizedDefault);
    },
  }), [theme, resolvedTheme, brandColor, storageKey, defaultBrandColor]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
