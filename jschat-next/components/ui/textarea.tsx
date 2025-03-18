import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  const baseClass = `flex min-h-[90px] w-full rounded-md border  
  bg-transparent px-3 py-2 
  
  shadow-sm placeholder:text-muted-foreground 
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
  disabled:cursor-not-allowed disabled:opacity-50 
  
  `;
  return <textarea className={cn(baseClass, className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";

export { Textarea };
