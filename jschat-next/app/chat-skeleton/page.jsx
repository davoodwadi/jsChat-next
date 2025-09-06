import {
  MultilineGlassSkeleton,
  GlassSkeleton,
} from "@/components/ui/glassSkeleton";
export default function ChatSkeleton() {
  return (
    // <div className=" h-[83vh] rounded-xl mx-auto overflow-y-auto overflow-x-auto py-16  w-[90vw] md:w-[90vw] ">
    <div className="w-3/4 mx-auto">
      <MultilineGlassSkeleton lines={8} />
      <MultilineGlassSkeleton lines={4} />
    </div>
    // </div>
  );
}
