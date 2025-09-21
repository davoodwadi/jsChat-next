import {
  getAuth,
  generateDummmy,
  generateTestDummmy,
  setCookies,
} from "@/lib/actions";
import { readStreamableValue } from "@/lib/aiRSCUtils";
import { wait } from "@/lib/actions";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// import { useTransition } from "react";

export async function handleSubmit({
  botRef,
  targetId,
  multimediaMessage,
  userMessages,
  setUserMessages,
  botMessages,
  setBotMessages,
  globalIdUser,
  setGlobalIdUser,
  globalIdBot,
  setGlobalIdBot,
  setResponse,
  userMessageModelInfo,
  setIsDialogOpen,
  setIsTopupDialogOpen,
  refChatContainer,
  systemPrompt,
  isStreaming,
  setIsStreaming,
  abortControllerRef,
  ...rest
}) {
  // check if isStreaming -> stop stream START
  if (isStreaming) {
    console.log("STOPPING the stream");
    if (abortControllerRef.current) {
      console.log("aborting stream client side BUTTON");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      return;
    }
  }
  // check if isStreaming -> stop stream END

  // console.log("chatUtils userMessageModelInfo", userMessageModelInfo);
  const { model, modelConfig } = userMessageModelInfo;

  rest.setBotMessageFinished(false);

  // const dummy =
  //   process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000" ? true : false;
  const endpoint = "chat";
  const dummy = false;
  // console.log("dummy", dummy);
  let chain;
  let streamIterator;
  let tempChunks = "";
  const extraContent = { annotations: [], queries: [], results: [] };

  const array = JSON.parse(targetId);

  const newGlobalIdBot = globalIdBot + 1;
  setGlobalIdBot(newGlobalIdBot);
  let newBotEntry;

  // Clean up any existing controller
  if (abortControllerRef.current) {
    console.log("Clean up any existing controller");
    abortControllerRef.current.abort();
  }

  // Create new controller
  abortControllerRef.current = new AbortController();
  setIsStreaming(true);

  // AUTH CHECKS START
  const authStatus = await getAuth();
  // console.log("authStatus", authStatus);
  if (authStatus === 400) {
    console.log("Not Authenticated", authStatus);
    setIsDialogOpen(true);
    return;
  } else if (authStatus === 401) {
    console.log("authStatus Not Enough Tokens", authStatus);
    setIsTopupDialogOpen(true);
    return;
  }

  let newGlobalIdUser;
  let newNewGlobalIdUser;
  let newUserMessage;
  let isNew;
  // AUTH CHECKS END

  // check OLD vs. NEW START
  // check if event.target.id in userMessages
  if (idInBotMessages(targetId, botMessages)) {
    // old user /////////////////////
    console.log("old message");
    isNew = false;
    // find the latest branch on the same key length
    const sameParents = userMessages.filter(
      (m) =>
        JSON.parse(m.key).length === array.length &&
        JSON.stringify(JSON.parse(m.key).slice(0, -1)) ===
          JSON.stringify(array.slice(0, -1))
    );
    const maxSameBranch = Math.max(
      ...sameParents.map((m) => JSON.parse(m.key)[JSON.parse(m.key).length - 1])
    );

    // add a horizontal branch in the key array
    array[array.length - 1] = maxSameBranch + 1;
    // console.log("array", array);

    // is old
    newGlobalIdUser = globalIdUser + 1;
    newNewGlobalIdUser = globalIdUser + 2;
    setGlobalIdUser(newNewGlobalIdUser);
    newUserMessage = {
      key: JSON.stringify(array), // new horizontal branch key
      globalIdUser: newGlobalIdUser,
      content: multimediaMessage,
      role: "user",
    };

    setUserMessages((m) => [...m, newUserMessage]);

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
      modelConfig,
    };
    setBotMessages((v) => [...v, newBotEntry]);

    // get chain old message
    chain = getChain({
      targetId,
      userMessages,
      botMessages,
      systemPrompt,
      model,
    });
    chain.push({
      content: multimediaMessage,
      role: "user",
    }); // key: JSON.stringify(array),

    // streaming the LLM old user
    let data;
    // try catch finally START
    try {
      data = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: chain,
            model: model,
            email: authStatus,
            modelConfig,
          }),
          signal: abortControllerRef.current.signal, // Safe reference
        }
      );
      if (!data.ok) {
        // Handle 400/500 responses from the server BEFORE the stream
        const errorData = await data.json();
        // console.log("Error:", errorData.error);
        toast("Error", {
          // title: "Error",
          description: errorData.error,
        });
        return;
      }
      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });
        const jsonLines = chunk.split("\n").filter((line) => line.trim());

        for (const jsonStr of jsonLines) {
          try {
            // console.log("chunk to parse:", jsonStr);
            const parsedData = JSON.parse(jsonStr);
            // console.log("parsedData", parsedData);
            if (parsedData?.text) {
              tempChunks += parsedData?.text;
            }
            if (parsedData?.groundingChunks) {
              extraContent.groundingChunks = parsedData.groundingChunks;
            }
            if (parsedData?.groundingSupports) {
              extraContent.groundingSupports = parsedData.groundingSupports;
            }
            if (parsedData?.search_results) {
              extraContent.search_results = parsedData.search_results;
            }
            if (parsedData?.openai_search_results) {
              extraContent.openai_search_results =
                parsedData.openai_search_results;
            }
            if (parsedData?.annotation_item) {
              extraContent.annotations.push(parsedData.annotation_item);
            }
            if (parsedData?.query) {
              extraContent.queries.push(parsedData.query);
            }
            if (parsedData?.search) {
              extraContent.results.push(parsedData.search);
            }
            // console.log(
            //   "parsedData?.openai_search_results",
            //   parsedData?.openai_search_results
            // );
            // console.log("extraContent", extraContent);
            // console.log("botMessages", botMessages);

            newBotEntry = {
              key: JSON.stringify(array),
              globalIdBot: newGlobalIdBot,
              content: tempChunks,
              role: "bot",
              status: "reading", // pending | reading | done
              model: model,
              modelConfig,
              ...extraContent,
            };
            setBotMessages((v) =>
              v.map((m) => (m.key === JSON.stringify(array) ? newBotEntry : m))
            );
          } catch (e) {
            console.log("Failed to parse JSON:", e);
          }
        }
      }
      // END: streaming the LLM
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("While loop aborted");
        toast("Stopped", {
          // title: "Stop",
          description: "Generation stopped by user",
        });
      } else {
        throw error; // Re-throw other errors
      }
    } finally {
      const newArray = array.slice();
      newArray.push(1); // for new empty userMessage
      // set new userMessage
      newUserMessage = {
        key: JSON.stringify(newArray),
        globalIdUser: newNewGlobalIdUser,
        content: {},
        role: "user",
      };
      setUserMessages((v) => [...v, newUserMessage]);

      // set status to 'done'
      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "done",
        model: model,
        modelConfig,
        ...extraContent,
      };
      setBotMessages((v) => {
        const updatedBotMessages = v.map((m) =>
          m.key === JSON.stringify(array) ? newBotEntry : m
        );
        rest.setBotMessageFinished(true);
        return updatedBotMessages;
      });
      // 2x set status to 'done'
      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "done",
        model: model,
        modelConfig,
        ...extraContent,
      };
      setBotMessages((v) => {
        const updatedBotMessages = v.map((m) =>
          m.key === JSON.stringify(array) ? newBotEntry : m
        );
        rest.setBotMessageFinished(true);
        return updatedBotMessages;
      });

      // update isStreaming to false
      setIsStreaming(false);
      abortControllerRef.current = null;
      //
    }
    // try catch finally END
  } else {
    // new user /////////////////////
    ////////////////////////////////
    console.log("new message");
    isNew = true;

    // after 'enter' press, the current userMessage is ""
    // manually set current userMessage to event.target.value
    // find the id and update the old userMessage
    // set the content on the current UserMessage
    setUserMessages((v) => {
      const userMessagesCopy = [...v];
      const messageToUpdate = userMessagesCopy.find(
        (msg) => msg.key === JSON.stringify(array)
      );
      messageToUpdate.content = multimediaMessage;
      return userMessagesCopy;
    });
    // 'pending' botMessage
    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
      modelConfig,
    };
    setBotMessages((v) => [...v, newBotEntry]);

    // get chain new message
    chain = getChain({
      targetId,
      userMessages,
      botMessages,
      systemPrompt,
      model,
    });
    chain.push({
      content: multimediaMessage,
      role: "user",
    }); // key: JSON.stringify(array),

    let data;
    // try catch finally START
    try {
      console.log("STARTING FETCH");
      data = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: chain,
            model: model,
            email: authStatus,
            modelConfig,
          }),
          signal: abortControllerRef.current.signal, // Safe reference
        }
      );
      if (!data.ok) {
        // Handle 400/500 responses from the server BEFORE the stream
        const errorData = await data.json();
        console.log("Error:", errorData.error);
        toast("Error", {
          // title: "Error",
          description: errorData.error,
        });
        return;
      }
      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      // 'pending' botMessage
      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "pending", // pending | reading | done
        model: model,
        modelConfig,
      };
      setBotMessages((v) => {
        return v.map((m) =>
          m.key === JSON.stringify(array) ? newBotEntry : m
        );
      });
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });
        // console.log("Received chunk:", chunk);
        const jsonLines = chunk.split("\n").filter((line) => line.trim());
        // console.log("Received jsonLines:", jsonLines);

        for (const jsonStr of jsonLines) {
          try {
            const parsedData = JSON.parse(jsonStr);
            // console.log("parsedData", parsedData);
            if (parsedData?.text) {
              // console.log("parsedData?.text", parsedData?.text);
              tempChunks += parsedData?.text;
            }

            if (parsedData?.groundingChunks) {
              extraContent.groundingChunks = parsedData.groundingChunks;
            }
            if (parsedData?.groundingSupports) {
              extraContent.groundingSupports = parsedData.groundingSupports;
            }
            if (parsedData?.search_results) {
              extraContent.search_results = parsedData.search_results;
            }
            if (parsedData?.openai_search_results) {
              extraContent.openai_search_results =
                parsedData.openai_search_results;
            }
            if (parsedData?.annotation_item) {
              extraContent.annotations.push(parsedData.annotation_item);
            }
            if (parsedData?.query) {
              extraContent.queries.push(parsedData.query);
            }
            if (parsedData?.search) {
              extraContent.results.push(parsedData.search);
            }
            newBotEntry = {
              key: JSON.stringify(array),
              globalIdBot: newGlobalIdBot,
              content: tempChunks,
              role: "bot",
              status: "reading",
              model: model,
              modelConfig,
              ...extraContent,
            };
            setBotMessages((v) => {
              return v.map((m) =>
                m.key === JSON.stringify(array) ? newBotEntry : m
              );
            });
          } catch (e) {
            console.error("Failed to parse JSON:", e);
          }
        }
      }
      // END: streaming the LLM
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("While loop aborted");
        toast("Stopped", {
          // title: "Stop",
          description: "Generation stopped by user",
        });
      } else {
        throw error; // Re-throw other errors
      }
    } finally {
      // add new empty UserMessage
      const newArray = array.slice();
      newArray.push(1);
      newGlobalIdUser = globalIdUser + 1;
      setGlobalIdUser(newGlobalIdUser);
      newUserMessage = {
        key: JSON.stringify(newArray),
        globalIdUser: newGlobalIdUser,
        content: {},
        role: "user",
      };
      // new userMessage
      setUserMessages((v) => [...v, newUserMessage]);
      // set status to 'done'
      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "done",
        model: model,
        modelConfig,
        ...extraContent,
      };
      setBotMessages((v) => {
        const updatedBotMessages = v.map((m) =>
          m.key === JSON.stringify(array) ? newBotEntry : m
        );
        rest.setBotMessageFinished(true);
        return updatedBotMessages;
      });
      // 2x set status to 'done'
      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "done",
        model: model,
        modelConfig,
        ...extraContent,
      };
      setBotMessages((v) => {
        const updatedBotMessages = v.map((m) =>
          m.key === JSON.stringify(array) ? newBotEntry : m
        );
        rest.setBotMessageFinished(true);
        return updatedBotMessages;
      });

      // update isStreaming to false
      setIsStreaming(false);
      abortControllerRef.current = null;
      //
    }
    // try catch finally END
  }
}

