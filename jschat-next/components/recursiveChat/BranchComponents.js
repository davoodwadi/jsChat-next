import { test } from "@/lib/test";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import { Trash2, SendHorizontal, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState, useEffect } from "react";
import { MultilineSkeleton } from "@/components/ui/skeleton";

import { useSidebar } from "@/components/ui/sidebar";

let baseUserClass =
  "  flex flex-col items-center p-4 m-1 rounded-xl bg-sky-50 dark:bg-sky-600 "; //border-2 border-blue-500 min-w-fit
let textareaClass = ` min-w-40 md:min-w-64  mx-4 p-2.5 
text-gray-900
border-none drop-shadow-none rounded-none divide-none outline-none shadow-none
focus-visible:ring-0
 dark:placeholder-gray-200 
dark:text-white 
`;
// textareaClass += `
// rounded-lg
// focus:ring-blue-500 focus:border-blue-500
// bg-white border border-gray-300
// dark:focus:ring-blue-500 dark:focus:border-blue-500
// dark:border-gray-400
// dark:bg-sky-700
// `;
const submitButtonClass = `   p-4 md:p-2 
 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 
 dark:text-blue-100 dark:hover:bg-sky-700 `;

let baseBotClass =
  // "rounded-xl bg-yellow-600 text-black p-4 m-1 relative break-words  "; //border-yellow-500
  `     p-4 m-1 relative   
    text-gray-900 bg-yellow-50 rounded-xl  
    focus:ring-blue-500 focus:border-blue-500 
    dark:bg-yellow-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500`;

// baseBotClass += `
// border border-gray-300
// `;

export function UserMessage(props) {
  // console.log("User props", props);

  const [finalValue, setFinalValue] = useState(
    props.children === "" ? "" : undefined
  );

  const refThisUser = useRef(null);
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;

  const refUser = isLatestUser ? props.refElementUser : refThisUser;

  if (props.children && finalValue === undefined) {
    // set new value for new branch
    setFinalValue((v) => props.children);
  }
  useEffect(() => {
    // reset the textarea when the branch is deleted
    if (props.children === "") {
      setFinalValue("");
    }
  }, [props.children]);

  useEffect(() => {
    // console.log("refUser.current", refUser.current);
    if (props.userMessages.length === 1) {
      // console.log("refUser.current", refUser.current);
      // console.log("props.userMessages", props.userMessages);
      if (refUser.current) {
        refUser.current.focus();
      }
    }
  }, [refUser.current]);

  return (
    <>
      <div className={baseUserClass}>
        <Textarea
          placeholder="Type your message..."
          className={textareaClass}
          style={{ resize: "none" }}
          value={finalValue} // props.children
          onChange={(e) => {
            setFinalValue((v) => e.target.value); // enable editing of textarea's text
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey === true && e.code === "Enter") {
              // console.log(e.ctrlKey === true && e.code === "Enter");
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children);
              }
              if (refUser.current) {
                props.handleSubmit(props.refElementBot, props.id, finalValue);
              }
            }
          }}
          id={props.id}
          globaliduser={props.globalIdUser}
          maxglobaliduser={props.maxGlobalIdUser}
          ref={refUser}
        />
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFinalValue("");
              refUser.current?.focus();
            }}
          >
            <span className="inline-flex text-sm items-center">
              <Eraser className="mx-2" /> Clear
            </span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              // console.log("refUser.current", refUser.current);
              // console.log("e", e);
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children);
              }
              if (refUser.current) {
                props.handleSubmit(props.refElementBot, props.id, finalValue);
              }
            }}
          >
            <span className="inline-flex text-sm items-center">
              <SendHorizontal className="mx-2" /> <span>Send</span>&nbsp;
              <span className="text-gray-500"> Ctrl + ↵</span>
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}

export function BotMessage(props) {
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;
  // console.log("Bot props first", props);

  useEffect(() => {
    if (isLatestBot && props?.refElementBot.current) {
      // console.log("useeffect running", props.refElementBot.current);
      // console.log("useeffect running content", props.content);

      props.refElementBot.current.scrollIntoView({
        block: "center",
        inline: "center",
      });
    }
  }, [isLatestBot, props.refElementBot]); // Dependency array
  // console.log("Bot props second", props.content);

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
        data-latest={isLatestBot ? "true" : "false"}
        latest={isLatestBot ? "true" : "false"}
        ref={isLatestBot ? props.refElementBot : null}
      >
        {props.content === "" ? (
          <MultilineSkeleton lines={4}>{props.children}</MultilineSkeleton>
        ) : (
          <MarkdownComponent>{props.children}</MarkdownComponent>
        )}
      </div>
    </div>
  );
}

export function Branch(props) {
  // console.log("Branch props", props);
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  // console.log("props", props);
  // console.log("props.toMaximize", props.toMaximize);
  let baseClass = "mx-auto"; //border-2 border-red-300 flex-1
  let w;
  if (!open) {
    w = " w-[85vw] shrink-0 md:w-[85vw] ";
  } else {
    w = " w-[85vw] shrink-0 md:w-[calc(85vw-16rem)] ";
  }

  baseClass += props.toMaximize || props.maxGlobalIdBot === 0 ? w : " flex-1 "; // min-w-[85vw] max-w-[90vw]

  return (
    <div
      id={"branch" + props.id}
      className={baseClass}
      penultimate={isPenultimateBranch ? "true" : "false"}
      tomaximize={props.toMaximize ? "true" : "false"}
    >
      {props.children}
    </div>
  );
}

export function BranchContainer(props) {
  // console.log("BranchContainer props", props);

  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row " //border-4 border-green-300 overflow-scroll flex-nowrap justify-between
    >
      {props.children}
    </div>
  );
}
