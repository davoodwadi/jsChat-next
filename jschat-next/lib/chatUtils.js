import {
  getAuth,
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
  // console.log("model", model);
  // const dummy =
  //   process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000" ? true : false;
  const dummy = false;
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
    const authStatus = await getAuth()
    console.log('authStatus', authStatus)

    if (authStatus === 400) {
      console.log(
        "Not Authenticated",
        authStatus
      );
      setIsDialogOpen(true);
      return;
    } else if (authStatus===401){
      console.log(
        "authStatus Not Enough Tokens",
        authStatus
      );
      setIsTopupDialogOpen(true);
      return
    }
    const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: chain, model: model, email:authStatus })
    });
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
  tempChunks = "";

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
    };
    setBotMessages((v) => [...v, newBotEntry]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      // console.log('Received chunk:', chunk);

        tempChunks = chunk ? tempChunks + chunk : tempChunks;


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
    // if (dummy) {
    //   streamIterator = await generateDummmy(JSON.stringify(array), model);
    // } else {
    //   streamIterator = await generate({
    //     messages: chain,
    //     model: model,
    //   });
    // }
    const authStatus = await getAuth()
    console.log('authStatus', authStatus)

    if (authStatus === 400) {
      console.log(
        "Not Authenticated",
        authStatus
      );
      setIsDialogOpen(true);
      return;
    } else if (authStatus===401){
      console.log(
        "authStatus Not Enough Tokens",
        authStatus
      );
      setIsTopupDialogOpen(true);
      return
    }
    const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: chain, model: model, email:authStatus })
    });
    // console.log('data', data)
    const reader = data.body.getReader();
    const decoder = new TextDecoder();
    tempChunks = "";

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
    };

    setBotMessages((v) => {
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    let chunk = decoder.decode(value, { stream: true });
    // chunk = `{${chunk.replace('\n', ',')}}`
    // console.log('Received chunk:', chunk);

    tempChunks = chunk ? tempChunks + chunk : tempChunks;

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
