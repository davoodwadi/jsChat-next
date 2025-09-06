"use client";

import { getAuth } from "@/lib/actions";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search } from "lucide-react";

import ChatSkeleton from "@/app/chat-skeleton/page";
import { AuthDialog, TopupDialog } from "@/components/auth/AuthDialog";
import { useParams } from "next/navigation";
import { saveChatSession, loadChatSession } from "@/lib/save/saveActions";
import { allModelsWithoutIcon } from "@/app/models";
import { SaveItemsCanvas } from "@/components/save/SaveComponents";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const endpoint = "chatfulltext";

export default function EditableWithTooltip() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canvasId = params?.canvasid;
  // console.log("canvasId", canvasId);

  const { icon, ...startingModel } = allModelsWithoutIcon[0];
  const [model, setModel] = useState(startingModel);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [webSearchOn, setWebSearchOn] = useState(false);
  const [references, setReferences] = useState("References\n");
  const [extraContext, setExtraContext] = useState("");
  // console.log("webSearchOn", webSearchOn);
  const [llmInstructions, setLLMInstructions] = useState("");
  // console.log("llmInstructions", llmInstructions);
  const textareaRef = useRef(null);

  // console.log("selectionRectangle", selectionRectangle);
  const [canvasText, setCanvasText] = useState();
  const [cursorPos, setCursorPos] = useState();
  const [isLoadingFromLLM, setIsLoadingFromLLM] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTopupDialogOpen, setIsTopupDialogOpen] = useState(false);
  const textAreaClass = `rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-950 placeholder-gray-800
border-none drop-shadow-none divide-none outline-none shadow-none
focus-visible:ring-0
dark:placeholder-gray-500 
dark:text-gray-100`;
  // load canvas history on launch
  useEffect(() => {
    const loadHistory = async () => {
      console.log("loading history for ", canvasId);
      const thisSession = await loadChatSession({ chatId: canvasId });
      if (!thisSession) {
        // console.log("thisSession undefined");
        setLoadingHistory(false);
        setIsLoading(false);
        return;
      }
      if (thisSession?.content?.canvasText) {
        // console.log(`CLIENT: thisSession?.content`, thisSession?.content);
        setCanvasText(
          thisSession?.content?.canvasText
            ? thisSession?.content?.canvasText
            : ""
        );
        setReferences(
          thisSession?.content?.references
            ? thisSession?.content?.references
            : ""
        );
        setLLMInstructions(
          thisSession?.content?.llmInstructions
            ? thisSession?.content?.llmInstructions
            : ""
        );
        setExtraContext(
          thisSession?.content?.extraContext
            ? thisSession?.content?.extraContext
            : ""
        );
      }
      setLoadingHistory(false);
      setIsLoading(false);
    };
    loadHistory();
  }, []);
  // END: load canvas history on launch

  const onInput = (e) => {
    setCanvasText(e.target.value);
    // console.log("canvasText", canvasText);
  };
  // Event handlers
  const handleTextareaClick = (e) => {
    // console.log("e", e);
    handleCursorPosition();
  };
  const handleTextareaKeyUp = (e) => {
    // Don't trigger on modifier keys
    if (![16, 17, 18, 91, 93].includes(e.keyCode)) {
      handleCursorPosition();
    }
  };
  const handleTextareaBlur = () => {
    handleCursorPosition();
  };
  const handleSelectionChange = () => {
    if (document.activeElement === textareaRef.current) {
      handleCursorPosition();
    }
  };
  // Listen for selection changes
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleCursorPosition = () => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    setCursorPos({ start: start, end: end });
    // console.log("cursorPos", cursorPos);
  };

  return (
    <>
      {loadingHistory || isLoading ? (
        <div className="mx-16 w-vw">
          <ChatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 w-vw mx-16">
          <Textarea
            className={textAreaClass + ` col-span-2 `}
            value={llmInstructions}
            onChange={(e) => setLLMInstructions(e.target.value)}
            style={{ resize: "none", fontSize: "16px" }}
            placeholder="Instructions to modify the selected text..."
          />
          <div className="col-span-1 flex flex-col justify-center gap-2">
            <div className="flex flex-row gap-2 items-center justify-between">
              <select
                id="modelDropdown"
                value={model?.name}
                onChange={(event) => {
                  const selectedModelName = event.target.value; // Get the selected model's name
                  const selectedModel = allModelsWithoutIcon.find(
                    (model) => model.name === selectedModelName
                  );
                  setModel(selectedModel);
                  //   console.log("model", model);
                }}
                className=" bg-gray-100 dark:bg-gray-900 rounded text-xs p-1 w-32 sm:w-48"
              >
                {allModelsWithoutIcon.map((m, i) => (
                  <option key={i} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <Toggle
                size="sm"
                aria-label="Web Search Toggle"
                variant="outline"
                onPressedChange={() => setWebSearchOn((v) => !v)}
              >
                <Search />
              </Toggle>
            </div>
            <Button
              size="sm"
              className="my-auto"
              disabled={isLoadingFromLLM}
              onClick={async () => {
                setIsLoadingFromLLM(true);
                await handleGenerate({
                  cursorPos,
                  model: model,
                  setCanvasText,
                  setIsDialogOpen,
                  setIsTopupDialogOpen,
                  canvasId,
                  allText: canvasText,
                  llmInstructions,
                  webSearchOn,
                  setReferences,
                  references,
                  extraContext,
                });
                setIsLoadingFromLLM(false);
              }}
            >
              {isLoadingFromLLM ? (
                <>
                  <Loader2 className="animate-spin" /> Generate
                </>
              ) : (
                <>Generate</>
              )}
            </Button>
          </div>
          <Textarea
            ref={textareaRef}
            value={canvasText}
            onChange={onInput}
            onClick={handleTextareaClick}
            onKeyUp={handleTextareaKeyUp}
            onBlur={handleTextareaBlur}
            spellCheck={true}
            className={
              textAreaClass +
              `
            col-span-2
            overflow-auto
            text-wrap
            h-[calc(100vh_-_250px)]
            p-3 
            text-base              
            `
            }
            placeholder="Type here..."
            style={{ resize: "none", fontSize: "16px" }}
            id="textarea"
          />
          <Textarea
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            className={
              textAreaClass +
              `
            col-span-1
            h-[calc(100vh_-_250px)]
            overflow-auto
            text-wrap
            `
            }
            placeholder="Add extra context here..."
            style={{ resize: "none", fontSize: "8px" }}
            id="contextArea"
          />

          <AuthDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
          <TopupDialog
            isDialogOpen={isTopupDialogOpen}
            setIsDialogOpen={setIsTopupDialogOpen}
          />
          <div className="col-span-3 flex justify-center pb-6">
            <SaveItemsCanvas
              canvasId={canvasId}
              canvasText={canvasText}
              setCanvasText={setCanvasText}
              llmInstructions={llmInstructions}
              setLLMInstructions={setLLMInstructions}
              extraContext={extraContext}
              setExtraContext={setExtraContext}
              references={references}
              setReferences={setReferences}
              searchParams={searchParams}
              pathname={pathname}
            />
          </div>
          <Textarea
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            // spellCheck={true}
            className={
              textAreaClass +
              `
            col-span-3 
            overflow-auto
            text-wrap 
            p-6
            `
            }
            placeholder="Citations will populate here..."
            style={{ resize: "none", fontSize: "8px" }}
            rows={10}
            id="citationArea"
          />
        </div>
      )}
    </>
  );
}

async function handleGenerate({
  cursorPos,
  model,
  setCanvasText,
  setIsDialogOpen,
  setIsTopupDialogOpen,
  canvasId,
  allText,
  llmInstructions,
  webSearchOn,
  setReferences,
  references,
  extraContext,
}) {
  const { wrappedAllText, wrappedSelection } = wrapWithTripleBackticksCustom({
    allText,
    cursorPos,
    backticks: true,
  });
  let systemPrompt;
  const today = new Date().toDateString();
  // console.log("today", today);
  // return;
  const systemprompt1a = `Today's date is ${today}. You role is to create the information necessary to replace the text below (in triple backticks):
${wrappedSelection}
You should output only the text that properly replaces the text in triple backticks.
`;
  const systemprompt1b = `Today's date is ${today}. You role is to create the information necessary to continue the user message.
  `;
  systemPrompt =
    !cursorPos || cursorPos?.start === cursorPos?.end
      ? systemprompt1b
      : systemprompt1a;

  const systemprompt4 = `You have to keep this instruction in mind when generating your response: ${llmInstructions}
`;
  systemPrompt += llmInstructions ? systemprompt4 : "";
  const systemprompt5 = `You have to ensure the information you create is consistent with the surrounding context.
The user will provide the full context after the ### FULL CONTEXT tag.`;
  systemPrompt +=
    !cursorPos || cursorPos?.start === cursorPos?.end ? "" : systemprompt5;

  systemPrompt +=
    (model.model === "o4-mini" ||
      model.model.includes("grok") ||
      model.model.includes("claude")) &&
    webSearchOn
      ? `When you use the search results, make sure you provide inline citations to back your argument up. 
Provide the APA style references section at the end of your response.`
      : "";
  // console.log("systemPrompt", systemPrompt);
  // return;
  systemPrompt +=
    !cursorPos || cursorPos?.start === cursorPos?.end
      ? "\nRemember that you should output only the text that properly continues the user message. Do not repeat the whole text.\n"
      : "\nRemember that you should output only the text that properly replaces the text in triple backticks. Do not repeat the whole user message.\n";
  if (extraContext) {
    systemPrompt += `

You can consult the academic papers below for your response:
${extraContext}

If you use the academic papers for your response, make sure to include both inline citations and a references section at the end.
`;
  }
  const wrappedAllTextWithTags =
    !cursorPos || cursorPos?.start === cursorPos?.end
      ? `${allText}`
      : `### SEGMENT TO REPLACE:
${wrappedSelection}
### FULL CONTEXT:
${wrappedAllText}`;
  console.log("systemPrompt", systemPrompt);
  // console.log("wrappedAllText", wrappedAllText);
  console.log("wrappedAllTextWithTags", wrappedAllTextWithTags);
  // console.log(model);
  // return;
  try {
    const authStatus = await getAuth();
    if (authStatus === 400) {
      console.log("Not Authenticated", authStatus);
      setIsDialogOpen(true);
      return;
    } else if (authStatus === 401) {
      console.log("authStatus Not Enough Tokens", authStatus);
      setIsTopupDialogOpen(true);
      return;
    }
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: { text: wrappedAllTextWithTags } },
          ],
          model: model.model,
          email: authStatus,
          webSearchOn: webSearchOn,
        }),
      }
    );
    const dataJson = await data.json();
    // console.log("dataJson", dataJson);
    if (dataJson?.citationsArray) {
      const newCitationString = citationArraytoString(dataJson.citationsArray);
      setReferences((v) => v + "\n" + newCitationString);
    }
    const responseText = dataJson.text; //.split("").reverse().join("");
    // const responseText = "YOOO";
    // Replace selected text with responseText:
    let newAllText;
    if (allText) {
      if (cursorPos) {
        // If cursor position is defined, insert text at cursor position
        newAllText =
          allText.substring(0, cursorPos.start) +
          responseText +
          allText.substring(cursorPos.end);
      } else {
        // If cursorPos is undefined, append responseText at the end with a newline
        newAllText = allText + "\n" + responseText;
      }
      setCanvasText(newAllText);
    } else {
      newAllText = responseText;
      setCanvasText(responseText);
    }

    // save the session
    saveChatSession({
      chatId: canvasId,
      canvasText: newAllText,
      references,
      llmInstructions,
      extraContext,
    });
    // END: save the session
  } catch (error) {
    console.error("Error generating response:", error);
  }
}
function citationArraytoString(citationsArray) {
  let NewCitationsString = citationsArray
    .map((c) => `${c.title}; ${c.url}`)
    .join("\n");
  NewCitationsString += "\n";
  // console.log("NewCitationsString", NewCitationsString);
  return NewCitationsString;
}
function wrapWithTripleBackticksCustom({ allText, cursorPos, backticks }) {
  // console.log("cursorPos", cursorPos);
  // console.log("allText", allText);

  if (!allText) {
    // empty textarea
    const wrappedAllText = "```";
    const wrappedSelection = "```";
    return { wrappedAllText, wrappedSelection };
  }
  if (!cursorPos) {
    // textarea not empty. User has not selected any text
    const wrappedAllText = allText + "\n" + "```";
    const wrappedSelection = "```";
    return { wrappedAllText, wrappedSelection };
  }
  const { start, end } = cursorPos;
  let wrappedSelection;
  if (start === end) {
    // only caret
    // console.log("only caret");
    wrappedSelection = "```";
  } else {
    // Construct new text
    wrappedSelection = backticks
      ? "```" + allText.slice(start, end) + "```"
      : allText.slice(start, end);
  }
  const wrappedAllText =
    allText.slice(0, start) + wrappedSelection + allText.slice(end);
  return { wrappedAllText, wrappedSelection };
}
