"use client"

import React from "react"
import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { generate } from "@/lib/actions"
import { readStreamableValue } from "ai/rsc"
import Toast from "./Toast"
import MarkdownComponent from "@/components/MarkdownComponent"
import { useIsMobile } from "@/hooks/use-mobile"
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

function UserMessage(props) {
  const isLatestUser = props.maxGlobalIdUser === props.globalIdUser
  const isPreviousUser = props.maxGlobalIdUser === props.globalIdUser + 1
  let baseClass = " bg-blue-400 p-4 m-1 relative break-words" //border-2 border-blue-500 min-w-fit
  // baseClass +=  isPreviousUser || isLatestUser ? " min-w-[85vw] max-w-[90vw]" : "  " // min-w-fit

  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      data-placeholder="New message"
      className={baseClass}
      onKeyDown={props.handleEnter}
      id={props.id}
      globaliduser={props.globalIdUser}
      maxglobaliduser={props.maxGlobalIdUser}
      ref={isLatestUser ? props.refElementUser : null}
    >
      {props.children}
    </div>
  )
}

function BotMessage(props) {
  // console.log(
  //   "botMessage props.maxGlobalIdBot",
  //   props.maxGlobalIdBot === props.globalIdBot
  // )
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot
  let baseClass = "bg-yellow-400 text-black p-4 m-1 relative break-words" //border-yellow-500
  // baseClass += isLatestBot ? " min-w-[85vw] max-w-[90vw]" : "  " // min-w-fit

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
      <MarkdownComponent model={props.model}>
        {props.children}
      </MarkdownComponent>
    </div>
  )
}

function Branch(props) {
  // console.log("branch is mobile", props.isMobile)
  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot
  let baseClass = "flex-1 mx-auto" //border-2 border-red-300 flex-1
  const w = props.isMobile
    ? " min-w-[85vw] max-w-[90vw] "
    : ` min-w-[calc(85vw-16rem)] max-w-[calc(90vw-16rem)] ` //` min-w-[calc(50vw-${SIDEBAR_WIDTH})] max-w-[calc(60vw-${SIDEBAR_WIDTH})] `
  // baseClass += isPenultimateBranch ? " min-w-[60vw] max-w-[70vw] " : " " // min-w-[85vw] max-w-[90vw]
  baseClass += isPenultimateBranch ? w : " " // min-w-[85vw] max-w-[90vw]
  return (
    <div
      id={"branch" + props.id}
      className={baseClass}
      penultimate={isPenultimateBranch ? "true" : "false"}
    >
      {props.children}
    </div>
  )
}

function BranchContainer(props) {
  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row  " //border-4 border-green-300 overflow-scroll flex-nowrap justify-between
    >
      {props.children}
    </div>
  )
}

