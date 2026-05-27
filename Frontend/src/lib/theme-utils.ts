import { themeFromSourceColor, argbFromHex, hexFromArgb, Scheme } from "@material/material-color-utilities";
import { colord } from "colord";

const argbToShadcnHsl = (argb: number): string => {
  const hex = hexFromArgb(argb);
  const { h, s, l } = colord(hex).toHsl();
  return `hsl(${h.toFixed(1)} ${(s).toFixed(1)}% ${(l).toFixed(1)}%)`;
};

export const applyThemeScheme = (scheme: Scheme) => {
  const root = document.documentElement;
  
  // 1. Core Colors
  root.style.setProperty("--color-primary", argbToShadcnHsl(scheme.primary));
  root.style.setProperty("--color-primary-foreground", argbToShadcnHsl(scheme.onPrimary));
  
  root.style.setProperty("--color-secondary", argbToShadcnHsl(scheme.secondary));
  root.style.setProperty("--color-secondary-foreground", argbToShadcnHsl(scheme.onSecondary));
  // Material's 'Tertiary' is perfect for Shadcn's 'Accent'
  root.style.setProperty("--color-accent", argbToShadcnHsl(scheme.tertiary));
  root.style.setProperty("--color-accent-foreground", argbToShadcnHsl(scheme.onTertiary));
  // Material's 'Error' maps directly to Shadcn's 'Destructive'
  root.style.setProperty("--color-destructive", argbToShadcnHsl(scheme.error));
  root.style.setProperty("--color-destructive-foreground", argbToShadcnHsl(scheme.onError));
  // 2. Surfaces & Backgrounds
  root.style.setProperty("--color-background", argbToShadcnHsl(scheme.background));
  root.style.setProperty("--color-foreground", argbToShadcnHsl(scheme.onBackground));
  
  // Material uses 'Surface' for cards and popovers
  root.style.setProperty("--color-card", argbToShadcnHsl(scheme.surface));
  root.style.setProperty("--color-card-foreground", argbToShadcnHsl(scheme.onSurface));
  root.style.setProperty("--color-popover", argbToShadcnHsl(scheme.surface));
  root.style.setProperty("--color-popover-foreground", argbToShadcnHsl(scheme.onSurface));
  
  // Material's 'Surface Variant' is slightly tinted
  root.style.setProperty("--color-muted", argbToShadcnHsl(scheme.surfaceVariant));
  root.style.setProperty("--color-muted-foreground", argbToShadcnHsl(scheme.onSurfaceVariant));
  // 3. Borders & Inputs
  // Material's 'Outline Variant' is a subtle border, 'Outline' is stronger
  root.style.setProperty("--color-border", argbToShadcnHsl(scheme.outlineVariant));
  root.style.setProperty("--color-input", argbToShadcnHsl(scheme.outlineVariant));
  root.style.setProperty("--color-ring", argbToShadcnHsl(scheme.outline));
  
  root.style.setProperty("--radius", "0.75rem");
};

export const getMaterialTheme = (baseHexColor: string) => {
    return themeFromSourceColor(argbFromHex(baseHexColor));
}
