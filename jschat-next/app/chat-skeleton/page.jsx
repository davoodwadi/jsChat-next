import {
  MultilineGlassSkeleton,
  GlassSkeleton,
} from "@/components/ui/glassSkeleton";
import { cn } from "@/lib/utils";

export default function ChatSkeleton() {
  // const loading = true;
  return (
    <div className="flex flex-col justify-center items-start px-16 h-[83vh]">
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
    </div>
    // <>
    //   {loading ? (
    //     <Skeleton variant="rounded" width="100%">
    //       {/* <div className="text-xs" /> */}
    //       <p className="text-xs">...</p>
    //     </Skeleton>
    //   ) : (
    //     <h1>Hello</h1>
    //   )}
    // </>
    // <div className=" h-[83vh] rounded-xl mx-auto overflow-y-auto overflow-x-auto py-16  w-[90vw] md:w-[90vw] ">
    // <div className="w-3/4 mx-auto">
    //   <MultilineGlassSkeleton lines={8} />
    //   <MultilineGlassSkeleton lines={4} />
    // </div>

    // </div>
  );
}

function ItemSkeleton() {
  return (
    <div
      className={cn(
        // 1. Use the SAME base class as the real item for consistent layout
        "glass-sidebar-item",
        "flex w-full text-left p-2 rounded-lg text-xs justify-center items-center",
        "glass-skeleton-shimmer"
      )}
    >
      <div
        className={cn(
          // For Light Mode: Use a muted gray (like black with low opacity)
          "bg-black/10",
          // For Dark Mode: Use a muted white (like white with low opacity)
          "dark:bg-white/10",
          // Standard layout styles
          "h-3 rounded-full animate-pulse" // Added animate-pulse for extra effect
        )}
        style={{ width: `${Math.floor(Math.random() * 20) + 70}%` }}
      ></div>
    </div>
  );
}
