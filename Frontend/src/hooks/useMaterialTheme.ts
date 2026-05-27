import { applyThemeScheme, getMaterialTheme } from "@/lib/theme-utils"
import { useEffect } from "react"

export const useMaterialTheme = (baseHexColor: string, isDarkMode: boolean) => {
    useEffect(() => {
        const theme = getMaterialTheme(baseHexColor);
        const scheme = isDarkMode ? theme.schemes.dark : theme.schemes.light;
        applyThemeScheme(scheme);
    }, [baseHexColor, isDarkMode]);
}