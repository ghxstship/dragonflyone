/**
 * ThemeScript - SSR-safe theme initialization script
 * 
 * This component injects a blocking script into the <head> that runs
 * before React hydration to prevent flash of wrong theme (FOWT).
 * 
 * Usage: Add to your root layout's <head> section
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * <html>
 *   <head>
 *     <ThemeScript defaultTheme="dark" storageKey="ghxstship-theme" />
 *   </head>
 *   <body>...</body>
 * </html>
 * ```
 */

interface ThemeScriptProps {
  /** Default theme when no preference is stored */
  defaultTheme?: "dark" | "light" | "system";
  /** localStorage key for theme preference */
  storageKey?: string;
  /** Force a specific theme (overrides stored preference) */
  forcedTheme?: "dark" | "light";
}

export function ThemeScript({
  defaultTheme = "dark",
  storageKey = "ghxstship-theme",
  forcedTheme,
}: ThemeScriptProps) {
  // If theme is forced, just set it directly
  if (forcedTheme) {
    const script = `
      (function() {
        var d = document.documentElement;
        d.classList.remove('light', 'dark');
        d.classList.add('${forcedTheme}');
        d.classList.add('theme-loading');
        window.setTimeout(function() { d.classList.remove('theme-loading'); }, 0);
      })();
    `;
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
  }

  // Dynamic theme based on stored preference or system
  const script = `
    (function() {
      var d = document.documentElement;
      var storageKey = '${storageKey}';
      var defaultTheme = '${defaultTheme}';
      
      // Add loading class to prevent transitions during initial render
      d.classList.add('theme-loading');
      
      try {
        var stored = localStorage.getItem(storageKey);
        var theme = stored || defaultTheme;
        
        if (theme === 'system') {
          var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          theme = systemDark ? 'dark' : 'light';
        }
        
        d.classList.remove('light', 'dark');
        d.classList.add(theme);
        
        // Store the resolved theme for hydration
        d.dataset.theme = theme;
      } catch (e) {
        // Fallback to default if localStorage is unavailable
        d.classList.remove('light', 'dark');
        d.classList.add(defaultTheme === 'system' 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : defaultTheme
        );
      }
      
      // Remove loading class after a tick to enable transitions
      window.setTimeout(function() { d.classList.remove('theme-loading'); }, 0);
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default ThemeScript;
