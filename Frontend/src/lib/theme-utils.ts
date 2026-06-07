import { 
  type DynamicColor,
  MaterialDynamicColors, 
  Hct, 
  SchemeTonalSpot, 
  argbFromHex, 
  hexFromArgb 
} from "@material/material-color-utilities";

/**
 * Converts an ARGB number back to a standard Hex code.
 */
export const argbToHex = (argb: number): string => {
  return hexFromArgb(argb);
};

/**
 * Generates a calm, harmonized SchemeTonalSpot from a hex brand color.
 */
export const getMaterialThemeScheme = (brandColor: string, isDark: boolean): SchemeTonalSpot => {
  const sourceColorHct = Hct.fromInt(argbFromHex(brandColor));
  // SchemeTonalSpot parameters: sourceColorHct, isDark (boolean), contrastLevel (0.0 is standard)
  return new SchemeTonalSpot(sourceColorHct, isDark, 0.0);
};

/**
 * Maps all dynamic scheme roles to HTML document CSS variables.
 */
export const applyThemeScheme = (scheme: SchemeTonalSpot) => {
  const root = document.documentElement;

  const getColor = (dynamicColor: DynamicColor): string => {
    return hexFromArgb(dynamicColor.getArgb(scheme));
  };

  const setMaterialRole = (name: string, dynamicColor: DynamicColor) => {
    const color = getColor(dynamicColor);
    root.style.setProperty(`--md-${name}`, color);
    root.style.setProperty(`--${name}`, color);
    return color;
  };

  // Material-generated roles.
  setMaterialRole("primary", MaterialDynamicColors.primary);
  setMaterialRole("primary-foreground", MaterialDynamicColors.onPrimary);
  setMaterialRole("on-primary", MaterialDynamicColors.onPrimary);
  setMaterialRole("primary-container", MaterialDynamicColors.primaryContainer);
  setMaterialRole("on-primary-container", MaterialDynamicColors.onPrimaryContainer);

  setMaterialRole("secondary", MaterialDynamicColors.secondary);
  setMaterialRole("secondary-foreground", MaterialDynamicColors.onSecondary);
  setMaterialRole("on-secondary", MaterialDynamicColors.onSecondary);
  setMaterialRole("secondary-container", MaterialDynamicColors.secondaryContainer);
  setMaterialRole("on-secondary-container", MaterialDynamicColors.onSecondaryContainer);

  setMaterialRole("tertiary", MaterialDynamicColors.tertiary);
  setMaterialRole("tertiary-foreground", MaterialDynamicColors.onTertiary);
  setMaterialRole("on-tertiary", MaterialDynamicColors.onTertiary);
  setMaterialRole("tertiary-container", MaterialDynamicColors.tertiaryContainer);
  setMaterialRole("on-tertiary-container", MaterialDynamicColors.onTertiaryContainer);

  setMaterialRole("error", MaterialDynamicColors.error);
  setMaterialRole("error-container", MaterialDynamicColors.errorContainer);
  setMaterialRole("on-error", MaterialDynamicColors.onError);
  setMaterialRole("on-error-container", MaterialDynamicColors.onErrorContainer);

  const materialBackground = setMaterialRole("background", MaterialDynamicColors.background);
  const materialOnBackground = setMaterialRole("on-background", MaterialDynamicColors.onBackground);
  setMaterialRole("surface", MaterialDynamicColors.surface);
  setMaterialRole("surface-dim", MaterialDynamicColors.surfaceDim);
  setMaterialRole("surface-bright", MaterialDynamicColors.surfaceBright);
  setMaterialRole("surface-tint", MaterialDynamicColors.surfaceTint);
  setMaterialRole("on-surface", MaterialDynamicColors.onSurface);
  setMaterialRole("surface-variant", MaterialDynamicColors.surfaceVariant);
  setMaterialRole("on-surface-variant", MaterialDynamicColors.onSurfaceVariant);

  setMaterialRole("surface-container-lowest", MaterialDynamicColors.surfaceContainerLowest);
  const surfaceContainerLow = setMaterialRole("surface-container-low", MaterialDynamicColors.surfaceContainerLow);
  setMaterialRole("surface-container", MaterialDynamicColors.surfaceContainer);
  setMaterialRole("surface-container-high", MaterialDynamicColors.surfaceContainerHigh);
  setMaterialRole("surface-container-highest", MaterialDynamicColors.surfaceContainerHighest);

  setMaterialRole("outline", MaterialDynamicColors.outline);
  setMaterialRole("outline-variant", MaterialDynamicColors.outlineVariant);
  setMaterialRole("shadow", MaterialDynamicColors.shadow);
  setMaterialRole("scrim", MaterialDynamicColors.scrim);
  setMaterialRole("inverse-surface", MaterialDynamicColors.inverseSurface);
  setMaterialRole("inverse-on-surface", MaterialDynamicColors.inverseOnSurface);
  setMaterialRole("inverse-primary", MaterialDynamicColors.inversePrimary);

  // App-facing aliases. Light mode uses a softer container for the page canvas
  // while the raw Material value remains available as --md-background.
  root.style.setProperty("--background", scheme.isDark ? materialBackground : surfaceContainerLow);
  root.style.setProperty("--on-background", materialOnBackground);
  root.style.setProperty("--card", "var(--surface-container)");
  root.style.setProperty("--card-foreground", "var(--on-surface)");
  root.style.setProperty("--popover", "var(--surface-container-high)");
  root.style.setProperty("--popover-foreground", "var(--on-surface)");
  root.style.setProperty("--muted", "var(--surface-container-low)");
  root.style.setProperty("--muted-foreground", "var(--on-surface-variant)");
  root.style.setProperty("--border", "var(--outline-variant)");
  root.style.setProperty("--input", "var(--outline-variant)");
  root.style.setProperty("--ring", "var(--primary)");
};
