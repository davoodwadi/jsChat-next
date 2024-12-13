"use client";

export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { generate } from "@/lib/actions";
import { readStreamableValue } from "ai/rsc";

import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { signInClientAction } from "@/lib/actions";
import { test } from "@/lib/test";

export function UserMessage(props) {
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser;
  const isFirstUser = props.maxGlobalIdUser === 1;
  if (test) {
    // console.log("isFirstUser", isFirstUser, props.maxGlobalIdUser);
  }
  const isPreviousUser = props.maxGlobalIdUser === props.globalIdUser + 1;
  let baseClass = " rounded-xl bg-blue-400 p-4 m-1 relative break-words "; //border-2 border-blue-500 min-w-fit
  // baseClass += props.toMaximize ? " w-full " : " ";
  // baseClass +=  isPreviousUser || isLatestUser ? " min-w-[85vw] max-w-[90vw]" : "  " // min-w-fit
  // if (props.isMobile && isFirstUser) {
  //   baseClass += " w-[90vw] ";
  // } else if (isFirstUser) {
  //   baseClass += " w-[calc(90vw-16rem)] ";
  // }

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
  // console.log(
  //   "botMessage props.maxGlobalIdBot",
  //   props.maxGlobalIdBot === props.globalIdBot
  // )
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;
  let baseClass =
    "rounded-xl bg-yellow-400 text-black p-4 m-1 relative break-words"; //border-yellow-500
  // baseClass += isLatestBot ? " min-w-[85vw] max-w-[90vw]" : "  " // min-w-fit
  // baseClass += props.toMaximize ? " w-full " : " ";
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
      {/* {props.children} */}

      <div className="flex flex-row justify-between text-xs mb-4">
        <p>{props.model}</p>
        <CopyText text={props.children} />
      </div>

      <MarkdownComponent>{props.children}</MarkdownComponent>
    </div>
  );
}

