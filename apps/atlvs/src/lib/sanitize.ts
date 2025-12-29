/**
 * HTML Sanitization Utilities
 * Uses DOMPurify to sanitize user-generated HTML content
 * Prevents XSS attacks from untrusted content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content for safe rendering
 * Removes potentially dangerous elements and attributes
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id',
      'src', 'alt', 'width', 'height',
      'style', 'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Sanitize SVG content for safe rendering
 * More restrictive than HTML - only allows SVG elements
 */
export function sanitizeSvg(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: [
      'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
      'ellipse', 'g', 'defs', 'use', 'symbol', 'text', 'tspan',
      'clipPath', 'mask', 'linearGradient', 'radialGradient', 'stop',
      'filter', 'feGaussianBlur', 'feOffset', 'feBlend', 'feColorMatrix',
    ],
    ALLOWED_ATTR: [
      'viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width',
      'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'rx', 'ry',
      'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform',
      'opacity', 'fill-opacity', 'stroke-opacity', 'class', 'id',
      'href', 'xlink:href', 'clip-path', 'mask', 'filter',
      'gradientUnits', 'gradientTransform', 'offset', 'stop-color', 'stop-opacity',
      'stdDeviation', 'dx', 'dy', 'result', 'in', 'in2', 'mode', 'values',
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Sanitize plain text - strips all HTML
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Check if content contains potentially dangerous elements
 */
export function containsDangerousContent(content: string): boolean {
  const dangerous = /<script|javascript:|on\w+\s*=|<iframe|<object|<embed/i;
  return dangerous.test(content);
}
