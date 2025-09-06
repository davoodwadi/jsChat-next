import { MultilineSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="w-3/4 mx-auto my-16">
      <MultilineSkeleton lines={8} />
      <MultilineSkeleton lines={4} />
    </div>
  );
}
