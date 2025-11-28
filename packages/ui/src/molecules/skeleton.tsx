export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = "100%", height = "1rem", className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-grey-800 rounded-[var(--radius-badge)] ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border-2 border-grey-800 p-spacing-6 rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(255,255,255,0.1)]">
      <Skeleton height="2rem" width="60%" className="mb-spacing-4" />
      <Skeleton height="1rem" width="40%" className="mb-spacing-6" />
      <Skeleton height="1rem" width="100%" className="mb-spacing-2" />
      <Skeleton height="1rem" width="90%" className="mb-spacing-2" />
      <Skeleton height="1rem" width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border-2 border-grey-800 rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(255,255,255,0.1)] overflow-hidden">
      <div className="border-b-2 border-grey-800 p-spacing-4">
        <div className="flex gap-gap-md">
          <Skeleton height="1rem" width="20%" />
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="1rem" width="25%" />
          <Skeleton height="1rem" width="15%" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b-2 border-grey-800 p-spacing-4">
          <div className="flex gap-gap-md">
            <Skeleton height="1rem" width="20%" />
            <Skeleton height="1rem" width="30%" />
            <Skeleton height="1rem" width="25%" />
            <Skeleton height="1rem" width="15%" />
          </div>
        </div>
      ))}
    </div>
  );
}
