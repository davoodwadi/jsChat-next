"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, Settings, Check } from "lucide-react";
import { Button } from "./ui/button";
// import { FloatingSettingsButtonInner } from "@/components/FloatingGear";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
export function FloatingActionMenu({
  elements,
  systemPrompt,
  setSystemPrompt,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState("");
  const handleConfirmSystemPrompt = () => {
    setSystemPrompt(tempSystemPrompt);
    setDialogOpen(false);
  };

  const menuRef = useRef(null);

  // Close the menu if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div ref={menuRef} className="relative flex items-center justify-center">
      {/* This div holds the menu items and will be shown/hidden */}
      {isOpen && (
        <div className="absolute bottom-full mb-4 flex flex-col items-end gap-3">
          <>
            {elements.map((item, index) => {
              // Conditionally render the bookmark star based on its enabled state
              const Icon = item.Element;
              // console.log("Icon", Icon);
              const isBookmarked = item.text === "Bookmark" && item.enabled;

              return (
                <Button
                  title={item.text}
                  variant={"ghost"}
                  key={index}
                  onClick={() => {
                    item.onClickFn();
                    setIsOpen(false); // Close menu after click
                  }}
                  disabled={item.loading}
                  className="group flex w-max items-center gap-3 w-10 h-10 px-4 py-2 rounded-full shadow-lg backdrop-blur-lg transition-all hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {/* <span className="text-sm font-medium transition-colors group-hover:text-white"> */}
                  {/* {"Icon"} */}
                  {/* </span> */}
                  <Icon
                    className={`h-5 w-5 ${isBookmarked ? "fill-yellow-200 text-yellow-400" : ""}`}
                  />
                </Button>
              );
            })}
          </>
          {/* Floating Glass Settings Button START*/}
          <Button
            title={"System Prompt"}
            key="sys"
            size="icon"
            variant="ghost"
            onClick={() => setDialogOpen(true)}
            className="group flex w-max items-center gap-3 w-10 h-10 px-4 py-2 rounded-full shadow-lg backdrop-blur-lg transition-all hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Settings className={`h-5 w-5 `} />
          </Button>
          {/* Floating Glass Settings Button END*/}
        </div>
      )}

      {/* This is the main Floating Action Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center glass-floating group  active:scale-95"
        aria-label="Open actions menu"
      >
        {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
      </Button>

      {/* dialog for system prompt */}
      {/* Glass Settings Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    setDialogOpen(false);
                    setTempSystemPrompt("");
                  }}
                  className=" glass-button glass-button-noise !rounded-full w-8 h-8 p-0 "
                >
                  <X className="h-4 w-4 " />
                </Button>
                <Button
                  variant="ghost"
                  title="Confirm"
                  onClick={handleConfirmSystemPrompt}
                  className=" glass-button !rounded-full w-8 h-8 p-0"
                >
                  <Check className="h-4 w-4 " />
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
