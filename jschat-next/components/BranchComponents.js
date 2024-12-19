import { test } from "@/lib/test";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import { Trash2, SendHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRef, useState } from "react";

let baseUserClass =
  "  flex items-center justify-between  p-4 m-1 rounded-lg bg-sky-50 dark:bg-sky-600"; //border-2 border-blue-500 min-w-fit
const textareaClass = ` min-w-56 md:min-w-64 text-sm mx-4 p-2.5 
text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 
dark:bg-sky-900 dark:border-gray-400 dark:placeholder-gray-200 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`;
const submitButtonClass = ` inline-flex justify-center p-2 
 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 
 dark:text-blue-100 dark:hover:bg-gray-600 `;

let baseBotClass =
  // "rounded-xl bg-yellow-600 text-black p-4 m-1 relative break-words  "; //border-yellow-500
  `     p-4 m-1 relative  text-sm  
    text-gray-900 bg-yellow-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 
    dark:bg-yellow-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500`;

export function UserMessage(props) {
  const [finalValue, setFinalValue] = useState();

  const refThisUser = useRef(null);
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;
  const isFirstUser = props.maxGlobalIdUser === 1;
  if (test) {
    // console.log("isFirstUser", isFirstUser, props.maxGlobalIdUser);
  }
  const isPreviousUser = props.maxGlobalIdUser === props.globalIdUser + 1;
  const refUser = isLatestUser ? props.refElementUser : refThisUser;
  // let baseClass = " rounded-xl bg-blue-400  relative flex justify-between"; //border-2 border-blue-500 min-w-fit
  if (props.children && finalValue === undefined) {
    // set new value for new branch
    setFinalValue((v) => props.children);
  }
  return (
    <>
      <div className={baseUserClass}>
        {/* <div
          contentEditable="true"
          suppressContentEditableWarning
          data-placeholder="Type your message and press Enter ↵ ..."
          // className={baseClass}
          className=" p-4 m-1 flex-initial text-pretty break-all"
          onKeyDown={props.handleEnter}
          id={props.id}
          globaliduser={props.globalIdUser}
          maxglobaliduser={props.maxGlobalIdUser}
          ref={isLatestUser ? props.refElementUser : null}
        >
          {props.children}
        </div> */}
        <Textarea
          placeholder="Type your message and press Enter ↵ ..."
          className={textareaClass}
          style={{ resize: "none" }}
          // rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children);
              }
              event.target.blur();
              props.handleSubmit(event);
            }
          }}
          value={finalValue} // props.children
          onChange={(e) => {
            setFinalValue((v) => e.target.value); // enable editing of textarea's text
          }}
          id={props.id}
          globaliduser={props.globalIdUser}
          maxglobaliduser={props.maxGlobalIdUser}
          ref={refUser}
        />
        <button
          className={submitButtonClass}
          onClick={(e) => {
            // console.log("refUser.current", refUser.current);
            // console.log("e", e);
            if (refUser.current) {
              // Create a new keyboard event
              const event = new KeyboardEvent("keydown", {
                key: "Enter",
                code: "Enter",
                charCode: 13,
                keyCode: 13,
                bubbles: true, // Allow the event to bubble up
              });

              // Dispatch the event on the input element
              refUser.current.dispatchEvent(event);
            }
          }}
        >
          <SendHorizontal />
        </button>
      </div>
    </>
  );
}

export function BotMessage(props) {
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;

  return (
    <div className={baseBotClass}>
      <div className="flex flex-row justify-between text-xs mb-4">
        <p>{props.model}</p>
        <CopyText text={props.children} />
      </div>
      <div
        contentEditable="true"
        suppressContentEditableWarning
        className=" break-words "
        id={props.id}
        globalidbot={props.globalIdBot}
        maxglobalidbot={props.maxGlobalIdBot}
        latest={isLatestBot ? "true" : "false"}
        ref={isLatestBot ? props.refElementBot : null}
      >
        <MarkdownComponent>{props.children}</MarkdownComponent>
      </div>
    </div>
  );
}

export function Branch(props) {
  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  // console.log("props.maxGlobalIdBot", props.maxGlobalIdBot);
  // console.log("props.toMaximize", props.toMaximize);
  let baseClass = "mx-auto"; //border-2 border-red-300 flex-1
  let w = " w-[85vw] shrink-0 md:w-[calc(85vw-16rem)] ";
  baseClass += props.toMaximize || props.maxGlobalIdBot === 0 ? w : " flex-1 "; // min-w-[85vw] max-w-[90vw]

  return (
    <div
      id={"branch" + props.id}
      className={baseClass}
      penultimate={isPenultimateBranch ? "true" : "false"}
      tomaximize={props.toMaximize ? "true" : "false"}
    >
      <Button variant="ghost" size="sm" className="mx-auto flex mb-1">
        <Trash2 className="" />
      </Button>
      {props.children}
    </div>
  );
}

export function BranchContainer(props) {
  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row  " //border-4 border-green-300 overflow-scroll flex-nowrap justify-between
    >
      {props.children}
    </div>
  );
}
