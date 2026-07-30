"use client";

import { useState } from "react";
import {
  fetchAnthropicModels,
  fetchGeminiModels,
  fetchOpenAIModels,
} from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronDown,
  AlertCircle,
  Database,
  Cpu,
  Calendar,
  Layers,
  Zap,
  Image,
  FileText,
  Code,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModelPage() {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [modelsList, setModelsList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleProviderChange = async (provider) => {
    setSelectedProvider(provider);
    setModelsList([]);
    setSelectedModel(null);
    setError("");

    if (provider === "anthropic") {
      setIsLoading(true);
      const result = await fetchAnthropicModels();
      if (result.success) {
        setModelsList(result.data);
      } else {
        setError(result.error || "Failed to fetch models");
      }
      setIsLoading(false);
    } else if (provider === "gemini") {
      setIsLoading(true);
      const result = await fetchGeminiModels();
      if (result.success) {
        setModelsList(result.data);
      } else {
        setError(result.error || "Failed to fetch Gemini models");
      }
      setIsLoading(false);
    } else if (provider === "openai") {
      setIsLoading(true);
      const result = await fetchOpenAIModels();
      if (result.success) {
        setModelsList(result.data);
      } else {
        setError(result.error || "Failed to fetch OpenAI models");
      }
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelId) => {
    const model = modelsList.find((m) => m.id === modelId);
    setSelectedModel(model);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Models Explorer
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover and explore AI models, their properties, and reasoning
          capabilities dynamically.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Select a provider to query their available AI models.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                AI Provider
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedProvider ? (
                      <span className="capitalize">{selectedProvider}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Select a Provider...
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]">
                  <DropdownMenuRadioGroup
                    value={selectedProvider}
                    onValueChange={handleProviderChange}
                  >
                    <DropdownMenuRadioItem value="anthropic">
                      Anthropic
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="gemini">
                      Google Gemini
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="openai">
                      OpenAI
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Available Models
                </label>
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {/* Model Selection */}
            {modelsList.length > 0 && !isLoading && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-sm font-medium leading-none">
                  Select Model
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedModel ? (
                        <span>
                          {selectedModel.display_name || selectedModel.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Search models...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search model name or ID..." />
                      <CommandList>
                        <CommandEmpty>No models found.</CommandEmpty>
                        <CommandGroup>
                          {modelsList.map((model) => (
                            <CommandItem
                              key={model.id}
                              value={model.display_name || model.id}
                              onSelect={() => {
                                handleModelSelect(model.id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedModel?.id === model.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {model.display_name || model.id}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verbatim Model Details */}
        {selectedModel && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">
                    {selectedModel.display_name || selectedModel.id}
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedModel.id}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* General Metadata & Limits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col p-4 rounded-xl bg-muted/30 border">
                  <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Created
                  </span>
                  <span className="text-sm font-semibold">
                    {selectedModel.created_at
                      ? new Date(selectedModel.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col p-4 rounded-xl bg-muted/30 border">
                  <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Type
                  </span>
                  <span className="text-sm font-semibold capitalize">
                    {selectedModel.type || "N/A"}
                  </span>
                </div>
                {selectedModel.max_input_tokens && (
                  <div className="flex flex-col p-4 rounded-xl bg-muted/30 border">
                    <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Max Input
                    </span>
                    <span className="text-sm font-semibold">
                      {formatNumber(selectedModel.max_input_tokens)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        tok
                      </span>
                    </span>
                  </div>
                )}
                {selectedModel.inputTokenLimit && (
                  <div className="flex flex-col p-4 rounded-xl bg-muted/30 border">
                    <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Max Input
                    </span>
                    <span className="text-sm font-semibold">
                      {formatNumber(selectedModel.inputTokenLimit)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        tok
                      </span>
                    </span>
                  </div>
                )}
                {selectedModel.max_tokens && (
                  <div className="flex flex-col p-4 rounded-xl bg-muted/30 border">
                    <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Max Output
                    </span>
                    <span className="text-sm font-semibold">
                      {formatNumber(selectedModel.max_tokens)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        tok
                      </span>
                    </span>
                  </div>
                )}
                {selectedModel.outputTokenLimit && (
                  <div className="flex flex-col p-4 rounded-xl bg-muted/30 border">
                    <span className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Max Output
                    </span>
                    <span className="text-sm font-semibold">
                      {formatNumber(selectedModel.outputTokenLimit)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        tok
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Capabilities Block (Reasoning Only) */}
              {(selectedModel.capabilities?.thinking ||
                selectedModel.capabilities?.effort) && (
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Reasoning Capabilities
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedModel.capabilities.thinking?.supported && (
                        <Badge
                          variant="outline"
                          className="bg-background border-muted-foreground/30"
                        >
                          Thinking (Verbatim Type:{" "}
                          {Object.entries(
                            selectedModel.capabilities.thinking.types || {},
                          )
                            .filter(([key, val]) => val?.supported)
                            .map(([key]) => `"${key}"`)
                            .join(", ") || "none"}
                          )
                        </Badge>
                      )}
                      {selectedModel.capabilities.effort?.supported && (
                        <div className="flex items-center gap-1.5 border border-muted-foreground/30 bg-background rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Effort Levels:
                          <span className="text-muted-foreground ml-1 font-mono">
                            [
                            {Object.entries(selectedModel.capabilities.effort)
                              .filter(
                                ([key, val]) =>
                                  key !== "supported" && val?.supported,
                              )
                              .map(([key]) => `"${key}"`)
                              .join(", ")}
                            ]
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Raw JSON Accordion */}
              <Accordion type="single" collapsible className="w-full mt-8">
                <AccordionItem value="raw-payload" className="border-none">
                  <AccordionTrigger className="hover:no-underline rounded-md px-4 py-3 border bg-muted/30 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      View Raw API Payload
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="rounded-md border bg-muted/30">
                      <ScrollArea className="h-[300px] w-full rounded-md">
                        <pre className="p-4 text-xs font-mono">
                          {JSON.stringify(selectedModel, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
