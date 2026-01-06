/**
 * UI v2 Primitives - Unstyled Headless Components
 *
 * 20 Primitives organized by category:
 * - Layout (6): Box, Stack, Grid, Flex, Container, Separator
 * - Typography (4): Text, Heading, Label, Code
 * - Form (7): Button, Input, Textarea, Checkbox, Radio, Switch
 * - Feedback (3): Spinner, Progress, Skeleton
 * - Media (1): Avatar
 *
 * All primitives are:
 * - Polymorphic (customizable element via 'as' prop)
 * - Type-safe (full TypeScript support)
 * - Accessible (ARIA attributes, keyboard navigation)
 * - Unstyled (minimal opinions, maximum flexibility)
 * - Tree-shakeable (import only what you need)
 */

// =============================================================================
// Layout Primitives
// =============================================================================

export { Box } from './box';
export type { BoxProps } from './box';

export { Stack } from './stack';
export type { StackProps } from './stack';

export { Grid } from './grid';
export type { GridProps } from './grid';

export { Flex } from './flex';
export type { FlexProps } from './flex';

export { Container } from './container';
export type { ContainerProps } from './container';

export { Separator } from './separator';
export type { SeparatorProps } from './separator';

// =============================================================================
// Typography Primitives
// =============================================================================

export { Text } from './text';
export type { TextProps } from './text';

export { Heading } from './heading';
export type { HeadingProps } from './heading';

export { Label } from './label';
export type { LabelProps } from './label';

export { Code } from './code';
export type { CodeProps } from './code';

// =============================================================================
// Form Primitives
// =============================================================================

export { Button } from './button';
export type { ButtonProps } from './button';

export { Input } from './input';
export type { InputProps } from './input';

export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

export { Checkbox } from './checkbox';
export type { CheckboxProps } from './checkbox';

export { Radio } from './radio';
export type { RadioProps } from './radio';

export { Switch } from './switch';
export type { SwitchProps } from './switch';

// =============================================================================
// Feedback Primitives
// =============================================================================

export { Spinner } from './spinner';
export type { SpinnerProps } from './spinner';

export { Progress } from './progress';
export type { ProgressProps } from './progress';

export { Skeleton } from './skeleton';
export type { SkeletonProps } from './skeleton';

// =============================================================================
// Media Primitives
// =============================================================================

export { Avatar } from './avatar';
export type { AvatarProps } from './avatar';
