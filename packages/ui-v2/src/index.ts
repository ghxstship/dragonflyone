/**
 * @ghxstship/ui-v2
 * White-label-first design system for multi-tenant SaaS applications
 *
 * @example
 * ```typescript
 * import { BrandProvider } from '@ghxstship/ui-v2';
 * import '@ghxstship/ui-v2/styles/foundation.css';
 * import '@ghxstship/ui-v2/styles/semantic.css';
 *
 * function App() {
 *   return (
 *     <BrandProvider brand={myBrandConfig}>
 *       {children}
 *     </BrandProvider>
 *   );
 * }
 * ```
 */

// Core exports
export * from './whitelabel';
export * from './tokens';

// Component exports (modular - import from specific paths for tree-shaking)
export * from './primitives';
export * from './components';
export * from './patterns';

// Utility exports
export * from './hooks';
export * from './utils';
