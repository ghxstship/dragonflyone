/**
 * Avatar Primitive
 * User avatar component
 */

import React, { forwardRef, useState } from 'react';
import type { PolymorphicPropsWithRef } from '../../utils/polymorphic';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  /**
   * Image source
   */
  src?: string;

  /**
   * Alt text
   */
  alt: string;

  /**
   * Fallback initials or content
   */
  fallback?: string;

  /**
   * Size of the avatar
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

  /**
   * Additional class names
   */
  className?: string;
}

const sizeStyles = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  base: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
};

export const Avatar = forwardRef(function Avatar<E extends React.ElementType = 'div'>(
  {
    as,
    src,
    alt,
    fallback,
    size = 'base',
    className,
    ...props
  }: PolymorphicPropsWithRef<E, AvatarProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component = as || 'div';
  const [imageError, setImageError] = useState(false);

  const showFallback = !src || imageError;

  const classes = cn(
    'relative inline-flex items-center justify-center overflow-hidden rounded-full',
    'bg-surface-brand text-text-on-brand font-semibold',
    sizeStyles[size],
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {!showFallback && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-label={alt}>{fallback || alt.charAt(0).toUpperCase()}</span>
      )}
    </Component>
  );
}) as <E extends React.ElementType = 'div'>(
  props: PolymorphicPropsWithRef<E, AvatarProps>
) => React.ReactElement | null;
