"use client";

import { handleTestDummy } from "@/lib/chatUtils";
import { useState, useEffect } from "react";

export default function Page() {
  const [text, setText] = useState("");

  return (
    <>
      <button
        onClick={() => {
          // handleTestDummy(setText);
          console.log('clicked')
          getStreamDummy(setText)
        }}
      >
        generate
      </button>
      <div>{text}</div>
    </>
  );
}


async function getStreamDummy(setText){
  console.log('process.env.NEXT_PUBLIC_BASE_URL', process.env.NEXT_PUBLIC_BASE_URL)
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`)
  const reader = data.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    // console.log('Received chunk:', chunk);

    result += chunk; // Append the chunk to the result
    setText(result)
  }
}