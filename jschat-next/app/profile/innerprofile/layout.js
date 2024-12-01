function UserMessage(props) {
  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      data-placeholder="New message"
      className="min-w-fit max-w-[95vw] flex-1 m-1 bg-blue-400 p-1 dark:bg-blue-600" //border-2 border-blue-500
      onKeyDown={props.handleEnter}
      id={props.id}
      //   ref={props.refElementUser}
    >
      {props.children}
    </div>
  )
}

function BotMessage(props) {
  // console.log("botMessage rendering");
  const classExtra = props.last ? " min-w-[90vw] " : "  " // min-w-fit
  const classString =
    "flex-1 bg-yellow-400 p-1 max-w-[95vw] dark:bg-yellow-600 m-1" + classExtra
  console.log("classString", classString)
  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      className={classString} //border-yellow-500
      id={props.id}
      //   ref={props.refElementBot}
    >
      {props.children}
    </div>
  )
}

function Branch(props) {
  //   console.log("branch props.messages", props.messages);
  // let classStyle = props.level === 0 ? "flex-1 p-1" : "flex-1 py-1" //border-2 border-red-300
  let classStyle = "flex-1 " //border-2 border-red-300
  // classStyle += " flex-col "
  return (
    <div id={"branch" + props.id} className={classStyle}>
      {props.children}
    </div>
  )
}

function BranchContainer(props) {
  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row flex-nowrap justify-between overflow-auto" //border-4 border-green-300
    >
      {props.children}
    </div>
  )
}

export default function Message({ children }) {
  return (
    <BranchContainer>
      <Branch>{children}</Branch>
    </BranchContainer>
  )
}
