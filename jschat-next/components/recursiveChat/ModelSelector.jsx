import { useState } from "react";
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
  perplexityModelsWithMeta,
  openaiModelsWithMeta,
  groqModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
  geminiModelsWithMeta,
  testModels,
} from "@/app/models";

export function ModelSelector({ selectedModel, onModelChange, className }) {
  const [open, setOpen] = useState(false);

  // Find the provider for the selected model
  const getModelProvider = (modelName) => {
    for (const [providerName, config] of Object.entries(providerConfig)) {
      const model = config.models.find((m) => m.name === modelName);
      if (model) return { providerName, model };
    }
    return null;
  };

  const selectedModelInfo = getModelProvider(selectedModel?.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-48 justify-between text-xs", className)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedModelInfo &&
              providerConfig[selectedModelInfo.providerName]?.icon}
            <span className="truncate">
              {selectedModel?.name || "Select model..."}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {Object.entries(providerConfig).map(([providerName, config]) => (
              <CommandGroup
                key={providerName}
                heading={
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{providerName}</span>
                    <Badge variant="outline" className="ml-auto">
                      {config.models.length}
                    </Badge>
                  </div>
                }
              >
                {config.models.map((model) => (
                  <CommandItem
                    key={model.name}
                    value={model.name}
                    onSelect={() => {
                      onModelChange(model);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedModel?.name === model.name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{model.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {model.hasSearch && (
                          <Badge variant="secondary" className="text-xs">
                            <SearchIcon className="w-3 h-3 mr-1" />
                            Search
                          </Badge>
                        )}
                        {model.hasDeepResearch && (
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            Research
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CompactModelSelector({
  selectedModel,
  onModelChange,
  className,
}) {
  // Build provider groups
  const providerGroups = {
    OpenAI: openaiModelsWithMeta,
    Anthropic: anthropicModelsWithMeta,
    Groq: groqModelsWithMeta,
    xAI: xAIModelsWithMeta,
    DeepInfra: deepinfraModelsWithMeta,
    Gemini: geminiModelsWithMeta,
    Perplexity: perplexityModelsWithMeta,
  };

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
        "rounded-md border border-input bg-background px-2 py-1.5 text-xs",
        "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "w-32 sm:w-48",
        className
      )}
    >
      {/* <option value="">Select model...</option> */}
      {Object.entries(providerGroups).map(([providerName, models]) => (
        <optgroup
          key={providerName}
          label={`${providerName} (${models.length})`}
        >
          {models.map((m) => (
            <option key={m.model} value={m.model}>
              {m.name}
              {/* {m.new ? " ✨" : ""} */}
              {/* {m.vision ? " 👁️" : ""} */}
              {/* {m.reasoning ? " 🧠" : ""} */}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
