import {
  getAuth,
  generateDummmy,
  generateTestDummmy,
  setCookies,
} from "@/lib/actions";
import { readStreamableValue } from "@/lib/aiRSCUtils";
import { wait } from "@/lib/actions";
import { v4 as uuidv4 } from "uuid";
// import { useTransition } from "react";

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
  // deepResearch,
  // search,
  ...rest
}) {
  // event.target.id
  // event.target.value
  //
  // {name: 'Perplexity Search', model: 'sonar', meta: 'sonar', new: true, vision: false,
  // deepResearch: true, search: true…}
  //
  // console.log("chatUtils userMessageModelInfo", userMessageModelInfo);
  const { model, modelConfig } = userMessageModelInfo;
  // console.log("chatUtils modelConfig", modelConfig);
  // console.log("chatUtils model", model);

  rest.setBotMessageFinished(false);

  // const dummy =
  //   process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000" ? true : false;
  const endpoint = "chat";
  const dummy = false;
  // console.log("dummy", dummy);
  let chain;
  let streamIterator;
  let tempChunks = "";
  const extraContent = {};

  const array = JSON.parse(targetId);

  const newGlobalIdBot = globalIdBot + 1;
  setGlobalIdBot(newGlobalIdBot);
  let newBotEntry;
  // check if event.target.id in userMessages
  if (idInBotMessages(targetId, botMessages)) {
    // old user /////////////////////
    ////////////////////////////////
    console.log("old message");

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
    const newArray = array.slice();
    newArray.push(1); // for new empty userMessage
    // console.log("array", array);
    const newGlobalIdUser = globalIdUser + 1;
    setGlobalIdUser(newGlobalIdUser);
    setUserMessages((m) => [
      ...m,
      {
        key: JSON.stringify(array), // new horizontal branch key
        globalIdUser: newGlobalIdUser,
        content: multimediaMessage,
        role: "user",
      },
    ]);

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

    // console.log("userMessages", userMessages);
    // console.log("chain", chain);
    // streaming the LLM old user
    //
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

    let data;
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
        }
      );
      if (!data.ok) {
        // Handle 400/500 responses from the server BEFORE the stream
        const errorData = await data.json();
        console.log("Error:", errorData.error);
        rest.toast({
          title: "Error",
          description: errorData.error,
        });
        return;
      }
    } catch (err) {
      // check if server sent error
      console.log("Fetch failed:", err);
      rest.toast({
        title: "Error",
        description: "There was a problem with your request.",
      });
      return;
    }

    // if (dummy) {
    //   streamIterator = await generateDummmy(JSON.stringify(array), model);
    // } else {
    //   streamIterator = await generate({
    //     messages: chain,
    //     model: model,
    //   });
    // }

    const reader = data.body.getReader();
    const decoder = new TextDecoder();

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
          // console.log("parsedData.text", parsedData.text);
          if (parsedData?.text) {
            tempChunks += parsedData?.text;
          }
          if (parsedData?.groundingChunks) {
            extraContent.groundingChunks = parsedData.groundingChunks;
          }
          if (parsedData?.groundingSupports) {
            extraContent.groundingSupports = parsedData.groundingSupports;
          }
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
          console.error("Failed to parse JSON:", e);
        }
      }
    }
    // END: streaming the LLM
    // // //
    // set new userMessage
    const newNewGlobalIdUser = newGlobalIdUser + 1;
    setGlobalIdUser(newNewGlobalIdUser);
    setUserMessages((v) => [
      ...v,
      {
        key: JSON.stringify(newArray),
        globalIdUser: newNewGlobalIdUser,
        content: {},
        role: "user",
      },
    ]);
  } else {
    // new user /////////////////////
    ////////////////////////////////
    console.log("new message");

    const newArray = array.slice();
    newArray.push(1);

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
      return [...v, newBotEntry];
    });
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

    // console.log("chain", chain);
    //

    setUserMessages((v) => {
      // after 'enter' press, the current userMessage is ""
      // manually set current userMessage to event.target.value
      // find the id and update the old userMessage
      const userMessagesCopy = [...v];
      const messageToUpdate = userMessagesCopy.find(
        (msg) => msg.key === JSON.stringify(array)
      );
      messageToUpdate.content = multimediaMessage;
      return userMessagesCopy;
    });

    // streaming the LLM new user
    // // //
    // if (dummy) {
    //   streamIterator = await generateDummmy(JSON.stringify(array), model);
    // } else {
    //   streamIterator = await generate({
    //     messages: chain,
    //     model: model,
    //   });
    // }
    const authStatus = await getAuth();
    console.log("authStatus", authStatus);

    if (authStatus === 400) {
      console.log("Not Authenticated", authStatus);
      setIsDialogOpen(true);
      return;
    } else if (authStatus === 401) {
      console.log("authStatus Not Enough Tokens", authStatus);
      setIsTopupDialogOpen(true);
      return;
    }
    // console.log("userMessages", userMessages);
    // console.log("chain", chain);
    // return;
    let data;
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
        }
      );
      if (!data.ok) {
        // Handle 400/500 responses from the server BEFORE the stream
        const errorData = await data.json();
        console.log("Error:", errorData.error);
        rest.toast({
          title: "Error",
          description: errorData.error,
        });
        return;
      }
    } catch (err) {
      // check if server sent error
      console.log("Fetch failed:", err);
      rest.toast({
        title: "Error",
        description: "There was a problem with your request.",
      });
      return;
    }
    // console.log("data", data);
    // return;
    const reader = data.body.getReader();
    const decoder = new TextDecoder();

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending reading", // pending | reading | done
      model: model,
      modelConfig,
    };
    setBotMessages((v) => {
      // console.log("botMessages pending", v);
      return v.map((m) => (m.key === JSON.stringify(array) ? newBotEntry : m));
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
          // console.log("jsonStr", jsonStr);

          const parsedData = JSON.parse(jsonStr);
          // console.log("parsedData", parsedData);
          if (parsedData?.text) {
            // console.log("parsedData?.text", parsedData?.text);
            tempChunks += parsedData?.text;
          }
          // console.log("tempChunks", tempChunks);
          // console.log(
          //   "Last char code",
          //   tempChunks.charCodeAt(tempChunks.length - 1)
          // );

          if (parsedData?.groundingChunks) {
            extraContent.groundingChunks = parsedData.groundingChunks;
          }
          if (parsedData?.groundingSupports) {
            extraContent.groundingSupports = parsedData.groundingSupports;
          }
          if (parsedData?.search_results) {
            extraContent.search_results = parsedData.search_results;
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
          // console.log("newBotEntry", newBotEntry);
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
    // console.log("botMessages", botMessages);

    // END: streaming the LLM
    //
    const newGlobalIdUser = globalIdUser + 1;
    setGlobalIdUser(newGlobalIdUser);
    const newUserEntry = {
      key: JSON.stringify(newArray),
      globalIdUser: newGlobalIdUser,
      content: {},
      role: "user",
    };
    setUserMessages((v) => {
      // new userMessage
      const newUserMessages = [...v, newUserEntry];
      return newUserMessages;
    });
  }

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
  // console.log("tempChunks", tempChunks);

  setBotMessages((v) => {
    const updatedBotMessages = v.map((m) =>
      m.key === JSON.stringify(array) ? newBotEntry : m
    );
    rest.setBotMessageFinished(true);
    return updatedBotMessages;
  });
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
