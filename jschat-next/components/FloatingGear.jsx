"use client";

import { useState } from "react";
import { Settings, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function FloatingSettingsButtonInner({ systemPrompt, setSystemPrompt }) {
  const [open, setOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState("");

  const handleConfirm = () => {
    setSystemPrompt(tempSystemPrompt);
    setOpen(false);
  };

  return (
    <>
      {/* Floating Glass Settings Button */}
      <Button
        title={"System Prompt"}
        key="sys"
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="group flex w-max items-center gap-3 w-10 h-10 px-4 py-2 rounded-full shadow-lg backdrop-blur-lg transition-all hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Settings className={`h-5 w-5 `} />
      </Button>

      {/* Glass Settings Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay className="backdrop-blur-md bg-black/20 dark:bg-black/40" />
        <DialogContent
          className="glass-dialog glass-dialog-noise p-0"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "90vh",
            width: "90vw",
            maxWidth: "500px",
            margin: 0,
            zIndex: 100,
          }}
        >
          {/* <div className="glass-overlay" /> */}

          <div
            className="relative z-10 p-6"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <DialogHeader className="pb-6">
              <DialogTitle className="text-lg font-medium text-black/60 dark:text-white/60">
                System Prompt
              </DialogTitle>
              <p className="text-sm text-black/30 dark:text-black/50 dark:text-white/50 mt-1">
                {"Configure the assistant's behavior"}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                value={tempSystemPrompt}
                onChange={(e) => setTempSystemPrompt(e.target.value)}
                placeholder={
                  "Enter your system prompt to define the AI's behavior, tone, and expertise..."
                }
                className="min-h-[160px] glass-input resize-none text-sm leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-6 ">
              <div className="flex items-center mx-auto gap-4">
                <Button
                  variant="ghost"
                  title="Cancel"
                  onClick={() => {
                    setOpen(false);
                    setTempSystemPrompt("");
                  }}
                  className=" glass-button glass-button-noise !rounded-full w-8 h-8 p-0 "
                >
                  <X className="h-4 w-4 " />
                </Button>
                <Button
                  variant="ghost"
                  title="Confirm"
                  onClick={handleConfirm}
                  className=" glass-button !rounded-full w-8 h-8 p-0"
                >
                  <Check className="h-4 w-4 " />
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FloatingSettingsButton({ systemPrompt, setSystemPrompt }) {
  const [open, setOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState("");

  const handleConfirm = () => {
    setSystemPrompt(tempSystemPrompt);
    setOpen(false);
  };

  return (
    <>
      {/* Floating Glass Settings Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 glass-floating group"
      >
        <Settings className="h-5 w-5 text-foreground/60 group-hover:text-foreground/80 transition-colors duration-200" />
      </Button>

      {/* Glass Settings Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay className="backdrop-blur-md bg-black/20 dark:bg-black/40" />
        <DialogContent
          className="glass-dialog glass-dialog-noise p-0"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "90vh",
            width: "90vw",
            maxWidth: "500px",
            margin: 0,
            zIndex: 100,
          }}
        >
          {/* <div className="glass-overlay" /> */}

          <div
            className="relative z-10 p-6"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <DialogHeader className="pb-6">
              <DialogTitle className="text-lg font-medium text-black/60 dark:text-white/60">
                System Prompt
              </DialogTitle>
              <p className="text-sm text-black/30 dark:text-black/50 dark:text-white/50 mt-1">
                {"Configure the assistant's behavior"}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                value={tempSystemPrompt}
                onChange={(e) => setTempSystemPrompt(e.target.value)}
                placeholder={
                  "Enter your system prompt to define the AI's behavior, tone, and expertise..."
                }
                className="min-h-[160px] glass-input resize-none text-sm leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-6 ">
              <div className="flex items-center mx-auto gap-4">
                <Button
                  variant="ghost"
                  title="Cancel"
                  onClick={() => {
                    setOpen(false);
                    setTempSystemPrompt("");
                  }}
                  className=" glass-button glass-button-noise !rounded-full w-8 h-8 p-0 "
                >
                  <X className="h-4 w-4 " />
                </Button>
                <Button
                  variant="ghost"
                  title="Confirm"
                  onClick={handleConfirm}
                  className=" glass-button !rounded-full w-8 h-8 p-0"
                >
                  <Check className="h-4 w-4 " />
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
