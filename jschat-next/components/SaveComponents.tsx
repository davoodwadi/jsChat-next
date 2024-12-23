"use client";

import { SaveButtonsTooltip } from "@/components/SaveButtonsTooltip";
import { HardDriveUpload, Save, RotateCcw } from "lucide-react";

import * as React from "react";

// function resetInterface(setUserMessages, setBotMessages) {
//   const newglobalIdUser = 1;
//   setGlobalUserId(newglobalIdUser);
//   setGlobalBotId(0);
//   setUserMessages((m) => [
//     { key: [1], content: "", role: "user", globalIdUser: newglobalIdUser },
//   ]);
//   setBotMessages((m) => []);
//   console.log("interface reset");
// }

export default function SaveItems() {
  const elements = [
    { Element: HardDriveUpload, text: "Load", onClickFn: () => {} },
    { Element: Save, text: "Save", onClickFn: () => {} },
    { Element: RotateCcw, text: "Reset Interface", onClickFn: () => {} },
  ];
  return (
    <div className="flex flex-row mx-auto mt-2">
      <SaveButtonsTooltip elements={elements} />
    </div>
  );
}
