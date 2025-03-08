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

import {
  openaiModels,
  groqModels,
  deepinfraModels,
  openaiModelsWithMeta,
  groqModelsWithMeta,
  deepinfraModelsWithMeta,
} from "@/app/models";

const models = [...openaiModels, ...groqModels, ...deepinfraModels];
// console.log(openaiModels);
// console.log(models);
const modelMeta = [
  { desc: "OpenAI Models (Closed-source)", models: openaiModelsWithMeta },
  { desc: "Groq Models (Open-source)", models: groqModelsWithMeta },
  { desc: "DeepInfra Models (Open-source)", models: deepinfraModelsWithMeta },
];

export default function Chat() {
  // console.log("rendering chat [chatid]");

  const [model, setModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("");

  const params = useParams<{ tag: string; item: string; chatid: string }>();
  const chatId = params?.chatid;
  // console.log("chatId", chatId);

  // console.log("", models.includes(model));
  console.log("model client", model);
  // return <div>Hello</div>;
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
                            model === m.model ? selectedClass : baseClass
                          }
                          key={m.model}
                          onClick={() => {
                            setModel(m.model);
                          }}
                        >
                          <div className="flex items-baseline gap-2 pt-2">
                            <span className="">{m?.icon && m.icon()}</span>
                            <div className="flex flex-col ">
                              <span className="">{m.name}</span>
                              <span className="text-gray-500 text-xs">
                                {m.meta}
                              </span>
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
        setSystemPrompt={setSystemPrompt}
      />
    </Suspense>
  );
}
