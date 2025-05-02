"use client";

import { getAuth } from "@/lib/actions";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search } from "lucide-react";

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
  const [webSearchOn, setWebSearchOn] = useState(false);
  const [references, setReferences] = useState("References\n");
  // console.log("webSearchOn", webSearchOn);
  const [llmInstructions, setLLMInstructions] = useState("");
  // console.log("llmInstructions", llmInstructions);
  const textareaRef = useRef(null);
  const tooltipRef = useRef(null);

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
            className="flex justify-center justify-items-center-safe pb-2 gap-6 text-black rounded text-xs dark:text-white"
            ref={tooltipRef}
          >
            <Textarea
              value={llmInstructions}
              onChange={(e) => setLLMInstructions(e.target.value)}
              style={{ resize: "none", fontSize: "16px" }}
              placeholder="Instructions to modify the selected text..."
            />
            <div className="flex flex-col justify-center gap-2">
              <div className="flex flex-row gap-2 items-center justify-center">
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
          </div>
          <Textarea
            ref={textareaRef}
            value={canvasText}
            onChange={onInput}
            onClick={handleTextareaClick}
            onKeyUp={handleTextareaKeyUp}
            onBlur={handleTextareaBlur}
            spellCheck={true}
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
            style={{ fontSize: "16px" }}
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
          <div className="flex justify-center pb-6">
            <SaveItemsCanvas
              canvasId={canvasId}
              setCanvasText={setCanvasText}
              canvasText={canvasText}
              references={references}
              setReferences={setReferences}
              editableRef={textareaRef}
              searchParams={searchParams}
              pathname={pathname}
              router={router}
            />
          </div>
          <Textarea
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            // spellCheck={true}
            className={`
            w-full 
            overflow-auto
            text-wrap
            border border-gray-300 rounded-md p-3 
            text-base 
            focus:outline-none             
            `}
            placeholder="Citations will populate here..."
            style={{ fontSize: "8px" }}
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
}) {
  const { wrappedAllText, wrappedSelection } = wrapWithTripleBackticksCustom({
    allText,
    cursorPos,
    backticks: true,
  });
  let systemPrompt;
  const systemprompt1a = `You role is to create the information necessary to replace the text below (in triple backticks):
${wrappedSelection}
You should output only the text that properly replaces the text in triple backticks.
`;
  const systemprompt1b = `You role is to create the information necessary to replace the triple backticks
You should output only the text that properly replaces the triple backticks.
`;
  systemPrompt =
    !cursorPos || cursorPos?.start === cursorPos?.end
      ? systemprompt1b
      : systemprompt1a;

  const systemprompt4 = `You have to keep this instruction in mind when replacing the text in triple backticks: ${llmInstructions}
`;
  systemPrompt += llmInstructions ? systemprompt4 : "";
  const systemprompt5 = `You have to ensure the information you create is consistent with the surrounding context.
The user will provide the full context for the text in triple backticks.`;
  systemPrompt += systemprompt5;
  systemPrompt +=
    model.model === "o4-mini" && webSearchOn
      ? "When you use the search results, make sure you provide inline citations to back your argument up and provide the APA style references section at the end of your response."
      : "";
  // console.log("systemPrompt", systemPrompt);
  // console.log("wrappedAllText", wrappedAllText);
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
            { role: "user", content: { text: wrappedAllText } },
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
    const wrappedAllText = "``````";
    const wrappedSelection = "``````";
    return { wrappedAllText, wrappedSelection };
  }
  if (!cursorPos) {
    // textarea not empty. User has not selected any text
    const wrappedAllText = allText + "\n" + "``````";
    const wrappedSelection = "``````";
    return { wrappedAllText, wrappedSelection };
  }
  const { start, end } = cursorPos;
  let wrappedSelection;
  if (start === end) {
    // only caret
    wrappedSelection = "```" + allText.slice(start, end) + "```";
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
