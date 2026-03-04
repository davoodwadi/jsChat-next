"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  SendHorizontal,
  Eraser,
  ImagePlus,
  Square,
  X,
  Microscope,
  Search,
  Brain,
  Bug,
} from "lucide-react";
import { HatGlasses, GraduationCap, ChevronsLeftRight } from "lucide-react";
import { ModelSelector, CompactModelSelector } from "./ModelSelector";
import { test } from "@/lib/test";
import { getStoredErrors, clearStoredErrors } from "@/lib/errorLogger";

// Disable SSR for the ImageUploader component
const ImageUploader = dynamic(() => import("./ImageUploader"), {
  ssr: false,
  loading: () => <Skeleton />,
});
import {
  openaiModelsWithMeta,
  groqModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
} from "@/app/models";
import { allModelsWithoutIcon } from "@/app/models";
import { Skeleton } from "../ui/skeleton";

export default function UserMessage({
  isStreaming,
  setIsStreaming,
  abortControllerRef,
  ...props
}) {
  // console.log("UserMessage props", props);
  //   console.log("User props.id", props.id);
  // console.log("User props.children", props.children);
  let baseUserClass = "  flex flex-col items-center p-4 m-1 rounded-xl "; //border-2 border-blue-500 min-w-fit
  baseUserClass += `bg-gray-100 dark:bg-zinc-900 `; // bg-sky-50 dark:bg-sky-600
  const maxTextareHeight = 300;
  const textareaClass = `min-w-40 md:min-w-64 mx-4 p-2.5 
text-gray-950
placeholder-gray-800
border-none drop-shadow-none rounded-none divide-none outline-none shadow-none
focus-visible:ring-0
dark:placeholder-gray-500 
dark:text-gray-100
min-h-[2.5rem] overflow-y-auto
`;

  const [finalValue, setFinalValue] = useState(
    props.children?.text === "" ? "" : undefined
  );
  const [base64Image, setBase64Image] = useState(
    props.children?.image === "" ? "" : undefined
  );
  // console.log("props.globalModelInfo", props.globalModelInfo);
  const [userMessageModelInfo, setUserMessageModelInfo] = useState(() => {
    return {
      modelConfig: {
        reasoning:
          props?.botMessage?.modelConfig?.reasoning ||
          props.globalModelInfo.modelConfig.reasoning,
        search:
          props?.botMessage?.modelConfig?.search ||
          props.globalModelInfo.modelConfig.search,
        deepResearch:
          props?.botMessage?.modelConfig?.deepResearch ||
          props.globalModelInfo.modelConfig.deepResearch,
        agentic:
          props?.botMessage?.modelConfig?.agentic ||
          props.globalModelInfo.modelConfig.agentic,
        academic:
          props?.botMessage?.modelConfig?.academic ||
          props.globalModelInfo.modelConfig.academic,
      },
      model: props?.botMessage?.model || props.globalModelInfo.model,
    };
  });
  // console.log("userMessageModelInfo", userMessageModelInfo);
  const refThisUser = useRef(null);
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;

  const refUser = isLatestUser ? props.refElementUser : refThisUser;

  // Debug error viewer state
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);

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

  // focus to Textarea on mount START
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
  // focus to Textarea on mount END

  // Create a reusable resize function
  const resizeTextarea = useCallback(
    (textarea) => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height =
          Math.min(textarea.scrollHeight, maxTextareHeight) + "px";
      }
    },
    [maxTextareHeight]
  );
  // useLayoutEffect runs synchronously after all DOM mutations
  useLayoutEffect(() => {
    resizeTextarea(refUser.current);
  }, [finalValue, resizeTextarea]);
  // console.log("userMessageModelInfo", userMessageModelInfo);
  // console.log("userMessage userMessageModelInfo", userMessageModelInfo);

  return (
    <>
      <div className={baseUserClass}>
        {/* text area START  */}
        <Textarea
          placeholder="Type your message..."
          className={textareaClass}
          // style={{ resize: "none" }}
          style={{
            resize: "none",
            maxHeight: `${maxTextareHeight}px`, // Set max height in style instead
          }}
          // rows={base64Image && 4}
          value={finalValue} // props.children.text
          onChange={(e) => {
            setFinalValue((v) => e.target.value);
            resizeTextarea(e.target); // Reuse the same function
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey === true && e.code === "Enter") {
              // console.log(e.ctrlKey === true && e.code === "Enter");
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children?.text);
                setBase64Image((v) => props.children?.image);
              }
              // setGlobalModelInfo to the selected model and config
              props.setGlobalModelInfo(userMessageModelInfo);
              //
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
          {/* reasoning START */}
          {userMessageModelInfo?.model?.hasReasoning && (
            <Button
              size="sm"
              aria-label="Reasoning"
              className={
                userMessageModelInfo.modelConfig.reasoning
                  ? "glass-button-dark !rounded-full w-8 h-8 p-0 "
                  : "glass-button !rounded-full w-8 h-8 p-0 "
              }
              onClick={() => {
                setUserMessageModelInfo((prev) => {
                  return {
                    ...prev,
                    modelConfig: {
                      ...prev.modelConfig,
                      reasoning: !prev.modelConfig.reasoning,
                    },
                  };
                });
              }}
            >
              <Brain />
            </Button>
          )}
          {/* reasoning END */}

          {/* search START */}
          {userMessageModelInfo?.model?.hasSearch && (
            <Button
              size="sm"
              className={
                userMessageModelInfo.modelConfig.search
                  ? "glass-button-dark !rounded-full w-8 h-8 p-0 "
                  : "glass-button !rounded-full w-8 h-8 p-0 "
              }
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
              <Search />
            </Button>
          )}
          {/* search END */}

          {/* agentic START */}
          {userMessageModelInfo?.model?.hasAgentic && (
            <Button
              size="sm"
              className={
                userMessageModelInfo.modelConfig.agentic
                  ? "glass-button-dark !rounded-full w-8 h-8 p-0 "
                  : "glass-button !rounded-full w-8 h-8 p-0 "
              }
              onClick={() => {
                setUserMessageModelInfo((prev) => {
                  return {
                    ...prev,
                    modelConfig: {
                      ...prev.modelConfig,
                      agentic: !prev.modelConfig.agentic,
                    },
                  };
                });
              }}
            >
              <HatGlasses />
            </Button>
          )}
          {/* agentic END */}

          {/* academic START */}
          {userMessageModelInfo?.model?.hasAcademic && (
            <Button
              size="sm"
              className={
                userMessageModelInfo.modelConfig.academic
                  ? "glass-button-dark !rounded-full w-8 h-8 p-0 "
                  : "glass-button !rounded-full w-8 h-8 p-0 "
              }
              onClick={() => {
                setUserMessageModelInfo((prev) => {
                  return {
                    ...prev,
                    modelConfig: {
                      ...prev.modelConfig,
                      academic: !prev.modelConfig.academic,
                    },
                  };
                });
              }}
            >
              <GraduationCap />
            </Button>
          )}
          {/* academic END */}

          {/* deep research START */}
          {userMessageModelInfo?.model?.hasDeepResearch && (
            <Button
              size="sm"
              className={
                userMessageModelInfo.modelConfig.deepResearch
                  ? "glass-button-dark !rounded-full w-8 h-8 p-0 "
                  : "glass-button !rounded-full w-8 h-8 p-0 "
              }
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
              <Microscope />
            </Button>
          )}
          {/* deep research END */}

          {/* debug START */}
          {/* <div className="text-wrap break-all">
            {JSON.stringify(userMessageModelInfo)}
          </div> */}
          {/* debug END */}

          {/* model select START */}
          <CompactModelSelector
            selectedModel={userMessageModelInfo?.model}
            onModelChange={(selectedModel) => {
              setUserMessageModelInfo((v) => ({
                ...v,
                model: selectedModel,
              }));
              // props.setModel(selectedModel);
            }}
          />
          {/* model select END */}

          {/* eraser START */}
          <Button
            variant="ghost"
            size="sm"
            className="glass-button !rounded-full w-8 h-8 p-0"
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
          <ImageUploader
            base64Image={base64Image}
            setBase64Image={setBase64Image}
          />
          {/* image upload END */}

          {/* send START */}
          <Button
            className="glass-button-dark !rounded-full w-8 h-8 p-0"
            variant="default"
            size="sm"
            onClick={(e) => {
              // console.log("refUser.current", refUser.current);
              if (props.children) {
                // set old value
                setFinalValue((v) => props.children?.text);
                setBase64Image((v) => props.children?.image);
              }
              // setGlobalModelInfo to the selected model and config
              props.setGlobalModelInfo(userMessageModelInfo);
              //
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
            {isStreaming ? (
              <Square className="mx-2  w-4 h-4" />
            ) : (
              <SendHorizontal className="mx-2 w-4 h-4" />
            )}
          </Button>
          {/* send END */}

          {/* stop START */}
          {/* <Button onClick={stopStream}>STOP</Button> */}
          {/* stop END */}

          {/* Debug error viewer (development only) START */}
          {process.env.NODE_ENV === "development" && isLatestUser && (
            <Button
              variant="ghost"
              size="sm"
              className="glass-button !rounded-full w-8 h-8 p-0"
              onClick={() => {
                const errors = getStoredErrors();
                setErrorLogs(errors);
                setShowErrorLogs(!showErrorLogs);
              }}
              title="View Error Logs"
            >
              <span className="inline-flex text-sm items-center text-red-600 hover:text-red-400">
                <Bug className="w-4 h-4" />
              </span>
            </Button>
          )}
          {/* Debug error viewer END */}
        </div>

        {/* Error logs panel START */}
        {showErrorLogs && (
          <div className="mt-4 w-full max-w-4xl p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                Error Logs ({errorLogs.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearStoredErrors();
                    setErrorLogs([]);
                  }}
                  className="text-xs"
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowErrorLogs(false)}
                  className="text-xs"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {errorLogs.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No errors logged yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {errorLogs.map((log, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-zinc-800 rounded border border-red-200 dark:border-red-700"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-red-600 dark:text-red-400">
                        {log.context}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                      {log.error.message}
                    </p>
                    {log.deviceInfo?.isBrave && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded">
                        Brave Browser
                      </span>
                    )}
                    {log.deviceInfo?.userAgent?.includes("iPhone") && (
                      <span className="inline-block ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                        iOS
                      </span>
                    )}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                        Technical Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Error logs panel END */}
      </div>
    </>
  );
}