function TestContainer(props) {
  const isMobile = useIsMobile()
  const [globalIdUser, setGlobalIdUser] = useState(1)
  const [globalIdBot, setGlobalIdBot] = useState(0)

  const [model, setModel] = useState("gpt-4o-mini")

  const [userMessages, setUserMessages] = useState(() => [
    { key: [1], content: "", role: "user", globalIdUser: globalIdUser },
  ])
  const [botMessages, setBotMessages] = useState(() => [])

  const idInUserMessages = (id) =>
    userMessages.filter((m) => JSON.stringify(m.key) === id).length > 0 // bool; if id is in userMessages
  const idInBotMessages = (id) =>
    botMessages.filter((m) => JSON.stringify(m.key) === id).length > 0 // // bool; if id is in botMessages
  const getBotMessageForKey = (key) =>
    botMessages.filter((m) => JSON.stringify(m.key) === JSON.stringify(key))[0] // returns BotMessage for a given key

  const [response, setResponse] = useState({})

  // change botMessages
  // focus to new user message
  useEffect(() => {
    // props.refElementUser.current?.focus()
  }, [userMessages])
  // scroll to latest bot message
  useLayoutEffect(() => {
    // console.log("props.refElementBot.current", props.refElementBot.current)
    props.refElementBot.current?.scrollIntoView({
      // behavior: "smooth",
      block: "center",
      inline: "center",
    })
  }, [response])
  //
  useEffect(() => {
    // console.log("globalIdBot", globalIdBot)

    const newestBotMessage = botMessages.find(
      (m) => m.globalIdBot === globalIdBot
    )
    // console.log("newestBotMessage", newestBotMessage)
    // console.log("botMessages", botMessages)
  }, [globalIdBot])

  async function handleEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault()

      let chain
      let tempChunks = ""
      const array = JSON.parse(event.target.id)
      // check if event.target.id in userMessages
      // console.log("exists", idInUserMessages(event.target.id))
      if (idInBotMessages(event.target.id)) {
        // old user /////////////////////
        ////////////////////////////////
        console.log("old message")

        // find the latest branch on the same key length
        const sameParents = userMessages.filter(
          (m) =>
            (m.key.length === array.length) &
            (JSON.stringify(m.key.slice(0, -1)) ===
              JSON.stringify(array.slice(0, -1)))
        )
        const maxSameBranch = Math.max(
          ...sameParents.map((m) => m.key[m.key.length - 1])
        )
        // console.log("maxSameBranch", maxSameBranch);
        // console.log(array.slice(0, -1));
        // add a horizontal branch in the key array
        array[array.length - 1] = maxSameBranch + 1

        const newArray = array.slice()
        newArray.push(1) // for new empty userMessage

        const newGlobalIdUser = globalIdUser + 1
        setGlobalIdUser(newGlobalIdUser)
        setUserMessages((m) => [
          ...m,
          {
            key: array, // new horizontal branch key
            globalIdUser: newGlobalIdUser,
            content: `${event.target.textContent}`,
            role: "user",
          },
        ])
        // get chain
        chain = getChain({ event: event })
        chain.push({
          key: array,
          content: event.target.textContent,
          role: "user",
        })
        // console.log("chain", chain);
        //

        // streaming the LLM old user
        // // //
        // const botResponse = getDummyBotResponse({ chain });
        // const streamIterator = consumeStream({ chain: chain })
        const streamIterator = await generate({ messages: chain, model: model })
        if (streamIterator.status !== "ok") {
          console.log("streamIterator.status not ok", streamIterator.status)
          return <Toast>Failed</Toast>
        }
        console.log("streamIterator", streamIterator)
        let counter = 0
        tempChunks = ""
        const newGlobalIdBot = globalIdBot + 1
        setGlobalIdBot(newGlobalIdBot)
        for await (const delta of readStreamableValue(streamIterator.output)) {
          // console.log("chunk", chunk);
          // chunks += chunk;
          setResponse({ status: streamIterator.status })
          tempChunks = delta ? tempChunks + delta : tempChunks

          const newBotEntry = {
            key: array,
            globalIdBot: newGlobalIdBot,
            content: tempChunks,
            role: "bot",
            status: streamIterator.status,
            model: model,
          }
          if (counter === 0) {
            // first chunk
            setBotMessages((v) => [...v, newBotEntry])
          } else {
            setBotMessages((v) =>
              v.map((m) =>
                JSON.stringify(m.key) === JSON.stringify(array)
                  ? newBotEntry
                  : m
              )
            )
          }

          counter += 1
        }
        // END: streaming the LLM
        // // //
        // set new userMessage
        const newNewGlobalIdUser = newGlobalIdUser + 1
        setGlobalIdUser(newNewGlobalIdUser)
        setUserMessages((v) => [
          ...v,
          {
            key: newArray,
            globalIdUser: newNewGlobalIdUser,
            content: "",
            role: "user",
          },
        ])
      } else {
        // new user /////////////////////
        ////////////////////////////////
        console.log("new message")

        const newArray = array.slice()
        newArray.push(1)

        // get chain
        chain = getChain({ event: event })
        chain.push({
          key: array,
          content: event.target.textContent,
          role: "user",
        })
        //

        setUserMessages((v) => {
          // after 'enter' press, the current userMessage is ""
          // manually set current userMessage to event.target.textContent
          // find the id and update the old userMessage
          const userMessagesCopy = [...v]
          const messageToUpdate = userMessagesCopy.find(
            (msg) => JSON.stringify(msg.key) === JSON.stringify(array)
          )
          messageToUpdate.content = event.target.textContent
          return userMessagesCopy
        })

        // streaming the LLM new user
        // // //
        // const streamIterator = consumeStream({ chain: chain })
        const streamIterator = await generate({ messages: chain, model: model })
        if (streamIterator.status !== "ok") {
          console.log("streamIterator.status not ok", streamIterator.status)
          return <Toast>Failed</Toast>
        }

        let counter = 0
        tempChunks = ""
        const newGlobalIdBot = globalIdBot + 1
        setGlobalIdBot(newGlobalIdBot)
        for await (const delta of readStreamableValue(streamIterator.output)) {
          // console.log("resp", resp);
          // tempChunks += chunk;
          setResponse({ status: streamIterator.status })
          tempChunks = delta ? tempChunks + delta : tempChunks
          // console.log("chunk", tempChunks);
          // setChunks(tempChunks);
          const newBotEntry = {
            key: array,
            globalIdBot: newGlobalIdBot,
            content: tempChunks,
            role: "bot",
            status: streamIterator.status,
            model: model,
          }
          if (counter === 0) {
            // first chunk
            setBotMessages((v) => [...v, newBotEntry])
          } else {
            setBotMessages((v) =>
              v.map((m) =>
                JSON.stringify(m.key) === JSON.stringify(array)
                  ? newBotEntry
                  : m
              )
            )
          }

          counter += 1
        }
        // END: streaming the LLM
        //
        const newGlobalIdUser = globalIdUser + 1
        setGlobalIdUser(newGlobalIdUser)
        const newUserEntry = {
          key: newArray,
          globalIdUser: newGlobalIdUser,
          content: "",
          role: "user",
        }
        setUserMessages((v) => {
          // new userMessage
          const newUserMessages = [...v, newUserEntry]
          return newUserMessages
        })
      }
    }
  }

  function getChain({ event }) {
    const array = JSON.parse(event.target.id)
    const chain = []
    for (let i = 1; i < array.length; i++) {
      // console.log("i", i);
      const parentKey = array.slice(0, i)
      const parentUser = userMessages.filter(
        (m) => JSON.stringify(m.key) === JSON.stringify(parentKey)
      )[0]
      const parentBot = botMessages.filter(
        (m) => JSON.stringify(m.key) === JSON.stringify(parentKey)
      )[0]
      chain.push({ key: parentKey, content: parentUser.content, role: "user" })
      chain.push({
        key: parentKey,
        content: parentBot.content,
        role: "assistant",
      })
    }
    return chain
  }

  function RecursiveBranch(props) {
    // tempMessages should be messages whose length is props.parentKey.length+1
    // and .slice(0,-1) JSON.stringify is equal to parent
    let tempUserMessages
    if (props.parentKey) {
      // console.log("props.parentKey", props.parentKey.length);
      tempUserMessages = userMessages.filter(
        (m) =>
          (m.key.length - 1 === props.parentKey.length) &
          (JSON.stringify(m.key.slice(0, -1)) ===
            JSON.stringify(props.parentKey))
      )
    } else {
      tempUserMessages = userMessages.filter((m) => m.key.length === 1)
    }

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
              >
                <UserMessage
                  id={JSON.stringify(tm.key)}
                  key={JSON.stringify(tm.key)}
                  globalIdUser={tm.globalIdUser}
                  maxGlobalIdUser={globalIdUser}
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
            )
          })}
        </BranchContainer>
      )
    )
  }

  let chatContainerClass = "my-2 overflow-auto flex flex-col mx-4 md:mx-6 "
  chatContainerClass += isMobile
    ? " min-w-[90vw] "
    : ` min-w-[calc(90vw-${SIDEBAR_WIDTH})] `
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
  )
}

