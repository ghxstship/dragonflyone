# Design Token Analysis

## CSS Variable References
```
apps/gvteway/.next/static/css/app/layout.css:114:  --surface-primary: var(--color-surface-background, #0a0a0a);
apps/gvteway/.next/static/css/app/layout.css:115:  --surface-secondary: var(--color-surface-card, #171717);
apps/gvteway/.next/static/css/app/layout.css:116:  --surface-tertiary: var(--color-surface-elevated, #262626);
apps/gvteway/.next/static/css/app/layout.css:117:  --surface-elevated: var(--color-surface-elevated, #262626);
apps/gvteway/.next/static/css/app/layout.css:118:  --surface-overlay: var(--color-surface-overlay, rgba(0, 0, 0, 0.8));
apps/gvteway/.next/static/css/app/layout.css:119:  --surface-inverse: var(--color-text-inverse, #ffffff);
apps/gvteway/.next/static/css/app/layout.css:120:  --surface-muted: var(--color-border-subtle, #404040);
apps/gvteway/.next/static/css/app/layout.css:121:  --surface-accent: var(--color-brand-primary-subtle, #171717);
apps/gvteway/.next/static/css/app/layout.css:123:  --text-primary: var(--color-text-primary, #ffffff);
apps/gvteway/.next/static/css/app/layout.css:124:  --text-secondary: var(--color-text-secondary, #d4d4d4);
apps/gvteway/.next/static/css/app/layout.css:125:  --text-tertiary: var(--color-text-tertiary, #a3a3a3);
apps/gvteway/.next/static/css/app/layout.css:126:  --text-muted: var(--color-text-tertiary, #737373);
apps/gvteway/.next/static/css/app/layout.css:127:  --text-disabled: var(--color-text-disabled, #525252);
apps/gvteway/.next/static/css/app/layout.css:128:  --text-inverse: var(--color-text-inverse, #000000);
apps/gvteway/.next/static/css/app/layout.css:129:  --text-accent: var(--color-brand-primary, #ffffff);
apps/gvteway/.next/static/css/app/layout.css:130:  --text-link: var(--color-text-link, #ffffff);
apps/gvteway/.next/static/css/app/layout.css:131:  --text-link-hover: var(--color-text-link, #d4d4d4);
apps/gvteway/.next/static/css/app/layout.css:133:  --border-primary: var(--color-border-strong, #404040);
apps/gvteway/.next/static/css/app/layout.css:134:  --border-secondary: var(--color-border-subtle, #262626);
apps/gvteway/.next/static/css/app/layout.css:135:  --border-muted: var(--color-border-default, #171717);
apps/gvteway/.next/static/css/app/layout.css:136:  --border-focus: var(--color-border-focus, #737373);
apps/gvteway/.next/static/css/app/layout.css:137:  --border-inverse: var(--color-text-inverse, #000000);
apps/gvteway/.next/static/css/app/layout.css:138:  --border-accent: var(--color-brand-primary, #525252);
apps/gvteway/.next/static/css/app/layout.css:424:  --shadow-primary: 4px 4px 0 hsl(var(--primary));
apps/gvteway/.next/static/css/app/layout.css:425:  --shadow-accent: 4px 4px 0 hsl(var(--accent));
apps/gvteway/.next/static/css/app/layout.css:570:  background-color: var(--surface-primary);
apps/gvteway/.next/static/css/app/layout.css:571:  color: var(--text-primary);
apps/gvteway/.next/static/css/app/layout.css:572:  font-family: var(--font-share-tech), "Share Tech", "Monaco", "Consolas", monospace;
apps/gvteway/.next/static/css/app/layout.css:585:    var(--font-anton), 
apps/gvteway/.next/static/css/app/layout.css:595:    var(--font-bebas-neue), 
apps/gvteway/.next/static/css/app/layout.css:605:    var(--font-share-tech), 
apps/gvteway/.next/static/css/app/layout.css:616:    var(--font-share-tech-mono), 
apps/gvteway/.next/static/css/app/layout.css:707:  background: var(--surface-primary);
apps/gvteway/.next/static/css/app/layout.css:708:  color: var(--text-primary);
apps/gvteway/.next/static/css/app/layout.css:711:  border: 2px solid var(--border-primary);
apps/gvteway/.next/static/css/app/layout.css:768:  border: 1px solid var(--ink-700);
apps/gvteway/.next/static/css/app/layout.css:770:  box-shadow: 0 0 0 1px var(--ink-800);
apps/gvteway/.next/static/css/app/layout.css:782:  background: var(--ink-100);
apps/gvteway/.next/static/css/app/layout.css:783:  color: var(--ink-950);
apps/gvteway/.next/static/css/app/layout.css:786:  background: var(--ink-100);
apps/gvteway/.next/static/css/app/layout.css:787:  color: var(--ink-950);
apps/gvteway/.next/static/css/app/layout.css:810:  0%, 100% { box-shadow: var(--shadow-md); }
apps/gvteway/.next/static/css/app/layout.css:811:  50% { box-shadow: var(--shadow-lg), 0 0 0 4px hsl(var(--primary) / 0.2); }
apps/gvteway/.next/static/css/app/layout.css:849:.animate-pop-in { animation: pop-in 0.3s var(--ease-bounce) forwards; }
apps/gvteway/.next/static/css/app/layout.css:850:.animate-slide-up-bounce { animation: slide-up-bounce 0.4s var(--ease-bounce) forwards; }
apps/gvteway/.next/static/css/app/layout.css:853:.animate-comic-appear { animation: comic-appear 0.4s var(--ease-bounce) forwards; }
apps/gvteway/.next/static/css/app/layout.css:857:.animate-zoom-in { animation: zoom-in 0.2s var(--ease-bounce) forwards; }
apps/gvteway/.next/static/css/app/layout.css:859:.animate-slide-in-top { animation: slide-in-from-top 0.2s var(--ease-bounce) forwards; }
apps/gvteway/.next/static/css/app/layout.css:860:.animate-slide-in-bottom { animation: slide-in-from-bottom 0.2s var(--ease-bounce) forwards; }
apps/gvteway/.next/static/css/app/layout.css:875:  background-image: radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px);
apps/gvteway/.next/static/css/app/layout.css:879:  background-image: radial-gradient(circle, hsl(var(--foreground) / 0.1) 2px, transparent 2px);
apps/gvteway/.next/static/css/app/layout.css:883:  background-image: radial-gradient(circle, hsl(var(--primary) / 0.15) 1px, transparent 1px);
apps/gvteway/.next/static/css/app/layout.css:888:  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.03) 10px, hsl(var(--foreground) / 0.03) 20px);
apps/gvteway/.next/static/css/app/layout.css:891:  background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, hsl(var(--foreground) / 0.06) 8px, hsl(var(--foreground) / 0.06) 16px);
apps/gvteway/.next/static/css/app/layout.css:895:  background-image: linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px);
apps/gvteway/.next/static/css/app/layout.css:899:  background-image: linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px);
apps/gvteway/.next/static/css/app/layout.css:904:  background-image: radial-gradient(hsl(var(--primary) / 0.15) 20%, transparent 20%);
apps/gvteway/.next/static/css/app/layout.css:908:  background-image: radial-gradient(hsl(var(--accent) / 0.15) 20%, transparent 20%);
apps/gvteway/.next/static/css/app/layout.css:913:  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.02) 10px, hsl(var(--foreground) / 0.02) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.02) 10px, hsl(var(--foreground) / 0.02) 11px);
apps/gvteway/.next/static/css/app/layout.css:917:  background-image: repeating-linear-gradient(90deg, transparent, transparent 4px, hsl(var(--foreground) / 0.02) 4px, hsl(var(--foreground) / 0.02) 5px);
apps/gvteway/.next/static/css/app/layout.css:921:  background-image: repeating-conic-gradient(from 0deg, transparent 0deg 5deg, hsl(var(--foreground) / 0.02) 5deg 10deg);
apps/gvteway/.next/static/css/app/layout.css:947:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:948:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:962:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:963:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:967:  box-shadow: 6px 6px 0 0 hsl(var(--primary));
apps/gvteway/.next/static/css/app/layout.css:971:  box-shadow: 2px 2px 0 0 hsl(var(--primary) / 0.7);
apps/gvteway/.next/static/css/app/layout.css:977:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:978:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:982:  box-shadow: 6px 6px 0 0 hsl(var(--brand-pink));
apps/gvteway/.next/static/css/app/layout.css:986:  box-shadow: 2px 2px 0 0 hsl(var(--brand-pink) / 0.7);
apps/gvteway/.next/static/css/app/layout.css:992:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:993:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:997:  box-shadow: 6px 6px 0 0 hsl(var(--brand-yellow));
apps/gvteway/.next/static/css/app/layout.css:1001:  box-shadow: 2px 2px 0 0 hsl(var(--brand-yellow) / 0.7);
apps/gvteway/.next/static/css/app/layout.css:1007:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:1008:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:1012:  box-shadow: 6px 6px 0 0 hsl(var(--brand-cyan));
apps/gvteway/.next/static/css/app/layout.css:1016:  box-shadow: 2px 2px 0 0 hsl(var(--brand-cyan) / 0.7);
apps/gvteway/.next/static/css/app/layout.css:1022:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:1023:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:1039:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:1040:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:1044:  box-shadow: var(--shadow-hover);
apps/gvteway/.next/static/css/app/layout.css:1048:  box-shadow: var(--shadow-active);
apps/gvteway/.next/static/css/app/layout.css:1052:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:1053:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:1057:  box-shadow: 6px 6px 0 0 hsl(var(--primary));
apps/gvteway/.next/static/css/app/layout.css:1061:  box-shadow: 2px 2px 0 0 hsl(var(--primary));
apps/gvteway/.next/static/css/app/layout.css:1065:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:1066:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:1070:  box-shadow: var(--shadow-hover);
apps/gvteway/.next/static/css/app/layout.css:1074:  box-shadow: var(--shadow-active);
apps/gvteway/.next/static/css/app/layout.css:1078:  transition: transform var(--duration-fast) var(--ease-bounce), 
apps/gvteway/.next/static/css/app/layout.css:1079:              box-shadow var(--duration-fast) var(--ease-bounce);
apps/gvteway/.next/static/css/app/layout.css:1083:  box-shadow: var(--shadow-active);
apps/gvteway/.next/static/css/app/layout.css:1090:  transition: filter var(--duration-slow) var(--ease-out);
apps/gvteway/.next/static/css/app/layout.css:1099:  transition: filter var(--duration-slow) var(--ease-out);
apps/gvteway/.next/static/css/app/layout.css:1111:  box-shadow: var(--shadow-focus);
apps/gvteway/.next/static/css/app/layout.css:1115:  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.4);
```
