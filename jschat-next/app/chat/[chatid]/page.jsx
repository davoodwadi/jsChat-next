import ChatClient from "./ChatClient";
import { getBookmarkStatus } from "@/lib/save/saveActions";
import { auth } from "@/auth";

export default async function ChatServer({ params }) {
  const p = await params;

  const session = await auth();
  const email = session?.user?.email;
  // console.log("email", email);
  // console.log("p", p);
  const bookmarked = await getBookmarkStatus({ chatId: p.chatid });
  // console.log("rendering chat [chatid]");
  return <ChatClient chatId={p.chatid} bookmarked={bookmarked} email={email} />;
}
