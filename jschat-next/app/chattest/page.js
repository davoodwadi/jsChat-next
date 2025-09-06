import { Card } from "@/components/ui/card"; // shadcn card example

export default function ChatWindow() {
  return (
    <Card
      className="
        h-[600px] w-full max-w-2xl mx-auto
        flex flex-col
        bg-white/10 
        backdrop-blur-xl 
        border border-white/20 
        shadow-xl 
        rounded-2xl
        overflow-hidden
      "
    >
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="self-start max-w-[80%] p-3 bg-white/20 backdrop-blur-md rounded-xl">
          <p className="text-white text-sm">Hello! How can I help you today?</p>
        </div>

        <div className="self-end max-w-[80%] p-3 bg-cyan-500/30 backdrop-blur-md rounded-xl">
          <p className="text-white text-sm">
            I want to create a glassmorphic UI.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/20 bg-white/5 backdrop-blur-md">
        <input
          placeholder="Type a message..."
          className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md placeholder-white/70 text-white outline-none border border-white/20"
        />
      </div>
    </Card>
  );
}

// import { Generate } from "./client";

// export default function ChatTest() {
//   return (
//     <div>
//       <Generate />
//     </div>
//   );
// }
