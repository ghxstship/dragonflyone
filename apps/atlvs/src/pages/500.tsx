import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-h1-lg font-weight-bold text-foreground mb-4">500 - Server Error</h1>
      <p className="text-body-md text-muted-foreground mb-6">Something went wrong on our end.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-button font-weight-medium hover:bg-primary/90 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