export function Branch(props) {
  // console.log("branch is mobile", props.isMobile)
  // console.log("toMaximize", props.toMaximize);
  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  let baseClass = "mx-auto"; //border-2 border-red-300 flex-1
  // const w = props.isMobile
  //   ? " min-w-3/4 max-w-5/6 "
  //   : ` min-w-[calc(85%-16rem)] max-w-[calc(90%-16rem)] `; //` min-w-[calc(50vw-${SIDEBAR_WIDTH})] max-w-[calc(60vw-${SIDEBAR_WIDTH})] `
  // const w = props.isMobile ? " w-full  " : ` w-[calc(90%-16rem)] `; //` min-w-[calc(50vw-${SIDEBAR_WIDTH})] max-w-[calc(60vw-${SIDEBAR_WIDTH})] `
  // const w = props.isMobile ? " w-[85vw] " : ` w-[calc(85vw-16rem)] `;
  let w = props.isMobile
    ? " w-[85vw] shrink-0 "
    : ` w-[calc(85vw-16rem)] shrink-0 `;
  // baseClass += isPenultimateBranch ? " min-w-[60vw] max-w-[70vw] " : " " // min-w-[85vw] max-w-[90vw]
  baseClass += props.toMaximize ? w : " flex-1  "; // min-w-[85vw] max-w-[90vw]
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

function TestContainer(props) {
  const isMobile = useIsMobile();
  const [globalIdUser, setGlobalIdUser] = useState(1);
  const [globalIdBot, setGlobalIdBot] = useState(0);
  // const [globalIdUser, setGlobalIdUser] = useState(19);
  // const [globalIdBot, setGlobalIdBot] = useState(11);

  const [model, setModel] = useState("gpt-4o-mini");

  const [userMessages, setUserMessages] = useState(() => [
    { key: [1], content: "", role: "user", globalIdUser: globalIdUser },
  ]);
  const [botMessages, setBotMessages] = useState(() => []);
  // const [userMessages, setUserMessages] = useState(() => initialUserMessages);
  // const [botMessages, setBotMessages] = useState(() => initialBotMessages);

  const idInUserMessages = (id) =>
    userMessages.filter((m) => JSON.stringify(m.key) === id).length > 0; // bool; if id is in userMessages
  const idInBotMessages = (id) =>
    botMessages.filter((m) => JSON.stringify(m.key) === id).length > 0; // // bool; if id is in botMessages
  const getBotMessageForKey = (key) =>
    botMessages.find((m) => JSON.stringify(m.key) === JSON.stringify(key)); // returns BotMessage for a given key

  const [response, setResponse] = useState({});
  const [branchKeyToMaximize, setBranchKeyToMaximize] = useState(
    JSON.stringify([1])
  );

  function checkParentBranch(key) {
    console.log("key", key);
    // if length of key is 1 it is the root branch
    if (key.length === 1) {
      console.log("root branch", key);
      return { final: true, key: JSON.stringify(key) };
    }
    // if last value in key > 1 -> it is a new horizontal branch
    // -> maximize it
    let lastKey = key[key.length - 1];
    console.log("lastKey", lastKey);
    if (lastKey > 1) {
      return { final: true, key: JSON.stringify(key) };
    } else {
      // if last value in key === 1 -> it is a new vertical branch
      // -> maximize its parent
      let parentKey = key.slice(0, -1);
      if (parentKey.length === 0) {
        // first botMessage in branch
        parentKey = key;
        return { final: true, key: JSON.stringify(key) };
      }
      // for instace parentKey [2, 1, 1]
      console.log("parentKey continues", parentKey);
      return checkParentBranch(parentKey);
      // return {final:false, key:JSON.stringify(parentKey)};
    }
  }
  // change botMessages
  // focus to new user message
  // useEffect(() => {
  //   props.refElementUser.current?.focus()
  // }, [userMessages]);
  // scroll to latest bot message
  useLayoutEffect(() => {
    // console.log("props.refElementBot.current", props.refElementBot.current)
    props.refElementBot.current?.scrollIntoView({
      // behavior: "smooth",
      block: "center",
      inline: "start",
    });
  }, [response]);
  //
  function getBranchKeyToMaximize() {
    console.log("globalIdBot", globalIdBot);
    // first user message -> maximize
    if (globalIdBot === 0) {
      return JSON.stringify([1]);
    }
    // find bot message with globalIdBot
    const latestBotMessage = botMessages.find(
      (botMessage) => botMessage.globalIdBot === globalIdBot
    );
    const messageKey = latestBotMessage.key;

    const branchToMaxInfo = checkParentBranch(messageKey);
    console.log("branchToMaxInfo", branchToMaxInfo);
    if (branchToMaxInfo.final) {
      return branchToMaxInfo.key;
    }

    return;
  }
  //
  useEffect(() => {
    // console.log("globalIdBot", globalIdBot)

    const newBranchKeyToMaximize = getBranchKeyToMaximize();
    console.log("newBranchKeyToMaximize", newBranchKeyToMaximize);
    setBranchKeyToMaximize(newBranchKeyToMaximize);
  }, [globalIdBot]);

  async function handleEnter(event) {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        return; // Ignore Shift + Enter
      }
      event.preventDefault();

      let chain;
      let tempChunks = "";
      const array = JSON.parse(event.target.id);
      // check if event.target.id in userMessages
      // console.log("exists", idInUserMessages(event.target.id))
      if (idInBotMessages(event.target.id)) {
        // old user /////////////////////
        ////////////////////////////////
        console.log("old message");

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
            content: `${event.target.textContent}`,
            role: "user",
          },
        ]);
        // get chain
        chain = getChain({ event: event });
        chain.push({
          key: array,
          content: event.target.textContent,
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
          props.setIsDialogOpen(true);
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
                JSON.stringify(m.key) === JSON.stringify(array)
                  ? newBotEntry
                  : m
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

        // get chain
        chain = getChain({ event: event });
        chain.push({
          key: array,
          content: event.target.textContent,
          role: "user",
        });
        // console.log("chain", chain);
        //

        setUserMessages((v) => {
          // after 'enter' press, the current userMessage is ""
          // manually set current userMessage to event.target.textContent
          // find the id and update the old userMessage
          const userMessagesCopy = [...v];
          const messageToUpdate = userMessagesCopy.find(
            (msg) => JSON.stringify(msg.key) === JSON.stringify(array)
          );
          messageToUpdate.content = event.target.textContent;
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
          props.setIsDialogOpen(true);
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
                JSON.stringify(m.key) === JSON.stringify(array)
                  ? newBotEntry
                  : m
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
  }

  function getChain({ event }) {
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

  function RecursiveBranch(props) {
    // tempMessages should be messages whose length is props.parentKey.length+1
    // and .slice(0,-1) JSON.stringify is equal to parent
    let tempUserMessages;
    if (props.parentKey) {
      // console.log("props.parentKey", props.parentKey.length);
      // userMessages whose length is same as parent
      // (parent: the userMessage that called recursive)
      // &&
      // userMessages whose key matches the parent
      tempUserMessages = userMessages.filter(
        (m) =>
          m.key.length - 1 === props.parentKey.length &&
          JSON.stringify(m.key.slice(0, -1)) === JSON.stringify(props.parentKey)
      );
    } else {
      tempUserMessages = userMessages.filter((m) => m.key.length === 1);
    }
    if (test) {
      // console.log("tempUserMessages.length", tempUserMessages.length);
      // console.log("tempUserMessages", tempUserMessages);
    }
    // tempUserMessages contains each BranchContainer's Branches.
    // each element inside is a usermessage for that branch
    // let soleBranch = false;
    // if (tempUserMessages.length === 1) {
    //   soleBranch = true;
    // }
    // console.log("soleBranch", soleBranch);
    // console.log("props.level", props.level);

    return (
      tempUserMessages[0] && (
        <BranchContainer id={props.level} key={props.level}>
          {tempUserMessages.map((tm, i) => {
            return (
              <Branch
                id={props.level}
                key={`${props.level} ${i}`}
                globalIdBot={
                  getBotMessageForKey(tm.key) &&
                  getBotMessageForKey(tm.key).globalIdBot
                }
                maxGlobalIdBot={globalIdBot}
                isMobile={isMobile}
                toMaximize={branchKeyToMaximize === JSON.stringify(tm.key)}
              >
                <UserMessage
                  id={JSON.stringify(tm.key)}
                  key={JSON.stringify(tm.key)}
                  globalIdUser={tm.globalIdUser}
                  maxGlobalIdUser={globalIdUser}
                  isMobile={isMobile}
                  toMaximize={branchKeyToMaximize === JSON.stringify(tm.key)}
                  handleEnter={handleEnter}
                  refElementUser={props.refElementUser}
                >
                  {tm.content}
                </UserMessage>
                {getBotMessageForKey(tm.key) && ( // tempBotMessages[i]
                  <BotMessage
                    id={JSON.stringify(tm.key)}
                    key={"b" + JSON.stringify(tm.key)}
                    globalIdBot={getBotMessageForKey(tm.key).globalIdBot}
                    maxGlobalIdBot={globalIdBot}
                    model={getBotMessageForKey(tm.key)?.model}
                    toMaximize={branchKeyToMaximize === JSON.stringify(tm.key)}
                    refElementBot={props.refElementBot}
                  >
                    {getBotMessageForKey(tm.key).content}
                  </BotMessage>
                )}

                <RecursiveBranch
                  parentKey={tm.key}
                  parent={tm.key[props.level]}
                  level={props.level + 1}
                  refElementUser={props.refElementUser}
                  refElementBot={props.refElementBot}
                />
              </Branch>
            );
          })}
        </BranchContainer>
      )
    );
  }
  // console.log("userMessages", userMessages);
  // console.log("test", test);

  let chatContainerClass =
    " overflow-y-auto overflow-x-auto h-[70vh] rounded-xl"; // flex flex-col overflow-auto
  chatContainerClass += isMobile
    ? " w-[90vw] "
    : ` w-[calc(90vw-${SIDEBAR_WIDTH})] `;
  return (
    <div id="chat-container" className={chatContainerClass}>
      {/* <div>
        {isMobile
          ? `using mobile: ${SIDEBAR_WIDTH_MOBILE}`
          : `using desktop: ${SIDEBAR_WIDTH}`}
      </div> */}
      <RecursiveBranch
        level={0}
        refElementUser={props.refElementUser}
        refElementBot={props.refElementBot}
      />
    </div>
  );
}

export default function RecursiveChat(props) {
  // console.log("props", props);
  const refUser = useRef(null);
  const refBot = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="my-auto mx-auto py-2 px-4 md:px-6 ">
      <TestContainer
        refElementUser={refUser}
        refElementBot={refBot}
        setIsDialogOpen={setIsDialogOpen}
      />
      <AuthDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />

      {/* <Button onClick={() => signInClientAction({ provider: "google" })}>
        SignIn
      </Button> */}
      {/* <Button
        className="flex mx-auto my-4"
        onClick={(e) => {
          console.log("ref click", refBot.current)
          refBot.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          })
        }}
      >
        Focus
      </Button> */}
    </div>
  );
}
// { key: [1], content: "", role: "user", globalIdUser: globalIdUser }
// key: array,
//             globalIdBot: 1,
//             content: tempChunks,
//             role: "bot",
//             status: 'ok',
//             model: 'gpt-4o-mini',
const initialUserMessages = [
  { key: [1], content: "text 1", role: "user", globalIdUser: 1 },
  { key: [1, 1], content: "text 1,1", role: "user", globalIdUser: 4 },
  { key: [1, 1, 1], content: "text 1,1,1", role: "user", globalIdUser: 12 },
  { key: [1, 2], content: "text 1,2", role: "user", globalIdUser: 5 },
  { key: [1, 2, 1], content: "text 1,2,1", role: "user", globalIdUser: 6 },
  {
    key: [1, 2, 1, 1],
    content: "text 1, 2, 1, 1",
    role: "user",
    globalIdUser: 13,
  },
  { key: [1, 2, 2], content: "text 1,2,2", role: "user", globalIdUser: 7 },
  {
    key: [1, 2, 2, 1],
    content: "text 1, 2, 2, 1",
    role: "user",
    globalIdUser: 14,
  },
  { key: [1, 2, 3], content: "text 1,2,3", role: "user", globalIdUser: 8 },
  { key: [1, 2, 3, 1], content: "text 1,2,3,1", role: "user", globalIdUser: 9 },
  {
    key: [1, 2, 3, 1, 1],
    content: "text 1, 2, 3, 1, 1",
    role: "user",
    globalIdUser: 15,
  },
  { key: [1, 2, 4], content: "text 1,2,4", role: "user", globalIdUser: 15 },
  {
    key: [1, 2, 4, 1],
    content: "text 1,2,4,1",
    role: "user",
    globalIdUser: 16,
  },
  { key: [1, 3], content: "text 1,3", role: "user", globalIdUser: 13 },
  { key: [1, 3, 1], content: "text 1,3,1", role: "user", globalIdUser: 14 },
  { key: [2], content: "text 2", role: "user", globalIdUser: 2 },
  { key: [2, 1], content: "text 2,1", role: "user", globalIdUser: 10 },
  { key: [2, 1, 1], content: "text 2,1,1", role: "user", globalIdUser: 16 },
  { key: [2, 2], content: "text 2,2", role: "user", globalIdUser: 11 },
  { key: [2, 2, 1], content: "text 2,2,1", role: "user", globalIdUser: 17 },
  { key: [3], content: "text 3", role: "user", globalIdUser: 3 },
  { key: [3, 1], content: "text 3,1", role: "user", globalIdUser: 18 },
];
const initialBotMessages = [
  {
    key: [1],
    content: "bot text 1",
    role: "bot",
    globalIdBot: 1,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 1],
    content: "bot text 1,1",
    role: "bot",
    globalIdBot: 4,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 2],
    content: "bot text 1,2",
    role: "bot",
    globalIdBot: 5,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 2, 1],
    content: "bot text 1,2,1",
    role: "bot",
    globalIdBot: 6,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 2, 2],
    content: "bot text 1,2,2",
    role: "bot",
    globalIdBot: 7,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 2, 3],
    content: "bot text 1,2,3",
    role: "bot",
    globalIdBot: 8,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 2, 3, 1],
    content: "bot text 1,2,3,1",
    role: "bot",
    globalIdBot: 9,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 2, 4],
    content: "bot text 1,2,4",
    role: "bot",
    globalIdBot: 13,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [1, 3],
    content: "bot text 1,3",
    role: "bot",
    globalIdBot: 12,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [2],
    content: "bot text 2",
    role: "bot",
    globalIdBot: 2,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [2, 1],
    content: "bot text 2,1",
    role: "bot",
    globalIdBot: 10,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [2, 2],
    content: "bot text 2,2",
    role: "bot",
    globalIdBot: 11,
    status: "ok",
    model: "gpt-4o-mini",
  },
  {
    key: [3],
    content: "bot text 3",
    role: "bot",
    globalIdBot: 3,
    status: "ok",
    model: "gpt-4o-mini",
  },
];

