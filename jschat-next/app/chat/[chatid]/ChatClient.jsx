"use client";

import { Suspense } from "react";

import dynamic from "next/dynamic";
import { Star, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatSkeleton from "@/app/chat-skeleton/page";

// import { FloatingSettingsButton } from "./FloatingGear";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";
const ChatContainer = dynamic(
  () => import("@/components/recursiveChat/RecursiveComponent"),
  {
    loading: () => <ChatSkeleton />,
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
  alibabaModelsWithMeta,
  perplexityModelsWithMeta,
  openaiModelsWithMeta,
  groqModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
  geminiModelsWithMeta,
  testModels,
  allModels,
} from "@/app/models";

import { test } from "@/lib/test";
// const test = false;
const modelMeta = [
  {
    desc: "AlibabaCloud Models (Closed-source)",
    models: alibabaModelsWithMeta,
  },
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
  // const { icon, ...startingModel } = test
  //   ? testModels[0]
  //   : geminiModelsWithMeta.find((m) => m.model.includes("gemini-2.5-pro")) ||
  //     geminiModelsWithMeta[0];
  const { icon, ...startingModel } = test
    ? testModels[0]
    : allModels.find((m) => m?.default) || openaiModelsWithMeta[0];

  // const [model, setModel] = useState(startingModel);
  // console.log(allModels);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [globalModelInfo, setGlobalModelInfo] = useState({
    model: startingModel,
    modelConfig: {
      search: false,
      deepResearch: false,
      agentic: false,
      academic: false,
      reasoning: false,
    },
  });

  const baseClass =
    "flex flex-row justify-between  px-1 pb-2 items-center border-b hover:cursor-pointer rounded-lg hover:bg-sky-100 hover:dark:bg-sky-950";
  const selectedClass =
    "flex flex-row justify-between  px-1 pb-2 items-center border-b hover:cursor-pointer rounded-lg bg-sky-200 dark:bg-sky-900 ";

  return (
    <Suspense fallback={ChatSkeleton}>
      {/* <FloatingSettingsButton
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      /> */}
      <ChatContainer
        chatId={chatId}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        bookmarked={bookmarked}
        globalModelInfo={globalModelInfo}
        setGlobalModelInfo={setGlobalModelInfo}
      />
    </Suspense>
  );
}
