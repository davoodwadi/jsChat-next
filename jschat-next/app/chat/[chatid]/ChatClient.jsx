"use client";

import { Suspense } from "react";
import { test } from "@/lib/test";

import dynamic from "next/dynamic";
import { MultilineSkeleton } from "@/components/ui/skeleton";
import { Star, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingSettingsButton } from "./FloatingGear";
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

  const baseClass =
    "flex flex-row justify-between  px-1 pb-2 items-center border-b hover:cursor-pointer rounded-lg hover:bg-sky-100 hover:dark:bg-sky-950";
  const selectedClass =
    "flex flex-row justify-between  px-1 pb-2 items-center border-b hover:cursor-pointer rounded-lg bg-sky-200 dark:bg-sky-900 ";

  return (
    <Suspense
      fallback={
        <div className="w-3/4 mx-auto">
          <MultilineSkeleton lines={4} />
        </div>
      }
    >
      <FloatingSettingsButton
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />

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
