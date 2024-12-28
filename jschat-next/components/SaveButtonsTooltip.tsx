"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type Elements = {
  loading: boolean;
  setLoading: () => void;
  Element: React.ElementType;
  text: string;
  onClickFn: () => void;
}[];

export function SaveButtonsTooltip({ elements }: { elements: Elements }) {
  //   console.log("elements", elements);
  return (
    <>
      {elements.map(
        ({ Element, loading, setLoading, text, onClickFn }, index) => (
          <TooltipProvider key={index}>
            <Tooltip key={index}>
              <TooltipTrigger asChild key={index}>
                <Button
                  onClick={onClickFn}
                  disabled={loading}
                  className="mx-1 mt-2"
                  size="sm"
                >
                  <Element />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{text}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      )}
    </>
  );
}
