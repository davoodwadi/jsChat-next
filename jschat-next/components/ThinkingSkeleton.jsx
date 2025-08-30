export const ThinkingSkeleton = ({ children }) => {
  return (
    <div className="p-4 rounded-lg ">
      {/* Thinking indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-thinking-pulse"></div>
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-thinking-pulse [animation-delay:200ms]"></div>
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-thinking-pulse [animation-delay:400ms]"></div>
        </div>
        <span className="text-xs text-muted-foreground">Thinking</span>
      </div>

      {/* Thought lines */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded animate-thinking-shimmer w-3/5"></div>
        <div className="h-2 bg-muted rounded animate-thinking-shimmer w-4/5 [animation-delay:300ms]"></div>
        <div className="h-2 bg-muted rounded animate-thinking-shimmer w-full [animation-delay:600ms]"></div>
        <div className="h-2 bg-muted rounded animate-thinking-shimmer w-2/3 [animation-delay:900ms]"></div>
      </div>

      {children}
    </div>
  );
};
export const ThinkingReadingSkeleton = ({ children }) => {
  return (
    <div className="p-4 rounded-lg ">
      {/* Thinking indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-thinking-pulse"></div>
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-thinking-pulse [animation-delay:200ms]"></div>
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-thinking-pulse [animation-delay:400ms]"></div>
        </div>
        <span className="text-xs text-muted-foreground">Thinking</span>
      </div>

      {children}
    </div>
  );
};
