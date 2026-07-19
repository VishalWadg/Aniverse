

type ThemeMode = 'light' | 'dark' | 'system'


function SettingsPanelContent({
  theme,
  setTheme,
  brandColor,
  setBrandColor,
  resetBrandColor,
  colorInput,
  setColorInput,
  colorError,
  setColorError,
  commitBrandColor,
}: {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  brandColor: string
  setBrandColor: (color: string) => void
  resetBrandColor: () => void
  colorInput: string
  setColorInput: (value: string) => void
  colorError: string
  setColorError: (value: string) => void
  commitBrandColor: () => void
}) {
  return (
    <>
      <div className="mb-4">
        <span className="block text-xs font-medium text-on-surface-variant mb-2">Appearance</span>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button
            key={m}
            onClick={() => setTheme(m)}
            className={`h-8 text-[11px] font-bold uppercase tracking-wider rounded-control border transition-all cursor-pointer ${theme === m
              ? 'bg-primary text-on-primary border-transparent shadow-sm'
              : 'border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-xs font-medium text-on-surface-variant mb-2">Accent Color</span>
        <div className="flex items-center gap-3">
          <div className="relative size-8 rounded-full border border-outline-variant shadow-inner transition-colors duration-300 shrink-0 overflow-hidden">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => {
                setColorInput(e.target.value);
                setColorError('');
                setBrandColor(e.target.value);
              }}
              className="absolute inset-0 size-full scale-150 cursor-pointer opacity-0"
              aria-label="Accent color picker"
              />
            <div className="size-full" style={{ backgroundColor: brandColor }} />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => {
                setColorInput(e.target.value);
                setColorError('');
              }}
              onBlur={commitBrandColor}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitBrandColor();
              }}
              placeholder="#769CDF"
              aria-invalid={Boolean(colorError)}
              className="h-8 w-full rounded-control border border-outline-variant bg-surface-container px-3 text-xs font-mono text-on-surface outline-none focus:border-primary aria-invalid:border-error"
              />
          </div>
        </div>
        {colorError ? (
          <p className="mt-2 text-xs font-medium text-error">{colorError}</p>
        ) : null}
        <button
          type="button"
          onClick={resetBrandColor}
          className="mt-3 h-8 w-full rounded-control border border-outline-variant px-control-x text-xs font-semibold text-on-surface-variant transition-colors hover:border-outline hover:bg-surface-container hover:text-on-surface"
        >
          Reset Accent
        </button>
      </div>
    </>
  )
}

export default SettingsPanelContent;