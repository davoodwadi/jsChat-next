import { useState } from "react";
import { ChevronDown, ChevronRight, Brain, ExternalLink } from "lucide-react"; // or your preferred icon library

export default function SearchResult({ result, i }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <div
        key={i}
        className="p-4 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors rounded-md"
      >
        {/* Title */}
        <a
          className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          // onClick={() => window.open(r.url, "_blank")}
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {result.title || "Untitled"}
        </a>
        {/* url */}
        {result.url !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {" "}
            <span className="font-medium truncate">{result.url}</span>
          </p>
        )}
        {/* Score */}
        {result.score !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Relevance Score: <span className="font-medium">{result.score}</span>
          </p>
        )}

        {/* Content Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="border-0 w-full flex items-center uppercase  py-3 text-xs text-muted-foreground font-semibold tracking-wider transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
        >
          <span>Content</span>
          <div className="flex-1" />
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {/* Content */}
        {result.content && isExpanded && (
          <div className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            {result.content
              .split(/\[\.\.\.\]/g)
              .filter((chunk) => chunk.trim() !== "")
              .map((chunk, idx) => (
                <div key={idx} className="flex flex-col py-2">
                  {chunk}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
