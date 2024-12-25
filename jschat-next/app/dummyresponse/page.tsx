"use client";

import { useEffect, useState } from "react";
import { generateDummmy } from "@/lib/actions";
import { handleDummy } from "@/lib/chatUtils";

export default function Page() {
  const [text, setText] = useState("");

  //   useEffect(() => {
  //     const updateText = async () => {
  //       const updatedText = await generateDummmy();
  //       const reader = updatedText.getReader();
  //       const decoder = new TextDecoder("utf-8");

  //       // Read the stream
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) break; // Exit the loop if the stream is done

  //         // Decode the chunk and append it to the result
  //         // result += decoder.decode(value, { stream: true });
  //         const fetchedText = decoder.decode(value, { stream: true });
  //         setText((t) => t + fetchedText);
  //         console.log("Received chunk:", fetchedText);
  //       }
  //     };

  //     updateText();
  //   }, []);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          handleDummy({ setText });
        }}
      >
        generateDummmy
      </button>
      {text}
    </div>
  );
}
