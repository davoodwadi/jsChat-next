import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { test } from "@/lib/test";
// let test = false;

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronDown,
  Zap,
  Brain,
  Code,
  Search as SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  alibabaModelsWithMeta,
  perplexityModelsWithMeta,
  openaiModelsWithMeta,
  groqModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
  geminiModelsWithMeta,
  testModels,
} from "@/app/models";

const providerGroups = {
  Gemini: geminiModelsWithMeta,
  xAI: xAIModelsWithMeta,
  OpenAI: openaiModelsWithMeta,
  AlibabaCloud: alibabaModelsWithMeta,
  Perplexity: perplexityModelsWithMeta,
  Anthropic: anthropicModelsWithMeta,
  Groq: groqModelsWithMeta,
  DeepInfra: deepinfraModelsWithMeta,
};

if (test) {
  providerGroups["Test"] = testModels;
}

export function CompactModelSelector({
  selectedModel,
  onModelChange,
  className,
}) {
  const [open, setOpen] = useState(false);

  // Memoize default model
  const defaultModel = useMemo(() => {
    return (
      selectedModel ||
      geminiModelsWithMeta.find((m) => m.model === "gemini-2.5-pro")
    );
  }, [selectedModel]);

  // Memoize display name
  const selectedDisplayName = useMemo(() => {
    if (!defaultModel?.model) return "Select model...";

    for (const models of Object.values(providerGroups)) {
      const model = models.find((m) => m.model === defaultModel.model);
      if (model) return model.name;
    }
    return defaultModel.model;
  }, [defaultModel, providerGroups]);

  const handleModelSelect = (model) => {
    const { icon, ...rest } = model;
    onModelChange(rest);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "max-w-32 sm:max-w-48 justify-between text-xs glass-button rounded-full px-3 py-1.5 h-auto",
            className
          )}
        >
          <span className="truncate text-foreground/80 text-left">
            {selectedDisplayName}
          </span>
          <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="max-w-72 p-0 glass-popover"
        align="start"
        sideOffset={4}
      >
        <div className="glass-overlay" />
        <div className="relative z-10">
          <Command className="glass-command">
            <div className="px-3 py-2 border-b border-white/10 dark:border-white/5">
              <CommandInput
                placeholder="Search models..."
                className="border-0 bg-transparent px-0 py-1 text-sm focus:ring-0 placeholder:text-muted-foreground/60"
              />
            </div>

            <CommandList className="max-h-64 overflow-y-auto p-1">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground/60">
                No models found.
              </CommandEmpty>

              {Object.entries(providerGroups).map(([providerName, models]) => (
                <CommandGroup key={providerName}>
                  {/* Group header */}
                  <div className="flex items-center gap-2 px-2 py-2 rounded-md transition-colors sticky top-0  backdrop-blur-sm">
                    <span className="text-xs font-medium text-foreground/70">
                      {providerName}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-auto glass-badge text-xs h-4 px-1.5"
                    >
                      {models.length}
                    </Badge>
                  </div>

                  {/* Models list */}
                  <div className="space-y-1 pb-2">
                    {models.map((model) => (
                      <CommandItem
                        key={model.model}
                        value={`${providerName} ${model.name} ${model.model}`}
                        onSelect={() => handleModelSelect(model)}
                        className="flex items-center gap-2 py-2 px-2 text-sm rounded-md cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 transition-colors duration-5"
                      >
                        <Check
                          className={cn(
                            "h-3 w-3 shrink-0",
                            defaultModel?.model === model.model
                              ? "opacity-100 text-foreground/80"
                              : "opacity-0"
                          )}
                        />
                        <span className="truncate text-foreground/90 text-xs">
                          {model.name}
                        </span>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  );
}
export function CompactModelSelector2({
  selectedModel,
  onModelChange,
  className,
}) {
  // Build provider groups
  // const providerGroups = {
  //   AlibabaCloud: alibabaModelsWithMeta,
  //   Perplexity: perplexityModelsWithMeta,
  //   OpenAI: openaiModelsWithMeta,
  //   Gemini: geminiModelsWithMeta,
  //   xAI: xAIModelsWithMeta,
  //   Anthropic: anthropicModelsWithMeta,
  //   Groq: groqModelsWithMeta,
  //   DeepInfra: deepinfraModelsWithMeta,
  // };

  // Only include test models if the test flag is true
  if (test) {
    providerGroups["Test"] = testModels;
  }

  // Default to OpenAI gpt-5-chat-latest
  const defaultModel =
    selectedModel ||
    openaiModelsWithMeta.find((m) => m.model === "gpt-5-chat-latest");
  //   console.log("defaultModel?.model", defaultModel?.model);
  return (
    <select
      value={defaultModel?.model || ""}
      onChange={(event) => {
        const selectedModelId = event.target.value;
        // Find the model across all provider groups
        for (const models of Object.values(providerGroups)) {
          const model = models.find((m) => m.model === selectedModelId);
          if (model) {
            const { icon, ...rest } = model;
            // console.log("rest", rest);
            onModelChange(rest);
            break;
          }
        }
      }}
      className={cn(
        "rounded-full border border-input bg-background px-2 py-1.5 text-xs",
        "glass-input",
        // "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // "w-32 sm:w-48",

        className
      )}
    >
      {/* <option value="">Select model...</option> */}
      {Object.entries(providerGroups).map(([providerName, models]) => (
        <optgroup
          className="glass-card"
          key={providerName}
          label={`${providerName} (${models.length})`}
        >
          {models.map((m) => (
            <option key={m.model} value={m.model} className="glass-card">
              {m.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
