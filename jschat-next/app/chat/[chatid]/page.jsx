import ChatClient from "./ChatClient";
import { getBookmarkStatus } from "@/lib/save/saveActions";

export default async function ChatServer({ params }) {
  const p = await params;
  // console.log("p", p);
  const bookmarked = await getBookmarkStatus({ chatId: p.chatid });
  // console.log("rendering chat [chatid]");
  return <ChatClient chatId={p.chatid} bookmarked={bookmarked} />;
}
