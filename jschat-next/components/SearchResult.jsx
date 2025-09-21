import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SearchResult({ result, i }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    // --- CHANGES START HERE ---
    // Removed rounded-md because the dividers from the parent handle the separation.
    // The hover effect now uses a semi-transparent color.
    <div
      key={i}
      className="p-4 transition-colors hover:bg-white/5 dark:hover:bg-white/5"
    >
      {/* Title */}
      <a
        className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {result.title || "Untitled"}
      </a>

      {/* URL */}
      {result.url !== undefined && (
        // Changed text color to be semi-transparent for a softer look
        <p className="text-xs text-black/60 dark:text-white/60 mt-1 overflow-x-auto">
          {result.url}
        </p>
      )}

      {/* Score */}
      {result.score !== undefined && (
        <p className="text-xs text-black/60 dark:text-white/60 mt-1">
          Relevance Score: <span className="font-medium">{result.score}</span>
        </p>
      )}

      {/* --- RESTRUCTURED CONTENT TOGGLE --- */}
      {/* We add a subtle border-top to visually separate metadata from content */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="border-t border-white/20 dark:border-white/10 w-full flex items-center uppercase mt-3 pt-3 text-xs text-black/70 dark:text-white/70 font-semibold tracking-wider transition-colors rounded-sm hover:text-black/90 dark:hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <span>Content</span>
        <div className="flex-1" />
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 opacity-70" />
        ) : (
          <ChevronRight className="h-4 w-4 opacity-70" />
        )}
      </button>

      {/* Content */}
      {result.content && isExpanded && (
        // Changed text color for the main content
        <div className="mt-2 text-xs leading-relaxed text-black/80 dark:text-white/80 prose prose-sm dark:prose-invert prose-p:my-1">
          {result.content
            .split(/\[\.\.\.\]/g)
            .filter((chunk) => chunk.trim() !== "")
            .map((chunk, idx) => (
              <div key={idx} className="flex flex-col py-1">
                {chunk}
              </div>
            ))}
        </div>
      )}
      {/* --- CHANGES END HERE --- */}
    </div>
  );
}
