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
import { ClearChatHistoryButton } from "@/components/layout/ClearChatHistoryButton";

export default function HistoryButton() {
  //   console.log("HistoryButton Rendered");
  return (
    <SidebarGroupLabel className="">
      <div className="flex flex-row justify-between w-full items-center pb-8">
        <div>History</div>
        <div>
          <ClearChatHistoryButton />
        </div>
      </div>
    </SidebarGroupLabel>
  );
}
