import { test } from "@/lib/test";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";

export function UserMessage(props) {
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;
  const isFirstUser = props.maxGlobalIdUser === 1;
  if (test) {
    // console.log("isFirstUser", isFirstUser, props.maxGlobalIdUser);
  }
  const isPreviousUser = props.maxGlobalIdUser === props.globalIdUser + 1;
  let baseClass = " rounded-xl bg-blue-400 p-4 m-1 relative break-words  "; //border-2 border-blue-500 min-w-fit

  return (
    <>
      <div
        contentEditable="true"
        suppressContentEditableWarning
        data-placeholder="Type your message and press Enter ↵ ..."
        className={baseClass}
        onKeyDown={props.handleEnter}
        id={props.id}
        globaliduser={props.globalIdUser}
        maxglobaliduser={props.maxGlobalIdUser}
        ref={isLatestUser ? props.refElementUser : null}
      >
        {props.children}
      </div>
    </>
  );
}

export function BotMessage(props) {
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;
  let baseClass =
    "rounded-xl bg-yellow-400 text-black p-4 m-1 relative break-words  "; //border-yellow-500

  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      className={baseClass}
      id={props.id}
      globalidbot={props.globalIdBot}
      maxglobalidbot={props.maxGlobalIdBot}
      latest={isLatestBot ? "true" : "false"}
      ref={isLatestBot ? props.refElementBot : null}
    >
      <div className="flex flex-row justify-between text-xs mb-4">
        <p>{props.model}</p>
        <CopyText text={props.children} />
      </div>

      <MarkdownComponent>{props.children}</MarkdownComponent>
    </div>
  );
}

export function Branch(props) {
  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  let baseClass = "mx-auto"; //border-2 border-red-300 flex-1
  let w = props.isMobile
    ? " w-[85vw] shrink-0 "
    : ` w-[calc(85vw-16rem)] shrink-0 `;
  baseClass += props.toMaximize ? w : " flex-1 "; // min-w-[85vw] max-w-[90vw]

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
  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row  " //border-4 border-green-300 overflow-scroll flex-nowrap justify-between
    >
      {props.children}
    </div>
  );
}
