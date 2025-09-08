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
import { MultilineGlassSkeleton } from "../ui/glassSkeleton";
import { ClearChatHistoryButton } from "@/components/layout/ClearChatHistoryButton";
import HistoryItem from "./HistoryItem";
import { Suspense } from "react";
const getChatHistory = async () => {
  // console.log("ChatHistory loading");
  const result = await loadAllChatSessions();
  if (result) {
    return result;
  } else {
    return null;
  }
};
export default async function NavigationEvents() {
  const chatHistory = await getChatHistory();
  const chatHistoryTrue =
    chatHistory !== undefined &&
    Array.isArray(chatHistory) &&
    chatHistory.length > 0;

  // console.log("NavigationEvents rerendered");
  return (
    <Suspense
      fallback={
        <div className="w-3/4 mx-auto">
          <MultilineGlassSkeleton lines={10} />
        </div>
      }
    >
      <>
        <SidebarGroup>
          <SidebarGroupLabel className="">
            <div className="flex flex-row justify-between w-full items-center pb-8">
              <div>History</div>
              <div>
                <ClearChatHistoryButton />
              </div>
            </div>
          </SidebarGroupLabel>
          {chatHistoryTrue ? (
            <SidebarGroupContent>
              <SidebarMenu className="glass-card-noise">
                {chatHistory.map((item, i) => {
                  // console.log("item", item);
                  const userMessageArray = item?.content?.userMessages;
                  const bookmarked = item?.bookmarked;
                  const isCanvas = !Array.isArray(userMessageArray);

                  let snippet;

                  if (!isCanvas) {
                    const snippetArray = userMessageArray.map((m) =>
                      typeof m.content === "string"
                        ? m.content
                        : m.content?.text
                          ? m.content?.text
                          : null
                    );
                    snippet = snippetArray.join("...");
                  } else {
                    snippet = item?.content?.canvasText;
                  }
                  return (
                    <HistoryItem
                      key={i}
                      item={item}
                      snippet={snippet}
                      isCanvas={isCanvas}
                      bookmarked={bookmarked}
                    />
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          ) : (
            <></>
          )}
        </SidebarGroup>
        {/* {chatHistoryTrue && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <ClearChatHistoryButton />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )} */}
      </>
    </Suspense>
  );
}
