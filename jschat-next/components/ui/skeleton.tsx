import { cn } from "@/lib/utils";
type MultilineSkeletonProps = {
  lines: number;
};
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary/10", className)}
      {...props}
    />
  );
}

export function MultilineSkeleton({ lines }: MultilineSkeletonProps) {
  return (
    <>
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full my-1" />
      ))}
      <Skeleton className="h-4 w-5/6 my-1" />
    </>
  );
}

export { Skeleton };
