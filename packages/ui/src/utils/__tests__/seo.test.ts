import { describe, it, expect } from 'vitest';
import { generateMetadata, generateStructuredData } from '../seo.js';

describe('generateMetadata', () => {
  it('generates basic metadata with title and description', () => {
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'This is a test page',
    });

    expect(metadata.title).toBe('Test Page | GHXSTSHIP');
    expect(metadata.description).toBe('This is a test page');
  });

  it('includes keywords when provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      keywords: ['test', 'page', 'example'],
    });

    expect(metadata.keywords).toBe('test, page, example');
  });

  it('does not include keywords when empty', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      keywords: [],
    });

    expect(metadata.keywords).toBeUndefined();
  });

  it('sets robots to noindex when specified', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      noindex: true,
    });

    expect(metadata.robots).toBe('noindex, nofollow');
  });

  it('does not set robots when noindex is false', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      noindex: false,
    });

    expect(metadata.robots).toBeUndefined();
  });

  it('generates canonical URL when provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      canonical: '/test-page',
    });

    expect(metadata.canonical).toContain('/test-page');
  });

  it('generates Open Graph metadata', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
    });

    expect(metadata['og:title']).toBe('Test | GHXSTSHIP');
    expect(metadata['og:description']).toBe('Test description');
    expect(metadata['og:type']).toBe('website');
    expect(metadata['og:site_name']).toBe('GHXSTSHIP');
  });

  it('uses custom ogType when provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      ogType: 'article',
    });

    expect(metadata['og:type']).toBe('article');
  });

  it('generates Twitter metadata', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
    });

    expect(metadata['twitter:card']).toBe('summary_large_image');
    expect(metadata['twitter:title']).toBe('Test | GHXSTSHIP');
    expect(metadata['twitter:description']).toBe('Test description');
  });

  it('uses custom twitterCard when provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      twitterCard: 'summary',
    });

    expect(metadata['twitter:card']).toBe('summary');
  });

  it('handles absolute ogImage URLs', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      ogImage: 'https://example.com/image.png',
    });

    expect(metadata['og:image']).toBe('https://example.com/image.png');
    expect(metadata['twitter:image']).toBe('https://example.com/image.png');
  });

  it('handles relative ogImage URLs', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
      ogImage: '/custom-image.png',
    });

    expect(metadata['og:image']).toContain('/custom-image.png');
    expect(metadata['twitter:image']).toContain('/custom-image.png');
  });
});

describe('generateStructuredData', () => {
  it('generates Organization structured data', () => {
    const orgData = { name: 'GHXSTSHIP', url: 'https://ghxstship.com' };
    const data = generateStructuredData('Organization', orgData);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('GHXSTSHIP');
    expect(data.url).toBe('https://ghxstship.com');
  });

  it('generates Event structured data', () => {
    const eventData = { name: 'Summer Festival', startDate: '2024-07-15', location: 'Central Park' };
    const data = generateStructuredData('Event', eventData);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Event');
    expect(data.name).toBe('Summer Festival');
    expect(data.startDate).toBe('2024-07-15');
    expect(data.location).toBe('Central Park');
  });

  it('generates Person structured data', () => {
    const personData = { name: 'John Doe', jobTitle: 'Developer' };
    const data = generateStructuredData('Person', personData);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('John Doe');
    expect(data.jobTitle).toBe('Developer');
  });

  it('merges custom data with base structure', () => {
    const customData = { name: 'Test', customField: 'custom value' };
    const data = generateStructuredData('Organization', customData);

    expect(data['@context']).toBe('https://schema.org');
    expect(data.customField).toBe('custom value');
  });
});