function getDummyBotResponse({ chain }) {
  const charSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789        ";

  const length = 3; // adjust the length as needed
  const randomText = Array.from({ length }, () =>
    charSet.charAt(Math.floor(Math.random() * charSet.length))
  ).join("");
  // console.log("chain inner", chain);
  return (
    `${chain[chain.length - 1].content} ${chain[chain.length - 1].key}` +
    randomText
  );
}
const markdownSample = `The \`MLPClassifier\` from the \`scikit-learn\` library.

\`\`\`python
import numpy as np

def train_mlp(hidden_layer_sizes=(100,), activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=0.001, max_iter=200):
    # Generate a synthetic dataset for classification
    X, y = make_classification(n_samples=1000, n_features=20, n_informative=10, n_redundant=10, random_state=42)
    
    return mlp

# Example usage
trained_mlp = train_mlp()
\`\`\`

### Explanation:
1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.

You can customize the parameters of the \`MLPClassifier\`.`;

// console.log(markdownSample);
function simulateRandomStreamingResponse({ chain }) {
  // console.log(chain);
  const charSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789        ";

  return new Response(
    new ReadableStream({
      start(controller) {
        // Simulate data intervals
        const interval = setInterval(() => {
          // const data = `Data: ${Math.random()}\n`;
          const length = 5; // adjust the length as needed
          const data = Array.from({ length }, () =>
            charSet.charAt(Math.floor(Math.random() * charSet.length))
          ).join("");
          controller.enqueue(data); // Send data to the stream

          // Stop after some data
          if (Math.random() > 0.95) {
            clearInterval(interval);
            controller.close(); // Close the stream
          }
        }, 100); // Emit data every 100ms
      },
    })
  );
}
// console.log(markdownSample.split(" "));
function simulateStreamingResponse({ chain }) {
  // console.log(chain);
  const markdownArray = markdownSample.split(" ");
  return new Response(
    new ReadableStream({
      start(controller) {
        // Simulate data intervals
        let counter = 0;
        const interval = setInterval(() => {
          const data = markdownArray[counter] + " ";
          counter += 1;
          controller.enqueue(data); // Send data to the stream

          // Stop after some data
          if (counter === markdownArray.length) {
            clearInterval(interval);
            controller.close(); // Close the stream
          }
        }, 20); // Emit data every 100ms
      },
    })
  );
}

