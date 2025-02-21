"use client";

import { Suspense } from "react";

import dynamic from "next/dynamic";
import { MultilineSkeleton } from "@/components/ui/skeleton";

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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Check, CircleCheck, CircleDot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function Chat() {
  const params = useParams<{ tag: string; item: string; chatid: string }>();
  const chatId = params?.chatid;
  // console.log("chatId", chatId);
  const [model, setModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("");
  // console.log("systemPrompt", systemPrompt);
  const models = [
    "gpt-4o-mini",
    "deepseek-ai/DeepSeek-R1",
    "llama-3.3-70b-versatile",
    "deepseek-r1-distill-llama-70b",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    "nvidia/Llama-3.1-Nemotron-70B-Instruct",
    "Qwen/Qwen2.5-72B-Instruct",
  ];
  console.log("model client", model);

  return (
    <>
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
              {models.map((m) => {
                return (
                  <AccordionContent
                    key={m}
                    onClick={() => {
                      setModel(m);
                    }}
                  >
                    <span className="inline-flex items-center">
                      <span>{m}</span>

                      {model === m && <Check className="mr-1 ml-2" size={16} />}
                    </span>
                  </AccordionContent>
                );
              })}
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
                    placeholder="Enter your system prompt here..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <ChatContainer
          chatId={chatId}
          model={model}
          systemPrompt={systemPrompt}
        />
      </Suspense>
    </>
  );
}
