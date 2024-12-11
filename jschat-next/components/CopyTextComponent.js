"use client";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
export default function CopyText(props) {
  const [hasCopied, setHasCopied] = useState(false);
  // console.log("hasCopied", hasCopied);
  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  }, [hasCopied]);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(props.text);
        // Optional: display success message or update state
        setHasCopied(true);
      }}
    >
      {hasCopied ? (
        <FontAwesomeIcon icon={faCheck} />
      ) : (
        <FontAwesomeIcon icon={faCopy} />
      )}
    </button>
  );
}
