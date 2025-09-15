import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Star, Trash, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import HistoryItemActive from "./HistoryItemActive";

export default async function HistoryItem({
  item,
  snippet,
  isCanvas,
  bookmarked,
}) {
  return (
    <SidebarMenuItem>
      {/* Use TooltipProvider at a higher level if you have many tooltips */}
      <div className="relative flex items-center group/item">
        <HistoryItemActive
          isCanvas={isCanvas}
          snippet={snippet}
          item={item}
          bookmarked={bookmarked}
        />

        {/* Direct Actions Container */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
          {/* Bookmark Action */}
          <Tooltip>
            <TooltipTrigger asChild>
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
                  className={cn(
                    "h-5 w-5 glass-button",
                    bookmarked && "glass-button-yellow-enabled"
                  )}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </form>
            </TooltipTrigger>
            <TooltipContent className="glass-tooltip text-zinc-800 dark:text-zinc-200">
              <p>{bookmarked ? "Unbookmark" : "Bookmark"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <form
                action={async () => {
                  "use server";
                  console.log("deleting");
                  await deleteChatSession({ chatId: item.chatid });
                  console.log("DONE deleting");
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  className="h-5 w-5 glass-button hover:!bg-red-500/20 hover:text-red-500"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </form>
            </TooltipTrigger>
            <TooltipContent className="glass-tooltip  text-zinc-800 dark:text-zinc-200">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

// export default async function HistoryItem({
//   item,
//   snippet,
//   isCanvas,
//   bookmarked,
// }) {
//   //   console.log("bookmarked", bookmarked);
//   //   console.log("item.chatid", item.chatid);
//   return (
//     <SidebarMenuItem>
//       <div className="relative flex items-center group/item">
//         <HistoryItemActive
//           isCanvas={isCanvas}
//           snippet={snippet}
//           item={item}
//           bookmarked={bookmarked}
//         />

//         {/* Actions menu */}
//         <div className=" absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100  transition-opacity">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-7 w-7 p-0 rounded-md group-hover/item:bg-black/10"
//                 title="More actions"
//               >
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               align="end"
//               className="!min-w-0 glass-button-noise p-1 "
//             >
//               <DropdownMenuItem className="p-0 focus:bg-transparent">
//                 {/* Bookmark toggle */}
//                 <form
//                   className="w-full"
//                   action={async () => {
//                     "use server";
//                     await toggleBookmarkChatSession({ chatId: item.chatid });
//                   }}
//                 >
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     type="submit"
//                     // className="w-full text-left flex items-center "
//                     className={cn(
//                       "w-full h-auto px-2 py-1.5 justify-start gap-2 rounded-md font-normal",
//                       "hover:bg-white/10 dark:hover:bg-white/10",
//                       bookmarked && "text-yellow-600" // Simple color change
//                     )}
//                   >
//                     <Star
//                       // className={` h-4 w-4 ${bookmarked ? "text-yellow-500 fill-current" : ""}`}
//                       className={cn(
//                         "h-4 w-4",
//                         bookmarked && "fill-yellow-600" // Fill when bookmarked
//                       )}
//                     />
//                     {bookmarked ? "Unbookmark" : "Bookmark"}
//                   </Button>
//                 </form>
//               </DropdownMenuItem>

//               <DropdownMenuItem className="p-0 focus:bg-transparent">
//                 {/* Delete chat */}
//                 <form
//                   className="w-full"
//                   action={async () => {
//                     "use server";
//                     await deleteChatSession({ chatId: item.chatid });
//                   }}
//                 >
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     type="submit"
//                     // className="w-full text-left flex items-center "
//                     className="w-full h-auto px-2 py-1.5 justify-start gap-2 rounded-md font-normal text-red-700/70 hover:text-red-500 hover:!bg-red-500/10"
//                   >
//                     <Trash className=" h-4 w-4" />
//                     Delete
//                   </Button>
//                 </form>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </SidebarMenuItem>
//   );
// }
