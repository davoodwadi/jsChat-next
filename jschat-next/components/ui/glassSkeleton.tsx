// components/ui/skeleton.tsx

import { cn } from "@/lib/utils";

// ... (Keep your original Skeleton and MultilineSkeleton if you want)

function GlassSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    // The main container. It acts as a mask for the shimmer.
    // `relative` and `overflow-hidden` are CRUCIAL.
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        "bg-slate-500/10 backdrop-blur-sm", // The static glass background
        className
      )}
      {...props}
    >
      {/* The Shimmer Effect */}
      {/* It's an absolutely positioned div that moves across the parent */}
      <div
        className={cn(
          "absolute inset-0 -translate-x-full animate-shimmer animate-pulse animate-thinking-shimmer",
          "bg-gradient-to-r from-transparent via-slate-900/70 to-transparent" // The shimmer gradient
        )}
      />
    </div>
  );
}

// Multiline variant using the new GlassSkeleton
type MultilineSkeletonProps = {
  lines: number;
};

function MultilineGlassSkeleton({ lines }: MultilineSkeletonProps) {
  return (
    <div className="space-y-2  py-1">
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <GlassSkeleton key={index} className="h-4 w-full" />
      ))}
      <GlassSkeleton className="h-4 w-5/6" />
    </div>
  );
}

export { GlassSkeleton, MultilineGlassSkeleton };
