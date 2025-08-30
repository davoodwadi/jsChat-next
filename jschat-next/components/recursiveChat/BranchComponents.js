import { test } from "@/lib/test";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import {
  Trash2,
  SendHorizontal,
  Eraser,
  ImagePlus,
  X,
  Microscope,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState, useEffect } from "react";
import { MultilineSkeleton } from "@/components/ui/skeleton";
import {
  ThinkingSkeleton,
  ThinkingReadingSkeleton,
} from "@/components/ThinkingSkeleton";
import { useSidebar } from "@/components/ui/sidebar";
import { TTS } from "@/components/TTS";
import { Maximize } from "lucide-react";
import {
  openaiModelsWithMeta,
  groqModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
} from "@/app/models";

// const allModels = [
//   ...openaiModelsWithMeta,
//   ...groqModelsWithMeta,
//   ...deepinfraModelsWithMeta,
//   ...anthropicModelsWithMeta,
//   ...xAIModelsWithMeta,
// ];
// const allModelsWithoutIcon = allModels.map(({ icon, ...model }) => model);
import { allModelsWithoutIcon } from "@/app/models";

let baseUserClass = "  flex flex-col items-center p-4 m-1 rounded-xl "; //border-2 border-blue-500 min-w-fit
baseUserClass += `bg-gray-100 dark:bg-gray-900 `; // bg-sky-50 dark:bg-sky-600
let textareaClass = ` min-w-40 md:min-w-64  mx-4 p-2.5 
text-gray-950
placeholder-gray-800
border-none drop-shadow-none rounded-none divide-none outline-none shadow-none
focus-visible:ring-0
dark:placeholder-gray-500 
dark:text-gray-100
`;
// textareaClass += `
// rounded-lg
// focus:ring-blue-500 focus:border-blue-500
// bg-white border border-gray-300
// dark:focus:ring-blue-500 dark:focus:border-blue-500
// dark:border-gray-400
// dark:bg-sky-700
// `;

let baseBotClass = ` p-4 m-1 relative   
    text-gray-900 rounded-xl  
    focus:ring-blue-500 focus:border-blue-500 
     dark:border-gray-600 dark:placeholder-gray-400 
     dark:text-white 
     dark:focus:ring-blue-500 dark:focus:border-blue-500 `;

