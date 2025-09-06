"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function SaveButtonsTooltip({ elements }) {
  //   console.log("elements", elements);
  return (
    <>
      {elements.map(({ Element, loading, text, enabled, onClickFn }, index) => {
        // console.log("enabled", enabled);
        const baseStyle = " mx-1 mt-2 !rounded-full w-10 h-10 p-0 ";
        const finalStyle = enabled
          ? baseStyle + "glass-button-yellow-enabled"
          : baseStyle + "glass-button-dark";
        return (
          <TooltipProvider key={index}>
            <Tooltip key={index}>
              <TooltipTrigger asChild key={index}>
                <Button
                  onClick={onClickFn}
                  disabled={loading}
                  className={finalStyle}
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
        );
      })}
    </>
  );
}
