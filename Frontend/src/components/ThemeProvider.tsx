import { useMaterialTheme } from "@/hooks/useMaterialTheme";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderState = {
    theme : Theme;
    setTheme: (theme : Theme) => void;
    brandColor: string;
    setBrandColor: (color: string) => void; 
};

const initialState : ThemeProviderState = {
    theme : 'system',
    setTheme : () => null,
    brandColor : '#769CDF',
    setBrandColor: () => null,  
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    defaultBrandColor = '#769CDF', 
    storageKey = 'aniverse-ui-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultBrandColor?: string;
  storageKey?: string;
}){
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
        }
        return defaultTheme;
    })

    const [brandColor, setBrandColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
        return localStorage.getItem(`${storageKey}-color`) || defaultBrandColor;
        }
        return defaultBrandColor;
    });

    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        if (theme === 'dark') return true;
        if (theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
        return false;
    })

    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = (resolvedTheme: 'dark' | 'light') => {
            root.classList.remove('light', 'dark');
            root.classList.add(resolvedTheme);
            setIsDark(resolvedTheme === 'dark');
        }

        if(theme === 'system'){
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches ? 'dark' : 'light');
            const handleSystemChange = (e: MediaQueryListEvent) => {
                applyTheme(e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handleSystemChange);
            return () => mediaQuery.removeEventListener('change', handleSystemChange);
        }else{
            applyTheme(theme);
        }
    }, [theme]);

    useMaterialTheme(brandColor, isDark);

    const value = useMemo(() => ({
            theme,
            setTheme : (newTheme : Theme) => {
                localStorage.setItem(storageKey, newTheme);
                setTheme(newTheme);
            },
            brandColor,
            setBrandColor: (newColor: string) => {
                localStorage.setItem(`${storageKey}-color`, newColor);
                setBrandColor(newColor);
            },
        }),
        [theme, brandColor, storageKey]
    );

    return(
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};