// Consuming the simulated streaming response
async function* consumeStream({ chain }) {
  const currentUserMessage = chain[chain.length - 1]?.content;
  console.log("currentUserMessage", currentUserMessage);

  const response = simulateStreamingResponse({ chain });
  const reader = response.body.getReader();
  yield { status: "start", content: null };
  yield { status: "middle", content: `${currentUserMessage}\n\n\n\n` };
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;
    // console.log("Received value:", value);
    yield { status: "middle", content: value };
    // console.log(`Received: ${new TextDecoder().decode(value)}`);
  }
  yield { status: "end", content: null };
  console.log("Stream ended.");
}

function sortByBranch(messages) {
  // sort by each branch and subbranch
  return messages.sort((a, b) => {
    // Convert strings to arrays
    const arrA = a.key;
    const arrB = b.key;

    // Compare arrays
    for (let i = 0; i < Math.min(arrA.length, arrB.length); i++) {
      if (arrA[i] !== arrB[i]) {
        return arrA[i] - arrB[i]; // Numeric comparison
      }
    }
    return arrA.length - arrB.length; // If they are equal so far, sort by length
  });
}
function maxIgnoringUndefined(arr) {
  // Filter out undefined values from the array
  const filteredArray = arr.filter((value) => value !== undefined);
  // Use Math.max to find the maximum value in the filtered array
  return Math.max(...filteredArray);
}