export function UserMessage(props) {
  // console.log("User props", props);
  // console.log("User props.id", props.id);
  // console.log("User props.children", props.children);

  const [finalValue, setFinalValue] = useState(
    props.children?.text === "" ? "" : undefined
  );
  const [base64Image, setBase64Image] = useState(
    props.children?.image === "" ? "" : undefined
  );
  // console.log("props.botMessage", props.botMessage);
  const [userMessageModelInfo, setUserMessageModelInfo] = useState(() => {
    return {
      modelConfig: {
        search: props?.botMessage?.modelConfig?.search || false,
        deepResearch: props?.botMessage?.modelConfig?.deepResearch || false,
      },
      model: props?.botMessage?.model || props.model,
    };
  });
  // console.log("userMessageModelInfo", userMessageModelInfo);
  // console.log("props.model.name", props.model.name);

  const refThisUser = useRef(null);
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;

  const refUser = isLatestUser ? props.refElementUser : refThisUser;

  if (props.children?.text && finalValue === undefined) {
    // set new value for new branch
    setFinalValue((v) => props.children?.text);
  }
  if (props.children?.image && base64Image === undefined) {
    // set new value for new branch
    setBase64Image((v) => props.children?.image);
  }
  useEffect(() => {
    // reset the textarea when the branch is deleted
    if (props.children?.text === "") {
      setFinalValue("");
    }
    if (props.children?.image === "") {
      setBase64Image("");
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      // setImage(file);
      // setPreviewUrl(URL.createObjectURL(file));
      //   encode image to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // console.log("id", props.id);
  // console.log("userMessageModel", userMessageModel);
  // console.log("props.botModel", props.botModel);
  // console.log("props.model", props.model);
  return (
    <>
      <div className={baseUserClass}>
        {/* text area START  */}
        <Textarea
          placeholder="Type your message..."
          className={textareaClass}
          style={{ resize: "none" }}
          rows={base64Image && 4}
          value={finalValue} // props.children.text
          onChange={(e) => {
            setFinalValue((v) => e.target.value); // enable editing of textarea's text
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey === true && e.code === "Enter") {
              // console.log(e.ctrlKey === true && e.code === "Enter");
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children?.text);
                setBase64Image((v) => props.children?.image);
              }
              props.handleSubmit(
                props.refElementBot,
                props.id,
                {
                  image: base64Image,
                  text: finalValue,
                },
                userMessageModelInfo
              );
              if (props.children && props.botMessage) {
                setUserMessageModelInfo((prev) => {
                  // console.log("prev", prev);
                  // console.log("props.botMessage", props.botMessage);
                  return {
                    ...prev,
                    model: props?.botMessage?.model,
                    modelConfig: props?.botMessage?.modelConfig,
                  };
                });
              }
            }
          }}
          id={props.id}
          globaliduser={props.globalIdUser}
          maxglobaliduser={props.maxGlobalIdUser}
          ref={refUser}
        />
        {/* text area END  */}

        {/* image preview START  */}
        {base64Image && (
          <div className="relative inline-block">
            {/* Preview Image */}
            <img
              src={base64Image}
              alt="Preview"
              className="w-12 h-12 object-cover rounded shadow"
            />

            {/* Delete Icon */}
            <button
              onClick={() => {
                setBase64Image("");
              }} // Clear the preview
              className="absolute top-[0px] right-[-12px]  bg-gray-700 rounded-full text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* image preview END  */}

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {/* search START */}
          {userMessageModelInfo?.model?.hasSearch && (
            <Button
              variant={
                userMessageModelInfo.modelConfig.search ? "default" : "outline"
              }
              size="sm"
              className="my-auto "
              onClick={() => {
                setUserMessageModelInfo((prev) => {
                  return {
                    ...prev,
                    modelConfig: {
                      ...prev.modelConfig,
                      search: !prev.modelConfig.search,
                    },
                  };
                });
              }}
            >
              Search <Search />
            </Button>
          )}
          {/* search END */}

          {/* deep research START */}
          {userMessageModelInfo?.model?.hasDeepResearch && (
            <Button
              variant={
                userMessageModelInfo.modelConfig.deepResearch
                  ? "default"
                  : "outline"
              }
              size="sm"
              className="my-auto "
              onClick={() => {
                setUserMessageModelInfo((prev) => {
                  return {
                    ...prev,
                    modelConfig: {
                      ...prev.modelConfig,
                      deepResearch: !prev.modelConfig.deepResearch,
                    },
                  };
                });
              }}
            >
              Deep Research <Microscope />
            </Button>
          )}
          {/* deep research END */}

          {/* debug START */}
          {/* <div className="text-wrap break-all">
            {JSON.stringify(userMessageModelInfo)}
          </div> */}
          {/* debug END */}

          {/* model select START */}
          <select
            id="modelDropdown"
            value={userMessageModelInfo?.model?.name}
            onChange={(event) => {
              const selectedModelName = event.target.value; // Get the selected model's name
              const selectedModel = allModelsWithoutIcon.find(
                (model) => model.name === selectedModelName
              );
              setUserMessageModelInfo((v) => {
                return { ...v, model: selectedModel };
              });
              props.setModel(selectedModel);
            }}
            className=" rounded text-xs p-1 w-32 sm:w-48"
          >
            {allModelsWithoutIcon.map((m, i) => (
              <option key={i} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          {/* model select END */}

          {/* eraser START */}
          <Button
            variant="ghost"
            size="sm"
            className="my-auto"
            onClick={() => {
              setFinalValue("");
              setBase64Image("");
              refUser.current?.focus();
            }}
          >
            <span className="inline-flex text-sm items-center text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300">
              <Eraser className="mx-2" />
            </span>
          </Button>
          {/* eraser END */}

          {/* image upload START */}
          <label className=" my-auto mr-6 p-2 rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-800">
            <ImagePlus className=" w-4 h-4 " />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {/* image upload END */}

          {/* send START */}
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              // console.log("refUser.current", refUser.current);
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children?.text);
                setBase64Image((v) => props.children?.image);
              }

              // console.log("userMessageModelInfo", userMessageModelInfo);
              props.handleSubmit(
                props.refElementBot,
                props.id,
                {
                  image: base64Image,
                  text: finalValue,
                },
                userMessageModelInfo
              );
              if (props.children && props.botMessage) {
                setUserMessageModelInfo((prev) => {
                  // console.log("prev", prev);
                  // console.log("props.botMessage", props.botMessage);
                  return {
                    ...prev,
                    model: props?.botMessage?.model,
                    modelConfig: props?.botMessage?.modelConfig,
                  };
                });
              }
            }}
          >
            <span className="inline-flex text-sm items-center">
              <SendHorizontal className="mx-2" />{" "}
              <span className="hidden sm:block">Send</span>&nbsp;
              <span className="text-gray-500 hidden md:block"> Ctrl + ↵</span>
            </span>
          </Button>
          {/* send END */}
        </div>
      </div>
    </>
  );
}

export function BotMessage(props) {
  // console.log("props", props);
  // console.log("props?.botMessage?.status", props?.botMessage?.status);
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;
  const refRenderedText = useRef(null);
  // console.log("refRenderedText.current", refRenderedText.current);

  const [botClass, setBotClass] = useState(baseBotClass);
  const [textToSpeak, setTextToSpeak] = useState();
  useEffect(() => {
    if (refRenderedText.current) {
      // console.log("refRenderedText.current", refRenderedText.current);
      // console.log(
      //   "refRenderedText.current.textContent",
      //   refRenderedText.current.textContent
      // );
      setTextToSpeak(refRenderedText.current.textContent);
    }
  }, [refRenderedText.current]);
  useEffect(() => {
    if (isLatestBot && props?.refElementBot.current) {
      props.refElementBot.current.scrollIntoView({
        block: "center",
        inline: "center",
      });
    }
  }, [isLatestBot, props.refElementBot]); // Dependency array

  return (
    <div className={botClass}>
      <div className="flex flex-row justify-between text-xs mb-4">
        <p className="text-sm antialiased italic font-bold ">
          {props.model?.name}
        </p>
        <div className="flex flex-row gap-4">
          <button onClick={(e) => maximizeBotMessage(e, botClass, setBotClass)}>
            <Maximize size={16} />
          </button>
          <TTS text={textToSpeak} />
          <CopyText text={props.children} />
        </div>
      </div>
      <div
        className=" break-words  focus:outline-none focus:border-none focus:ring-0"
        id={props.id}
        globalidbot={props.globalIdBot}
        maxglobalidbot={props.maxGlobalIdBot}
        data-latest={isLatestBot ? "true" : "false"}
        latest={isLatestBot ? "true" : "false"}
        ref={isLatestBot ? props.refElementBot : null}
      >
        {props.content === "" || props?.botMessage?.status === "pending" ? (
          // <MultilineSkeleton lines={4}>{props.children}</MultilineSkeleton>
          <ThinkingSkeleton>{props.children}</ThinkingSkeleton>
        ) : props?.botMessage?.status === "reading" ? (
          <ThinkingReadingSkeleton>{props.children}</ThinkingReadingSkeleton>
        ) : (
          <MarkdownComponent
            ref={refRenderedText}
            groundingChunks={props?.groundingChunks}
            groundingSupports={props?.groundingSupports}
            botMessage={props?.botMessage}
            {...props}
          >
            {props.children}
          </MarkdownComponent>
        )}
      </div>
    </div>
  );
}
const fullscreenBotMessage =
  "fixed inset-0 z-50 bg-white flex flex-col p-8 overflow-auto";
export function maximizeBotMessage(e, botClass, setBotClass) {
  console.log("e", e);
  botClass === baseBotClass
    ? setBotClass(fullscreenBotMessage)
    : setBotClass(baseBotClass);
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