export default function RecursiveChat() {
  const refUser = useRef(null)
  const refBot = useRef(null)

  return (
    <div className="my-auto">
      <TestContainer refElementUser={refUser} refElementBot={refBot} />
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
  )
}

const initialUserMessages = [
  { key: [1], content: "text 1", role: "user" },
  { key: [2], content: "text 2", role: "user" },
  { key: [3], content: "text 3", role: "user" },
  { key: [1, 1], content: "text 1,1", role: "user" },
  { key: [1, 2], content: "text 1,2", role: "user" },
  { key: [1, 2, 1], content: "text 1,2,1", role: "user" },
  { key: [1, 2, 2], content: "text 1,2,2", role: "user" },
  { key: [1, 2, 3], content: "text 1,2,3", role: "user" },
  { key: [1, 2, 3, 1], content: "text 1,2,3,1", role: "user" },
  { key: [2, 1], content: "text 2,1", role: "user" },
  { key: [2, 2], content: "text 2,2", role: "user" },
]
const initialBotMessages = [
  { key: [1], content: "bot text 1", role: "bot" },
  { key: [2], content: "bot text 2", role: "bot" },
  { key: [3], content: "bot text 3", role: "bot" },
  { key: [1, 1], content: "bot text 1,1", role: "bot" },
  { key: [1, 2], content: "bot text 1,2", role: "bot" },
  { key: [1, 2, 1], content: "bot text 1,2,1", role: "bot" },
  { key: [1, 2, 2], content: "bot text 1,2,2", role: "bot" },
  { key: [1, 2, 3], content: "bot text 1,2,3", role: "bot" },
  { key: [1, 2, 3, 1], content: "bot text 1,2,3,1", role: "bot" },
  { key: [2, 1], content: "bot text 2,1", role: "bot" },
]

