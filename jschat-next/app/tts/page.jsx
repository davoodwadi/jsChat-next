"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownComponent from "@/components/MarkdownComponent";
import { TTS } from "@/components/TTS";

export default function Page() {
  const text = `# We also create data- attributes for each option

## containing

the name and language of the associated voice,
so we can grab them easily later on, and then append the options as children of the select.`;
  const refRenderedText = useRef(null);
  const [textToSpeak, setTextToSpeak] = useState();

  useEffect(() => {
    if (refRenderedText.current) {
      setTextToSpeak(refRenderedText.current.textContent);
    }
  }, [refRenderedText.current]);
  return (
    <>
      <MarkdownComponent ref={refRenderedText}>{text}</MarkdownComponent>
      <TTS text={textToSpeak} />
    </>
  );
}
