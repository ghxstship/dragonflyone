# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - link "Skip to navigation" [ref=e3] [cursor=pointer]:
    - /url: "#main-navigation"
  - generic [ref=e4]:
    - link "Skip to main content" [ref=e5] [cursor=pointer]:
      - /url: "#main-content"
    - main "Authentication content" [ref=e8]:
      - generic [ref=e12]:
        - img [ref=e14]
        - generic [ref=e17]:
          - heading "Verify Your Email" [level=2] [ref=e18]
          - paragraph [ref=e19]: We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          - paragraph [ref=e20]: If you don't see the email, check your spam folder.
        - generic [ref=e21]:
          - button "Resend Verification Email" [ref=e22]:
            - img [ref=e24]
            - text: Resend Verification Email
          - button "Back to Sign In" [ref=e29]:
            - img [ref=e31]
            - text: Back to Sign In
    - contentinfo [ref=e34]:
      - generic [ref=e36]:
        - navigation "Footer navigation" [ref=e37]:
          - generic [ref=e38]:
            - link "Privacy" [ref=e39] [cursor=pointer]:
              - /url: /legal/privacy
            - link "Terms" [ref=e40] [cursor=pointer]:
              - /url: /legal/terms
            - link "Help" [ref=e41] [cursor=pointer]:
              - /url: /help
        - text: © 2026 GHXSTSHIP INDUSTRIES
```