"use client";

import { useState } from "react";
export function Generate() {
  const [message, setMessage] = useState("");
  async function getLLM(e) {
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/chattest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "system" }],
          model: "claude-3-5-sonnet-latest",
          //   email: authStatus,
        }),
      }
    );
    const reader = data.body.getReader();
    const decoder = new TextDecoder();
    let tempChunks = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      tempChunks = chunk ? tempChunks + chunk : tempChunks;
      setMessage(tempChunks);
    }
  }

  return (
    <div>
      <button onClick={(e) => getLLM(e)}>Generate</button>
      <p>message: {message}</p>
    </div>
  );
}
