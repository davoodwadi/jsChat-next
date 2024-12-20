import { generate } from "@/lib/actions";
import { readStreamableValue } from "ai/rsc";

const idInUserMessages = (id, userMessages) =>
  userMessages.filter((m) => JSON.stringify(m.key) === id).length > 0; // bool; if id is in userMessages
const idInBotMessages = (id, botMessages) =>
  botMessages.filter((m) => JSON.stringify(m.key) === id).length > 0; // // bool; if id is in botMessages

export async function handleSubmit({
  event,
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
}) {
  event.preventDefault();
  // console.log("event", event);
  // console.log("setIsDialogOpen", setIsDialogOpen);

  let chain;
  let tempChunks = "";
  const array = JSON.parse(event.target.id);
  // check if event.target.id in userMessages
  // console.log("exists", idInUserMessages(event.target.id))
  if (idInBotMessages(event.target.id, botMessages)) {
    // old user /////////////////////
    ////////////////////////////////
    console.log("old message");
    // console.log(userMessages);

    // find the latest branch on the same key length
    const sameParents = userMessages.filter(
      (m) =>
        (m.key.length === array.length) &
        (JSON.stringify(m.key.slice(0, -1)) ===
          JSON.stringify(array.slice(0, -1)))
    );
    const maxSameBranch = Math.max(
      ...sameParents.map((m) => m.key[m.key.length - 1])
    );
    // console.log("maxSameBranch", maxSameBranch);
    // console.log(array.slice(0, -1));
    // add a horizontal branch in the key array
    array[array.length - 1] = maxSameBranch + 1;

    const newArray = array.slice();
    newArray.push(1); // for new empty userMessage

    const newGlobalIdUser = globalIdUser + 1;
    setGlobalIdUser(newGlobalIdUser);
    setUserMessages((m) => [
      ...m,
      {
        key: array, // new horizontal branch key
        globalIdUser: newGlobalIdUser,
        content: `${event.target.value}`,
        role: "user",
      },
    ]);
    // get chain old message
    chain = getChain({ event, userMessages, botMessages });
    chain.push({
      key: array,
      content: event.target.value,
      role: "user",
    });
    // console.log("chain", chain);
    //

    // streaming the LLM old user
    // // //
    // const botResponse = getDummyBotResponse({ chain });
    // const streamIterator = consumeStream({ chain: chain })
    const streamIterator = await generate({
      messages: chain,
      model: model,
    });
    if (streamIterator.status !== "ok") {
      console.log("streamIterator.status not ok", streamIterator.status);
      setIsDialogOpen(true);
      return;
      // return <Toast>Failed</Toast>;
    }
    console.log("streamIterator", streamIterator);
    let counter = 0;
    tempChunks = "";
    const newGlobalIdBot = globalIdBot + 1;
    setGlobalIdBot(newGlobalIdBot);
    for await (const delta of readStreamableValue(streamIterator.output)) {
      // console.log("chunk", chunk);
      // chunks += chunk;
      setResponse({ status: streamIterator.status });
      tempChunks = delta ? tempChunks + delta : tempChunks;

      const newBotEntry = {
        key: array,
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: streamIterator.status,
        model: model,
      };
      if (counter === 0) {
        // first chunk
        setBotMessages((v) => [...v, newBotEntry]);
      } else {
        setBotMessages((v) =>
          v.map((m) =>
            JSON.stringify(m.key) === JSON.stringify(array) ? newBotEntry : m
          )
        );
      }

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
        key: newArray,
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
    chain = getChain({ event, userMessages, botMessages });
    chain.push({
      key: array,
      content: event.target.value,
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
        (msg) => JSON.stringify(msg.key) === JSON.stringify(array)
      );
      messageToUpdate.content = event.target.value;
      return userMessagesCopy;
    });

    // streaming the LLM new user
    // // //
    // const streamIterator = consumeStream({ chain: chain })
    const streamIterator = await generate({
      messages: chain,
      model: model,
    });
    if (streamIterator.status !== "ok") {
      console.log("streamIterator.status not ok", streamIterator.status);
      setIsDialogOpen(true);
      return;
    }
    // console.log("streamIterator.status ok", streamIterator.status);
    let counter = 0;
    tempChunks = "";
    const newGlobalIdBot = globalIdBot + 1;
    setGlobalIdBot(newGlobalIdBot);
    for await (const delta of readStreamableValue(streamIterator.output)) {
      // console.log("delta", delta);
      // tempChunks += chunk;
      setResponse({ status: streamIterator.status });
      tempChunks = delta ? tempChunks + delta : tempChunks;
      // console.log("delta", delta);
      // setChunks(tempChunks);
      const newBotEntry = {
        key: array,
        globalIdBot: newGlobalIdBot,
        content: tempChunks,
        role: "bot",
        status: streamIterator.status,
        model: model,
      };
      if (counter === 0) {
        // first chunk
        setBotMessages((v) => [...v, newBotEntry]);
      } else {
        setBotMessages((v) =>
          v.map((m) =>
            JSON.stringify(m.key) === JSON.stringify(array) ? newBotEntry : m
          )
        );
      }

      counter += 1;
    }
    // END: streaming the LLM
    //
    const newGlobalIdUser = globalIdUser + 1;
    setGlobalIdUser(newGlobalIdUser);
    const newUserEntry = {
      key: newArray,
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
}

function getChain({ event, userMessages, botMessages }) {
  const array = JSON.parse(event.target.id);
  const chain = [];
  for (let i = 1; i < array.length; i++) {
    // console.log("i", i);
    const parentKey = array.slice(0, i);
    const parentUser = userMessages.filter(
      (m) => JSON.stringify(m.key) === JSON.stringify(parentKey)
    )[0];
    const parentBot = botMessages.filter(
      (m) => JSON.stringify(m.key) === JSON.stringify(parentKey)
    )[0];
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
