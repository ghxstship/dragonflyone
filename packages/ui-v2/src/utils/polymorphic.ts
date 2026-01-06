/**
 * Polymorphic component type utilities
 * Enables components to render as different HTML elements
 */

import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ElementType } from 'react';

/**
 * Props for polymorphic components (without ref)
 */
export type PolymorphicProps<E extends ElementType = ElementType, P = object> = P & {
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'>;

/**
 * Props for polymorphic components (with ref)
 */
export type PolymorphicPropsWithRef<E extends ElementType = ElementType, P = object> = P & {
  as?: E;
} & Omit<ComponentPropsWithRef<E>, keyof P | 'as'>;

/**
 * Component type for polymorphic components
 */
export type PolymorphicComponent<P = object, D extends ElementType = 'div'> = <
  E extends ElementType = D
>(
  props: PolymorphicPropsWithRef<E, P>
) => React.ReactElement | null;