function getDummyBotResponse({ chain }) {
  const charSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789        "

  const length = 3 // adjust the length as needed
  const randomText = Array.from({ length }, () =>
    charSet.charAt(Math.floor(Math.random() * charSet.length))
  ).join("")
  // console.log("chain inner", chain);
  return (
    `${chain[chain.length - 1].content} ${chain[chain.length - 1].key}` +
    randomText
  )
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

You can customize the parameters of the \`MLPClassifier\`.`

// console.log(markdownSample);
function simulateRandomStreamingResponse({ chain }) {
  // console.log(chain);
  const charSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789        "

  return new Response(
    new ReadableStream({
      start(controller) {
        // Simulate data intervals
        const interval = setInterval(() => {
          // const data = `Data: ${Math.random()}\n`;
          const length = 5 // adjust the length as needed
          const data = Array.from({ length }, () =>
            charSet.charAt(Math.floor(Math.random() * charSet.length))
          ).join("")
          controller.enqueue(data) // Send data to the stream

          // Stop after some data
          if (Math.random() > 0.95) {
            clearInterval(interval)
            controller.close() // Close the stream
          }
        }, 100) // Emit data every 100ms
      },
    })
  )
}
// console.log(markdownSample.split(" "));
function simulateStreamingResponse({ chain }) {
  // console.log(chain);
  const markdownArray = markdownSample.split(" ")
  return new Response(
    new ReadableStream({
      start(controller) {
        // Simulate data intervals
        let counter = 0
        const interval = setInterval(() => {
          const data = markdownArray[counter] + " "
          counter += 1
          controller.enqueue(data) // Send data to the stream

          // Stop after some data
          if (counter === markdownArray.length) {
            clearInterval(interval)
            controller.close() // Close the stream
          }
        }, 20) // Emit data every 100ms
      },
    })
  )
}

// Consuming the simulated streaming response
async function* consumeStream({ chain }) {
  const currentUserMessage = chain[chain.length - 1]?.content
  console.log("currentUserMessage", currentUserMessage)

  const response = simulateStreamingResponse({ chain })
  const reader = response.body.getReader()
  yield { status: "start", content: null }
  yield { status: "middle", content: `${currentUserMessage}\n\n\n\n` }
  while (true) {
    const { done, value } = await reader.read()

    if (done) break
    // console.log("Received value:", value);
    yield { status: "middle", content: value }
    // console.log(`Received: ${new TextDecoder().decode(value)}`);
  }
  yield { status: "end", content: null }
  console.log("Stream ended.")
}

function sortByBranch(messages) {
  // sort by each branch and subbranch
  return messages.sort((a, b) => {
    // Convert strings to arrays
    const arrA = a.key
    const arrB = b.key

    // Compare arrays
    for (let i = 0; i < Math.min(arrA.length, arrB.length); i++) {
      if (arrA[i] !== arrB[i]) {
        return arrA[i] - arrB[i] // Numeric comparison
      }
    }
    return arrA.length - arrB.length // If they are equal so far, sort by length
  })
}
function maxIgnoringUndefined(arr) {
  // Filter out undefined values from the array
  const filteredArray = arr.filter((value) => value !== undefined)
  // Use Math.max to find the maximum value in the filtered array
  return Math.max(...filteredArray)
}
