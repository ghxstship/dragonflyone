# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog "Server Error" [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e8]:
          - button "previous" [disabled] [ref=e9]:
            - img "previous" [ref=e10]
          - button "next" [disabled] [ref=e12]:
            - img "next" [ref=e13]
          - generic [ref=e15]: 1 of 1 error
          - generic [ref=e16]:
            - text: Next.js (14.2.35) is outdated
            - link "(learn more)" [ref=e18] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - heading "Server Error" [level=1] [ref=e19]
        - paragraph [ref=e20]: "Error: ENOENT: no such file or directory, open '/Users/julianclarkson/Documents/Dragonflyone/apps/compvss/.next/server/middleware-manifest.json'"
        - generic [ref=e21]: This error happened while generating the page. Any console logs will be displayed in the terminal window.
      - generic [ref=e22]:
        - heading "Call Stack" [level=2] [ref=e23]
        - generic [ref=e24]:
          - heading "Object.readFileSync" [level=3] [ref=e25]
          - generic [ref=e27]: node:fs (442:20)
        - generic [ref=e28]:
          - heading "TracingChannel.traceSync" [level=3] [ref=e29]
          - generic [ref=e31]: node:diagnostics_channel (322:14)
        - group [ref=e32]:
          - generic "Next.js" [ref=e33] [cursor=pointer]:
            - img [ref=e34]
            - img [ref=e36]
            - text: Next.js
```