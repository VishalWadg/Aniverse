import { applyThemeScheme, getMaterialThemeScheme } from "@/lib/theme-utils"
import { useEffect } from "react"

export const useMaterialTheme = (baseHexColor: string, isDarkMode: boolean) => {
    useEffect(() => {
        const scheme = getMaterialThemeScheme(baseHexColor, isDarkMode);
        applyThemeScheme(scheme);
    }, [baseHexColor, isDarkMode]);
}