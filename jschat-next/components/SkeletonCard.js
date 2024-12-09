import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 mx-auto">
      <Skeleton className="h-[125px] w-full rounded-xl mx-auto" />
      <div className="space-y-2 mx-auto">
        <Skeleton className="h-4 w-[250px] mx-auto" />
        <Skeleton className="h-4 w-[200px] mx-auto" />
      </div>
    </div>
  );
}