function getChain({
  targetId,
  userMessages,
  botMessages,
  systemPrompt,
  model,
}) {
  // event.target.id
  const array = JSON.parse(targetId);
  const chain = [];
  if (systemPrompt !== "") {
    chain.push({
      content: systemPrompt,
      role:
        model.model.includes("gpt") ||
        model.model.includes("o1") ||
        model.model.includes("o3")
          ? "developer"
          : "system",
    });
  }

  for (let i = 1; i < array.length; i++) {
    // console.log("i", i);
    const parentArray = array.slice(0, i);
    const parentKey = JSON.stringify(parentArray);
    const parentUser = userMessages.filter((m) => m.key === parentKey)[0];
    const parentBot = botMessages.filter((m) => m.key === parentKey)[0];
    chain.push({ content: parentUser.content, role: "user" }); // key: parentKey,
    chain.push({
      content: parentBot.content,
      role: "assistant",
    }); // key: parentKey,
  }
  // console.log("chain messages", chain);

  return chain;
}
//

export function resizeTextarea(event) {
  // Reset field height
  event.target.style.height = "inherit";
  // Get the computed styles for the element
  const computed = window.getComputedStyle(event.target);
  // Calculate the height
  const height =
    parseInt(computed.getPropertyValue("border-top-width"), 10) +
    parseInt(computed.getPropertyValue("padding-top"), 10) +
    event.target.scrollHeight +
    parseInt(computed.getPropertyValue("padding-bottom"), 10) +
    parseInt(computed.getPropertyValue("border-bottom-width"), 10);
  // + 50; // 10 is random height to give room
  // console.log("height", height);

  event.target.style.height = `${height}px`;
}

const idInUserMessages = (id, userMessages) =>
  userMessages.filter((m) => m.key === id).length > 0; // bool; if id is in userMessages
const idInBotMessages = (id, botMessages) =>
  botMessages.filter((m) => m.key === id).length > 0; // // bool; if id is in botMessages

export const generateChatId = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${randomString}-${timestamp}`;
};
export const generateCanvasId = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `canvas-${randomString}-${timestamp}`;
};
export async function handleTestDummy(setText) {
  const streamIterator = await generateTestDummmy();
  console.log("streamIterator.output is a promise");

  for await (const delta of readStreamableValue(streamIterator.output)) {
    console.log("delta", delta);
    setText((t) => t + " " + delta);
  }
  console.log("done");
}

export async function handleDummy({ setText }) {
  const streamIterator = await generateDummmy();
  for await (const delta of readStreamableValue(streamIterator.output)) {
    console.log("delta", delta);
    setText((v) => v + delta);
  }
}
