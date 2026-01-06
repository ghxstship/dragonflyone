/**
 * Class name utility
 * Simple utility for merging class names
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Merge class names
 * @example
 * cn('foo', 'bar') // 'foo bar'
 * cn('foo', undefined, 'bar') // 'foo bar'
 * cn('foo', false && 'bar') // 'foo'
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((x): x is string | number => typeof x === 'string' || typeof x === 'number')
    .join(' ')
    .trim();
}
