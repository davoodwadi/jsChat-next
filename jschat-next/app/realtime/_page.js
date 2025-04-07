"use client";

import React, { useEffect, useRef, useState } from "react";
import { AudioLines } from "lucide-react";

export default function Page() {
  const LLMResponsePlayer = useRef(null);
  const [audioUrlLLM, setAudioUrlLLM] = useState(null);
  useEffect(() => {
    const fetchAndStreamAudio = async () => {
      // STEP 1: Create MediaSource and object URL
      const mediaSource = new MediaSource();
      const objectUrl = URL.createObjectURL(mediaSource);
      LLMResponsePlayer.current.src = objectUrl;

      // STEP 2: Open source buffer and start streaming
      mediaSource.addEventListener("sourceopen", async () => {
        const mimeCodec = "audio/mpeg"; // Or use "audio/webm; codecs=opus" etc. if your audio format differs
        const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

        const response = await fetch("/api/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: "Hello!" }),
        });

        if (!response.ok || !response.body) {
          console.error("Fetch failed:", response.statusText);
          return;
        }

        const reader = response.body.getReader();

        let receivedFirstChunk = false;

        const pump = async () => {
          const { value, done } = await reader.read();
          if (done) {
            mediaSource.endOfStream();
            return;
          }

          // Wait for current buffer to be ready
          if (sourceBuffer.updating) {
            await new Promise((resolve) =>
              sourceBuffer.addEventListener("updateend", resolve, {
                once: true,
              })
            );
          }

          try {
            sourceBuffer.appendBuffer(value);
          } catch (e) {
            console.error("appendBuffer failed", e);
          }

          // Start playback after first valid chunk
          if (!receivedFirstChunk) {
            // LLMResponsePlayer.current.play().catch(console.error);
            receivedFirstChunk = true;
          }

          pump(); // Read next chunk
        };

        pump();
      });
    };

    fetchAndStreamAudio();

    // Cleanup
    return () => {
      if (LLMResponsePlayer.current?.src) {
        URL.revokeObjectURL(LLMResponsePlayer.current.src);
      }
    };
  }, []);

  return (
    <div>
      <AudioRecorder />
      <audio
        controls
        ref={LLMResponsePlayer}
        src={audioUrlLLM}
        className="bg-white"
      />
    </div>
  );
}

const GetFullAudio = async () => {
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "audio/mpeg",
    },
    body: JSON.stringify({
      message: "Hello",
    }),
  });
  if (!data.ok) {
    throw new Error("data not ok");
  }
  const blob = await data.blob();
  console.log("CLIENT blob", blob);
  const url = URL.createObjectURL(blob);
  console.log("CLIENT url", url);
  // setAudioUrlLLM(url);
};

function AudioRecorder() {
  // Create a peer connection
  //   const pc = new RTCPeerConnection();

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    const test = stream.getTracks()[0];
    console.log("test", test);

    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      //   console.log("url", url);
      setAudioURL(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Audio Recorder</h2>

      {!recording ? (
        <button
          onClick={startRecording}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          <AudioLines />
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          <AudioLines />
        </button>
      )}

      {audioURL && (
        <div className="mt-4">
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
}
