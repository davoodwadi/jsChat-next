"use client";

import {
  MultilineGlassSkeleton,
  GlassSkeleton,
} from "@/components/ui/glassSkeleton";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function ChatSkeleton() {
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
  // 1. Start with a fixed, non-random width.
  const [width, setWidth] = useState("80%"); // Or any default you prefer

  // 2. Use useEffect to set a random width only on the client, after hydration.
  useEffect(() => {
    // This code only runs in the browser, not on the server.
    const randomWidth = Math.floor(Math.random() * (90 - 70 + 1)) + 70;
    setWidth(`${randomWidth}%`);
  }, []); // The empty dependency array [] ensures this runs only once after mount.

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
        style={{ width: width }}
      ></div>
    </div>
  );
}
