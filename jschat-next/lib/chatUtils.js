import {
  generate,
  generateDummmy,
  generateTestDummmy,
  setCookies,
} from "@/lib/actions";
import { readStreamableValue } from "@/lib/aiRSCUtils";
import { wait } from "@/lib/actions";
import { v4 as uuidv4 } from "uuid";

const idInUserMessages = (id, userMessages) =>
  userMessages.filter((m) => m.key === id).length > 0; // bool; if id is in userMessages
const idInBotMessages = (id, botMessages) =>
  botMessages.filter((m) => m.key === id).length > 0; // // bool; if id is in botMessages

export const generateChatId = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${randomString}-${timestamp}`;
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
  targetValue,
  userMessages,
  setUserMessages,
  botMessages,
  setBotMessages,
  globalIdUser,
  setGlobalIdUser,
  globalIdBot,
  setGlobalIdBot,
  setResponse,
  model,
  setIsDialogOpen,
  setIsTopupDialogOpen,
  refChatContainer,
  setRandomNumber,
}) {
  // event.target.id
  // event.target.value
  //
  // console.log("userMessages", userMessages);
  const dummy =
    process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000" ? true : false;
  // const dummy = false;
  console.log("dummy", dummy);
  let chain;
  let streamIterator;
  let tempChunks = "";

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
        content: `${targetValue}`,
        role: "user",
      },
    ]);
    // get chain old message
    chain = getChain({ targetId, userMessages, botMessages });
    chain.push({
      key: JSON.stringify(array),
      content: targetValue,
      role: "user",
    });

    // streaming the LLM old user
    //

    if (dummy) {
      streamIterator = await generateDummmy(JSON.stringify(array));
    } else {
      streamIterator = await generate({
        messages: chain,
        model: model,
      });
    }
    if (streamIterator.status !== "ok") {
      console.log("streamIterator.status not ok", streamIterator.status);
      setIsDialogOpen(true);
      return;
      // return <Toast>Failed</Toast>;
    }
    let counter = 0;
    tempChunks = "";
    // console.log("client wait start");

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
    };
    setBotMessages((v) => [...v, newBotEntry]);

    for await (const delta of readStreamableValue(streamIterator.output)) {
      tempChunks = delta ? tempChunks + delta : tempChunks;

      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "reading", // pending | reading | done
        model: model,
      };
      setBotMessages((v) =>
        v.map((m) => (m.key === JSON.stringify(array) ? newBotEntry : m))
      );

      counter += 1;
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
        content: "",
        role: "user",
      },
    ]);
  } else {
    // new user /////////////////////
    ////////////////////////////////
    console.log("new message");

    const newArray = array.slice();
    newArray.push(1);

    // get chain new message
    chain = getChain({ targetId, userMessages, botMessages });
    chain.push({
      key: JSON.stringify(array),
      content: targetValue,
      role: "user",
    });
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
      messageToUpdate.content = targetValue;
      return userMessagesCopy;
    });

    // streaming the LLM new user
    // // //
    if (dummy) {
      streamIterator = await generateDummmy(JSON.stringify(array));
    } else {
      streamIterator = await generate({
        messages: chain,
        model: model,
      });
    }
    if (streamIterator.status === "Not Authenticated") {
      console.log(
        "streamIterator.status Not Authenticated",
        streamIterator.status
      );
      setIsDialogOpen(true);
      return;
    } else if (streamIterator.status === "Not Enough Tokens") {
      console.log(
        "streamIterator.status Not Enough Tokens",
        streamIterator.status
      );
      setIsTopupDialogOpen(true);
      return;
    }

    let counter = 0;
    tempChunks = "";

    // console.log("client wait start");
    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
    };
    setBotMessages((v) => {
      // console.log("botMessages pending", v);
      return [...v, newBotEntry];
    });
    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending reading", // pending | reading | done
      model: model,
    };
    setBotMessages((v) => {
      // console.log("botMessages pending", v);
      return v.map((m) => (m.key === JSON.stringify(array) ? newBotEntry : m));
    });

    // await wait(4000);

    for await (const delta of readStreamableValue(streamIterator.output)) {
      // console.log("botMessage: ", newBotEntry, array);
      // console.log("delta", delta);
      // setResponse({ status: streamIterator.status });
      tempChunks = delta ? tempChunks + delta : tempChunks;
      // console.log("delta", delta);

      newBotEntry = {
        key: JSON.stringify(array),
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: "reading",
        model: model,
      };
      setBotMessages((v) => {
        // console.log("botMessages counter:", counter, delta, v);

        return v.map((m) =>
          m.key === JSON.stringify(array) ? newBotEntry : m
        );
      });

      counter += 1;
    }
    // END: streaming the LLM
    //
    const newGlobalIdUser = globalIdUser + 1;
    setGlobalIdUser(newGlobalIdUser);
    const newUserEntry = {
      key: JSON.stringify(newArray),
      globalIdUser: newGlobalIdUser,
      content: "",
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
  };
  setBotMessages((v) =>
    v.map((m) => (m.key === JSON.stringify(array) ? newBotEntry : m))
  );
  // console.log("done newBotEntry:", newBotEntry);
}

function getChain({ targetId, userMessages, botMessages }) {
  // event.target.id
  const array = JSON.parse(targetId);
  const chain = [];
  for (let i = 1; i < array.length; i++) {
    // console.log("i", i);
    const parentArray = array.slice(0, i);
    const parentKey = JSON.stringify(parentArray);
    const parentUser = userMessages.filter((m) => m.key === parentKey)[0];
    const parentBot = botMessages.filter((m) => m.key === parentKey)[0];
    chain.push({ key: parentKey, content: parentUser.content, role: "user" });
    chain.push({
      key: parentKey,
      content: parentBot.content,
      role: "assistant",
    });
  }
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
//
