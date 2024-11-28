import Image from "next/image"

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

function UserMessage(props) {
  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      data-placeholder="New message"
      className="min-w-fit max-w-[95vw] flex-1 m-1 bg-blue-400 p-1 dark:bg-blue-600" //border-2 border-blue-500
      onKeyDown={props.handleEnter}
      id={props.id}
      ref={props.refElementUser}
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
      ref={props.refElementBot}
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

export default function Home() {
  return (
    <div
      // className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      className="items-center py-8 pb-20 gap-16  sm:py-20 min-h-screen"
    >
      <main
        // className="flex flex-col gap-8 row-start-2 items-center sm:items-start overflow-x-auto"
        className="flex flex-col gap-8 "
      >
        <div
          id="chat-container"
          className="mx-2 my-2" // overflow-x-scroll
        >
          <BranchContainer>
            <Branch level={0}>
              <UserMessage>Hi 1</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                  <BranchContainer>
                    <Branch>
                      <UserMessage>How are you?</UserMessage>
                      <BotMessage>Good and you??</BotMessage>
                    </Branch>

                    <Branch>
                      <UserMessage>How are you?</UserMessage>
                      <BotMessage>Good and you??</BotMessage>
                    </Branch>
                  </BranchContainer>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi 2</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                </Branch>
              </BranchContainer>
            </Branch>

            <Branch level={0}>
              <UserMessage>Hi</UserMessage>
              <BotMessage>Howdy?</BotMessage>
              <BranchContainer>
                <Branch>
                  <UserMessage>How are you?</UserMessage>
                  <BotMessage>Good and you??</BotMessage>
                  <BranchContainer>
                    <Branch>
                      <UserMessage>How are you?</UserMessage>
                      <BotMessage>Good and you??</BotMessage>
                      <BranchContainer>
                        <Branch>
                          <UserMessage>How are you?</UserMessage>
                          <BotMessage>Good and you??</BotMessage>
                          <BranchContainer>
                            <Branch>
                              <UserMessage>How are you?</UserMessage>
                              <BotMessage>Good and you??</BotMessage>
                              <BranchContainer>
                                <Branch>
                                  <UserMessage>How are you?</UserMessage>
                                  <BotMessage>
                                    Well that puts me in the mood for a good
                                    story. Sit tight and listen:
                                    sdkjfsdflajskdfjasdkjflsadfjlsadkfhjsdjghjfsdlfjsdlfkajsdfjsadfjasdflsdhfjhgfjsdfsdflsdkjf
                                  </BotMessage>
                                  <BranchContainer>
                                    <Branch>
                                      <UserMessage>How are you?</UserMessage>
                                      <BotMessage>
                                        Well that puts me in the mood for a good
                                        story. Sit tight and listen:
                                        sdkjfsdflajskdfjasdkjflsadfjlsadkfhjsdjghjfsdlfjsdlfkajsdfjsadfjasdflsdhfjhgfjsdfsdflsdkjf
                                      </BotMessage>
                                      <BranchContainer>
                                        <Branch>
                                          <UserMessage>
                                            How are you?
                                          </UserMessage>
                                          <BotMessage last>
                                            Well that puts me in the mood for a
                                            good story. Sit tight and listen:
                                            sdkjfsdflajskdfjasdkjflsadfjlsadkfhjsdjghjfsdlfjsdlfkajsdfjsadfjasdflsdhfjhgfjsdfsdflsdkjf
                                          </BotMessage>
                                        </Branch>
                                      </BranchContainer>
                                    </Branch>
                                  </BranchContainer>
                                </Branch>
                              </BranchContainer>
                            </Branch>
                          </BranchContainer>
                        </Branch>
                      </BranchContainer>
                    </Branch>
                  </BranchContainer>
                </Branch>
              </BranchContainer>
            </Branch>
          </BranchContainer>
        </div>
        <button>focus</button>
      </main>
      <footer className="row-start-3 flex gap-6 pt-16 flex-wrap items-center justify-center">
        <p className="flex items-center gap-2">
          © 2024 Spreed.chat. All rights reserved.
        </p>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://spreed.chat/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy{" "}
        </a>
      </footer>
    </div>
  )
}
