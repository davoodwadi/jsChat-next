"use client";

// import ChatComponent from "@/components/ChatComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Branch,
  BranchContainer,
  UserMessage,
  BotMessage,
} from "@/components/recursiveChat/BranchComponents";
function DefaultUserMessage(props) {
  return (
    <UserMessage
      maxGlobalIdUser={100}
      globalIdUser={1}
      isMobile={props.isMobile}
      handleEnter={() => {
        console.log("hi");
      }}
    >
      {props.children}
    </UserMessage>
  );
}
function DefaultBotMessage(props) {
  return (
    <BotMessage
      maxGlobalIdBot={1}
      globalIdBot={1}
      isMobile={props.isMobile}
      handleEnter={() => {
        console.log("hi");
      }}
    >
      {props.children}
    </BotMessage>
  );
}
export default function Home() {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="items-center py-8 pb-20 gap-16  sm:py-20 min-h-screen">
        <main className="flex flex-col gap-8 ">
          <div id="chat-container" className="mx-2 my-2 overflow-auto">
            <BranchContainer>
              <div id="branch1">
                <DefaultUserMessage isMobile={isMobile}>
                  Hi 1
                </DefaultUserMessage>
                <DefaultBotMessage isMobile={isMobile}>
                  Hi man 1
                </DefaultBotMessage>
                <DefaultUserMessage isMobile={isMobile}>
                  Howdy? 1
                </DefaultUserMessage>
              </div>
              <div id="branch2">
                <DefaultUserMessage isMobile={isMobile}>
                  Hi 2
                </DefaultUserMessage>
                <DefaultBotMessage isMobile={isMobile}>
                  Hi man 2
                </DefaultBotMessage>
                <DefaultUserMessage isMobile={isMobile}>
                  Howdy? 2
                </DefaultUserMessage>

                <DefaultBotMessage isMobile={isMobile}>
                  Hi man 2
                </DefaultBotMessage>

                <BranchContainer>
                  <div className="border-2 border-red-400">
                    <DefaultUserMessage isMobile={isMobile}>
                      Hi 3 1
                    </DefaultUserMessage>
                    <DefaultBotMessage isMobile={isMobile}>
                      Hi man 3 1
                    </DefaultBotMessage>
                    <DefaultUserMessage isMobile={isMobile}>
                      Hi 4 1
                    </DefaultUserMessage>
                  </div>
                  <div className="border-2 border-red-400">
                    <DefaultUserMessage isMobile={isMobile}>
                      Hi 3 2
                    </DefaultUserMessage>
                    <DefaultBotMessage isMobile={isMobile}>
                      Hi man 3 2
                    </DefaultBotMessage>

                    <DefaultUserMessage isMobile={isMobile}>
                      Hi 4 2
                    </DefaultUserMessage>
                    <DefaultBotMessage isMobile={isMobile}>
                      Hi man 4 2
                    </DefaultBotMessage>
                    <DefaultUserMessage isMobile={isMobile}>
                      Hi 5
                    </DefaultUserMessage>
                    <DefaultBotMessage isMobile={isMobile}>
                      Hi man 4 2
                    </DefaultBotMessage>
                    <DefaultUserMessage isMobile={isMobile}>
                      Hi 5
                    </DefaultUserMessage>
                  </div>
                </BranchContainer>
              </div>
              <div id="branch3">
                <DefaultUserMessage isMobile={isMobile}>
                  Hi 3
                </DefaultUserMessage>
                <DefaultBotMessage isMobile={isMobile}>
                  Hi man 3
                </DefaultBotMessage>
                <DefaultUserMessage isMobile={isMobile}>
                  Howdy?
                </DefaultUserMessage>

                <DefaultBotMessage isMobile={isMobile}>
                  Hi man
                </DefaultBotMessage>
                <DefaultUserMessage isMobile={isMobile}>
                  Howdy?
                </DefaultUserMessage>
              </div>
            </BranchContainer>
          </div>
        </main>
      </div>
    </>
  );
}

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
