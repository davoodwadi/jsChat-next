"use client";

import React, { useState, useEffect, useRef } from "react";

import { Volume2, Pause, Play } from "lucide-react";

export function TTS({ text }) {
  const [voices, setVoices] = useState([]);
  const [speakStatus, setSpeakStatus] = useState("not started");
  const [windowLoaded, setWindowLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const populateVoiceList = () => {
        const voicesList = synth.getVoices();
        setVoices(voicesList);
      };

      populateVoiceList();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
      }
      // Voices may not be immediately available
      setWindowLoaded(true);
    }
    return () => {
      const synth = window.speechSynthesis;
      synth.cancel(); // This stops any lingering utterances
    };
  }, []);

  const handleSpeakToggle = (text) => {
    const synth = window.speechSynthesis;
    const voicesList = synth.getVoices();
    const availableVoices = (voicesList?.length ? voicesList : voices) || [];
    // console.log("availableVoices", availableVoices);

    if (speakStatus === "speaking") {
      synth.pause();
      setSpeakStatus("paused");
    } else if (speakStatus === "paused") {
      synth.resume();
      setSpeakStatus("speaking");
    } else if (speakStatus === "not started") {
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => setSpeakStatus("not started");
      const preferredVoice = availableVoices.find(
        (v) => v.name.includes("Natural") && v.lang.startsWith("en")
      );
      if (preferredVoice) {
        u.voice = preferredVoice;
        console.log("preferredVoice", preferredVoice);
      }
      synth.cancel();
      synth.speak(u);
      setSpeakStatus("speaking");
    } else {
      console.log("unknown speakStatus", speakStatus);
    }
  };

  return (
    <button disabled={!windowLoaded} onClick={(e) => handleSpeakToggle(text)}>
      {!windowLoaded ? (
        <></>
      ) : speakStatus === "speaking" ? (
        <Pause size={16} />
      ) : speakStatus === "not started" ? (
        <Volume2 size={16} />
      ) : (
        <Play size={16} />
      )}
    </button>
  );
}
