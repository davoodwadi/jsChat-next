import { test } from "@/lib/test";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import { Trash2, SendHorizontal, Eraser } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRef, useState, useEffect } from "react";
import { Skeleton, MultilineSkeleton } from "./ui/skeleton";

let baseUserClass =
  "  flex flex-col items-center p-4 m-1 rounded-xl bg-sky-50 dark:bg-sky-600 "; //border-2 border-blue-500 min-w-fit
const textareaClass = ` min-w-40 md:min-w-64  mx-4 p-2.5 
text-gray-900 bg-white rounded-lg border border-gray-300 
focus:ring-blue-500 focus:border-blue-500 
dark:bg-sky-700 dark:border-gray-400 dark:placeholder-gray-200 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`;
const submitButtonClass = `   p-4 md:p-2 
 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 
 dark:text-blue-100 dark:hover:bg-sky-700 `;

let baseBotClass =
  // "rounded-xl bg-yellow-600 text-black p-4 m-1 relative break-words  "; //border-yellow-500
  `     p-4 m-1 relative   
    text-gray-900 bg-yellow-50 rounded-xl border border-gray-300 focus:ring-blue-500 focus:border-blue-500 
    dark:bg-yellow-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500`;

export function UserMessage(props) {
  // console.log("props", props);
  // console.log("UserMessage botRef", props.refElementBot);

  // useTraceUpdate(props);
  const [finalValue, setFinalValue] = useState(
    props.children === "" ? "" : undefined
  );

  const refThisUser = useRef(null);
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;

  const refUser = isLatestUser ? props.refElementUser : refThisUser;
  // if (isLatestUser) {
  //   console.log("refUser scroll: ", props.id, refUser.current);
  //   refUser.current?.scrollIntoView({
  //     block: "center",
  //     inline: "center",
  //   });
  // }
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

  return (
    <>
      <div className={baseUserClass}>
        <Textarea
          placeholder="Type your message and press Enter ↵ ..."
          className={textareaClass}
          style={{ resize: "none" }}
          // onKeyDown={(event) => {
          // if (event.key === "Enter" && !event.shiftKey) {
          // if (props.children) {
          //   // set old value
          //   setFinalValue((v) => props.children);
          // }
          // event.target.blur();
          // props.handleSubmit(event);
          // }
          // }}
          value={finalValue} // props.children
          onChange={(e) => {
            setFinalValue((v) => e.target.value); // enable editing of textarea's text
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
                // Create a new keyboard event
                // const event = new KeyboardEvent("keydown", {
                //   key: "Enter",
                //   code: "Enter",
                //   charCode: 13,
                //   keyCode: 13,
                //   bubbles: true, // Allow the event to bubble up
                // });
                // console.log(props.id);
                // console.log(finalValue);
                props.handleSubmit(props.refElementBot, props.id, finalValue);
                // Dispatch the event on the input element
                // refUser.current.dispatchEvent(event);
              }
            }}
          >
            <span className="inline-flex text-sm items-center">
              <SendHorizontal className="mx-2" /> Send
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}

export function BotMessage(props) {
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;
  // console.log("isLatestBot", isLatestBot, props.refElementBot);
  // if (isLatestBot) {
  //   console.log(
  //     "props.refElementBot scroll: ",
  //     props.id,
  //     props.refElementBot.current
  //   );
  //   props.refElementBot.current?.scrollIntoView({
  //     block: "center",
  //     inline: "center",
  //   });
  // }
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
        {props.children === "" ? (
          <MultilineSkeleton lines={4} />
        ) : (
          // <MultilineSkeleton lines={4} />
          <MarkdownComponent>{props.children}</MarkdownComponent>
        )}
      </div>
    </div>
  );
}

export function Branch(props) {
  // console.log("Branch props", props);

  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  // console.log("props", props);
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
      {props.children}
    </div>
  );
}

export function BranchContainer(props) {
  // console.log("BranchContainer props", props);

  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row  " //border-4 border-green-300 overflow-scroll flex-nowrap justify-between
    >
      {props.children}
    </div>
  );
}
