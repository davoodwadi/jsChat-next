"use client";

import { Suspense } from "react";
import { test } from "@/lib/test";

import dynamic from "next/dynamic";
import { MultilineSkeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

const ChatContainer = dynamic(
  () => import("@/components/recursiveChat/RecursiveComponent"),
  {
    loading: () => (
      <div className="w-3/4 mx-auto">
        <MultilineSkeleton lines={4} />
      </div>
    ),
  }
);
import {
  toggleBookmarkChatSession,
  getBookmarkStatus,
} from "@/lib/save/saveActions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useState, useRef, useEffect, useTransition } from "react";

import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";

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

const modelMeta = [
  {
    desc: "Perplexity Models (Closed-source)",
    models: perplexityModelsWithMeta,
  },
  { desc: "OpenAI Models (Closed-source)", models: openaiModelsWithMeta },
  { desc: "Groq Models (Open-source)", models: groqModelsWithMeta },
  { desc: "DeepInfra Models (Open-source)", models: deepinfraModelsWithMeta },
  { desc: "Anthropic Models (Closed-source)", models: anthropicModelsWithMeta },
  { desc: "xAI Models (Closed-source)", models: xAIModelsWithMeta },
  { desc: "Google Models (Closed-source)", models: geminiModelsWithMeta },
];
if (test) {
  modelMeta.unshift({ desc: "Test LLMs", models: testModels });
}
export default function ChatClient({ chatId, bookmarked }) {
  const { icon, ...startingModel } = test
    ? testModels[0]
    : openaiModelsWithMeta.find((m) => m.model.includes("chat")) ||
      openaiModelsWithMeta[0];
  const [model, setModel] = useState(startingModel);
  // console.log(model);
  const [systemPrompt, setSystemPrompt] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const baseClass =
    "flex flex-row justify-between  px-1 pb-2 items-center border-b hover:cursor-pointer rounded-lg hover:bg-sky-100 hover:dark:bg-sky-950";
  const selectedClass =
    "flex flex-row justify-between  px-1 pb-2 items-center border-b hover:cursor-pointer rounded-lg bg-sky-200 dark:bg-sky-900 ";

  const handleToggleBookmark = () => {
    startTransition(async () => {
      const res = await toggleBookmarkChatSession({ chatId: chatId });
      router.refresh();
    });
  };
  return (
    <Suspense
      fallback={
        <div className="w-3/4 mx-auto">
          <MultilineSkeleton lines={4} />
        </div>
      }
    >
      <div className="mx-auto w-3/4 flex flex-col justify-center p-2">
        {/* model select */}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" key="item-1">
            <AccordionTrigger>Model</AccordionTrigger>
            <AccordionContent>
              {modelMeta.map((mm, i) => {
                return (
                  <div className="pb-2" key={i}>
                    <p className="font-bold">{mm.desc}</p>
                    {mm.models.map((m) => {
                      return (
                        <div
                          className={
                            model.model === m.model ? selectedClass : baseClass
                          }
                          key={m.model}
                          onClick={() => {
                            const { icon, ...modelNow } = m;
                            // console.log("modelNow", modelNow);
                            setModel(modelNow);
                          }}
                        >
                          <div className="flex items-baseline gap-2 pt-2">
                            <span className="">{m?.icon && m.icon()}</span>
                            <div className="flex flex-col ">
                              <span className="">{m.name}</span>
                              <div className="flex items-center">
                                <span className="text-gray-500 text-xs">
                                  {m.meta}
                                </span>
                                {m?.new && (
                                  <span className="bg-green-500 text-white text-xs ml-2 px-1 rounded">
                                    New
                                  </span>
                                )}
                                {m?.vision && (
                                  <span className="bg-slate-500 text-white text-xs ml-2 px-1 rounded">
                                    Vision
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* {model === m.model && (
                            <Check
                              className="mr-1 ml-2 stroke-sky-600 "
                              size={16}
                            />
                          )} */}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* system prompt */}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-2" key="item-2">
            <AccordionTrigger>Additional Settings</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-2 p-4 border rounded-md shadow-md">
                <label htmlFor="systemPrompt" className="text-sm italic">
                  System Prompt
                </label>
                <Textarea
                  id="systemPrompt"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  style={{ fontSize: "16px" }}
                  placeholder="Enter your system prompt here..."
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex">
          <Button
            variant={"ghost"}
            className="mx-auto"
            onClick={handleToggleBookmark}
          >
            <Star
              className={`mr-2 h-4 w-4 ${
                bookmarked ? "text-yellow-500 fill-current" : ""
              }`}
            />
          </Button>
        </div>
      </div>
      <ChatContainer
        chatId={chatId}
        model={model}
        setModel={setModel}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        bookmarked={bookmarked}
      />
    </Suspense>
  );
}
