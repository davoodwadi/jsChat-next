import { loadAllChatSessions } from "@/lib/save/saveActions";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import HistoryItem from "./HistoryItem";

const getChatHistory = async () => {
  // console.log("ChatHistory loading");
  const result = await loadAllChatSessions();
  if (result) {
    return result;
  } else {
    return null;
  }
};
let chatHistoryTrue = false;
export default async function ChatHistory() {
  //   console.log("STARTED ChatHistory");
  const chatHistory = await getChatHistory();
  chatHistoryTrue =
    chatHistory !== undefined &&
    Array.isArray(chatHistory) &&
    chatHistory.length > 0;
  //   console.log("FINISHED ChatHistory");

  if (chatHistoryTrue) {
    return (
      <SidebarGroupContent>
        <SidebarMenu className="">
          {chatHistory.map((item, i) => {
            // console.log("item", item);
            // const userMessageArray = item?.content?.userMessages;
            const bookmarked = item?.bookmarked;
            const isCanvas = !item?.chatid;
            // const isCanvas = !Array.isArray(userMessageArray);
            const snippet = item?.snippet ? item.snippet : "";
            // let snippet;

            // if (!isCanvas) {
            //   const snippetArray = userMessageArray.map((m) =>
            //     typeof m.content === "string"
            //       ? m.content
            //       : m.content?.text
            //         ? m.content?.text
            //         : null
            //   );
            //   snippet = snippetArray.join("...");
            // } else {
            //   snippet = item?.content?.canvasText;
            // }
            return (
              <HistoryItem
                key={item.chatid}
                item={item}
                snippet={snippet}
                isCanvas={isCanvas}
                bookmarked={bookmarked}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    );
  } else {
    return <></>;
  }
}
