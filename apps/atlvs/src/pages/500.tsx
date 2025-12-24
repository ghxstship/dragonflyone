import Link from 'next/link';
import {
  Body,
  H1,
} from '@ghxstship/ui';

export default function Custom500() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <H1 className="text-h1-lg font-weight-bold text-foreground mb-4">500 - Server Error</H1>
      <Body className="text-body-md text-muted-foreground mb-6">Something went wrong on our end.</Body>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-button font-weight-medium hover:bg-primary/90 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
