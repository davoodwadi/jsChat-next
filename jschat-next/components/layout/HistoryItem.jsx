import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Star, Trash, MoreHorizontal } from "lucide-react";
import {
  toggleBookmarkChatSession,
  deleteChatSession,
} from "@/lib/save/saveActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import HistoryItemActive from "./HistoryItemActive";

export default async function HistoryItem({
  item,
  snippet,
  isCanvas,
  bookmarked,
}) {
  //   console.log("bookmarked", bookmarked);
  //   console.log("item.chatid", item.chatid);
  return (
    <SidebarMenuItem>
      <div className="relative flex items-center group">
        <HistoryItemActive
          isCanvas={isCanvas}
          snippet={snippet}
          item={item}
          bookmarked={bookmarked}
        />

        {/* Actions menu */}
        <div className=" absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                title="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="!min-w-0 glass-button-noise"
            >
              <DropdownMenuItem>
                {/* Bookmark toggle */}
                <form
                  action={async () => {
                    "use server";
                    await toggleBookmarkChatSession({ chatId: item.chatid });
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    className="w-full text-left flex items-center "
                  >
                    <Star
                      className={` h-4 w-4 ${bookmarked ? "text-yellow-500 fill-current" : ""}`}
                    />
                    {/* {bookmarked ? "Unbookmark" : "Bookmark"} */}
                  </Button>
                </form>
              </DropdownMenuItem>

              <DropdownMenuItem>
                {/* Delete chat */}
                <form
                  action={async () => {
                    "use server";
                    await deleteChatSession({ chatId: item.chatid });
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    className="w-full text-left flex items-center "
                  >
                    <Trash className=" h-4 w-4" />
                    {/* Delete */}
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </SidebarMenuItem>
  );
}
