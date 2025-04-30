"use client";

import { getAuth } from "@/lib/actions";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

import { MultilineSkeleton } from "@/components/ui/skeleton";
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
  //   console.log("model", model);
  const textareaRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selectionText, setSelectionText] = useState();

  // console.log("selectionRectangle", selectionRectangle);
  const [canvasText, setCanvasText] = useState();
  const [cursorPos, setCursorPos] = useState();
  const [isLoadingFromLLM, setIsLoadingFromLLM] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTopupDialogOpen, setIsTopupDialogOpen] = useState(false);

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

        setCanvasText(thisSession?.content?.canvasText);
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
          <MultilineSkeleton lines={5} />
        </div>
      ) : (
        <div className="flex-col w-vw mx-16">
          {/* <RectangleDiv color="blue" {...selectionRectangle} /> */}
          {/* <RectangleDiv color="green" {...parentRectangle} /> */}
          <div
            className="flex justify-center gap-6 text-black px-2 py-2 rounded text-xs dark:text-white"
            ref={tooltipRef}
          >
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
              className="  rounded text-xs p-1 w-32 sm:w-48"
            >
              {allModelsWithoutIcon.map((m, i) => (
                <option key={i} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
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
          <textarea
            ref={textareaRef}
            value={canvasText}
            onChange={onInput}
            onClick={handleTextareaClick}
            onKeyUp={handleTextareaKeyUp}
            onBlur={handleTextareaBlur}
            // spellCheck={true}
            className={`
            w-full 
            overflow-auto
            text-wrap
            h-[calc(100vh_-_250px)]
            border border-gray-300 rounded-md p-3 
            text-base 
            focus:outline-none             
            `}
            placeholder="Type here..."
            id="textarea"
          />

          <AuthDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
          <TopupDialog
            isDialogOpen={isTopupDialogOpen}
            setIsDialogOpen={setIsTopupDialogOpen}
          />
          <div className="flex justify-center">
            <SaveItemsCanvas
              canvasId={canvasId}
              setCanvasText={setCanvasText}
              canvasText={canvasText}
              editableRef={textareaRef}
              searchParams={searchParams}
              pathname={pathname}
              router={router}
            />
          </div>
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
}) {
  let systemPrompt;
  const systemPromptNoInstruction = `You must fill in the part in triple backticks based on the context surrounding it.`;
  const systemPromptWithInstruction = `You must fill in the part in triple backticks based on the instructions given inside the triple backticks.
Use the context surrounding the triple backticks for your response.`;
  if (!cursorPos || cursorPos?.start === cursorPos?.end) {
    systemPrompt = systemPromptNoInstruction;
  } else {
    systemPrompt = systemPromptWithInstruction;
  }
  // console.log(systemPrompt);
  // return;
  // Wrap selected text in triple backticks and get new full text
  const wrappedText = wrapWithTripleBackticks(allText, cursorPos);
  // console.log("positions:", positions);
  // console.log("Original full text:", allText);
  console.log("wrappedText", wrappedText);
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
            { role: "user", content: { text: wrappedText } },
          ],
          model: model.model,
          email: authStatus,
        }),
      }
    );
    const dataJson = await data.json();
    // console.log("dataJson", dataJson);
    const responseText = dataJson.text; //.split("").reverse().join("");
    // const responseText = "YOOO";
    // Replace selected text with responseText:
    let newAllText;
    if (allText) {
      newAllText =
        allText.substring(0, cursorPos.start) +
        responseText +
        allText.substring(cursorPos.end);
      setCanvasText(newAllText);
    } else {
      newAllText = responseText;
      setCanvasText(responseText);
    }

    // save the session
    saveChatSession({
      chatId: canvasId,
      canvasText: newAllText,
    });
    // END: save the session
  } catch (error) {
    console.error("Error generating response:", error);
  }
}
function wrapWithTripleBackticks(allText, cursorPos) {
  console.log("cursorPos", cursorPos);
  if (!allText) {
    return "``````";
  }
  const { start, end } = cursorPos;
  const selectedText = allText.slice(start, end);

  // Wrap selected text with triple backticks
  const wrappedText = "```" + selectedText + "```";

  // Construct new text
  const newText = allText.slice(0, start) + wrappedText + allText.slice(end);
  return newText;
}
