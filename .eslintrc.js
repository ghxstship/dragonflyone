module.exports = {
  root: true,
  extends: ["next", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // Typography enforcement - prevent raw Tailwind size classes
    // Use design system classes instead: text-body-*, text-mono-*, text-h*-*, text-display-*
    // Note: This regex specifically matches raw Tailwind classes, not design system classes
    "no-restricted-syntax": [
      "warn",
      {
        selector: "Literal[value=/(?<!text-body-|text-mono-|text-h\\d-)\\btext-(xs|sm|base|lg|xl)\\b(?!-)/]",
        message: "Use design system typography classes (text-body-*, text-mono-*, text-h*-*, text-display-*) instead of raw Tailwind size classes."
      },
      {
        selector: "Literal[value=/\\btext-[2-9]xl\\b/]",
        message: "Use design system typography classes (text-body-*, text-mono-*, text-h*-*, text-display-*) instead of raw Tailwind size classes."
      }
    ]
  }
};
