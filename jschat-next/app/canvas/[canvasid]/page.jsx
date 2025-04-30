"use client";

import { getAuth } from "@/lib/actions";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  const editableRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    top: 0,
    left: 0,
    text: "",
  });
  const [canvasText, setCanvasText] = useState();
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTopupDialogOpen, setIsTopupDialogOpen] = useState(false);

  const placeholder = "Type here...";

  const handleSelection = () => {
    const selection = window.getSelection();
    if (
      selection.rangeCount > 0 &&
      //   !selection.isCollapsed && // Only show tooltip if some text is selected
      editableRef.current.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate position relative to the parent container
      const parentRect = editableRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        top: rect.top - parentRect.top + 80, // 40px above selection
        left: rect.left - parentRect.left,
        text: selection.toString(),
      });
      //   console.log(rect.top, parentRect.top);
      //   console.log("selection", selection);
    } else {
      setTooltip({ visible: false, top: 0, left: 0, text: "" });
    }
  };

  useEffect(() => {
    const text = editableRef.current?.innerText || canvasText;
    setIsEmpty(!text || text.trim() === "");
  }, [editableRef.current?.innerText, canvasText]);

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
        // console.log(
        //   "typeof editableRef.current?.innerText",
        //   typeof editableRef.current?.innerText
        // );
        if (typeof editableRef.current?.innerText === "string") {
          editableRef.current.innerText = thisSession?.content?.canvasText;
        }
      }
      setLoadingHistory(false);
      setIsLoading(false);
    };
    // console.log("editableRef.current", editableRef.current);
    loadHistory();
  }, [editableRef.current]);
  // END: load canvas history on launch

  const onInput = () => {
    const text = editableRef.current.innerText;
    setIsEmpty(!text || text.trim() === "");
    setCanvasText(text);
  };

  // console.log("isEmpty", isEmpty);
  // console.log("canvasText", canvasText);
  // useEffect(() => setIsLoading(false), []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, []);

  return (
    <>
      {loadingHistory || isLoading ? (
        <div className="mx-16 w-vw">
          <MultilineSkeleton lines={5} />
        </div>
      ) : (
        <div className="relative w-vw mx-16">
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            spellCheck={true}
            aria-label="Editable text area"
            className={`
            w-full 
            overflow-auto
            text-wrap
            h-[calc(100vh_-_112px)]
            border border-gray-300 rounded-md p-3 
            text-base 
            focus:outline-none 
            ${isEmpty ? "before:content-[attr(data-placeholder)] before:text-gray-400 before:absolute before:top-3 before:left-3 before:pointer-events-auto" : ""}
            
            `}
            data-placeholder={placeholder}
            style={{ whiteSpace: "pre-wrap" }}
            id="textarea"
          />
          {tooltip.visible && (
            <div
              className="absolute bg-gray-900 text-black  px-2 py-1 rounded text-xs select-none pointer-events-auto whitespace-nowrap dark:text-white"
              style={{
                top: tooltip.top,
                left: tooltip.left,
                transform: "translateY(-100%)",
              }}
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
                className=" rounded text-xs p-1 w-32 sm:w-48"
              >
                {allModelsWithoutIcon.map((m, i) => (
                  <option key={i} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <Button
                className=""
                onClick={() =>
                  handleGenerate({
                    text: tooltip.text,
                    model: model,
                    setIsDialogOpen,
                    setIsTopupDialogOpen,
                    canvasId,
                    allText: editableRef.current?.innerText,
                  })
                }
              >
                Generate
              </Button>
            </div>
          )}

          <AuthDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
          <TopupDialog
            isDialogOpen={isTopupDialogOpen}
            setIsDialogOpen={setIsTopupDialogOpen}
          />
          <div>
            <SaveItemsCanvas
              canvasId={canvasId}
              setCanvasText={setCanvasText}
              canvasText={canvasText}
              editableRef={editableRef}
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
  text,
  model,
  setIsDialogOpen,
  setIsTopupDialogOpen,
  canvasId,
  allText,
}) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  // console.log("text", text);
  // console.log("allText", allText);
  // return;
  const range = selection.getRangeAt(0);
  //   console.log("range", range);
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
            { role: "system", content: "" },
            { role: "user", content: { text: text } },
          ],
          model: model.model,
          email: authStatus,
        }),
      }
    );
    const dataJson = await data.json();
    // console.log("dataJson", dataJson);
    const responseText = dataJson.text; //.split("").reverse().join("");

    // Replace selected text with responseText:
    range.deleteContents();

    // Create a text node with the new content
    const textNode = document.createTextNode(responseText);

    // Insert the new text node at the current range
    range.insertNode(textNode);

    // Move the caret just after the inserted text node
    range.setStartAfter(textNode);
    range.collapse(true);

    // Remove all ranges and add this collapsed range to selection
    selection.removeAllRanges();
    selection.addRange(range);
    // save the session
    saveChatSession({
      chatId: canvasId,
      canvasText: allText,
    });
    // END: save the session
  } catch (error) {
    console.error("Error generating response:", error);
  }
}
