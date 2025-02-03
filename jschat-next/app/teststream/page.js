"use client";

import { Textarea } from "@/components/ui/textarea";
import { handleTestDummy } from "@/lib/chatUtils";
import { useState, useEffect } from "react";

export default function Page() {
  const [text, setText] = useState("");
const [duration, setDuration] = useState(80)
  return (
    <>
    <input onChange={e => setDuration(e.target.value)} defaultValue={duration}/>
      <button
        onClick={() => {
          // handleTestDummy(setText);
          console.log('clicked')
          getStreamDummy(setText, duration)
        }}
      >
        
        generate
      </button>
      <div className="">{text}</div>
    </>
  );
}


async function getStreamDummy(setText, duration){
  console.log('process.env.NEXT_PUBLIC_BASE_URL', process.env.NEXT_PUBLIC_BASE_URL)
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Davood", duration: duration })
  });
  const reader = data.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    // console.log('Received chunk:', chunk);

    result += '         '+chunk; // Append the chunk to the result
    setText(result)
  }
}