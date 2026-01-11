"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
// import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function AuthDialogClient(props) {
  //   console.log("props", props);

  return (
    <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
      <DialogContent className="sm:w-1/2 rounded-xl">
        <DialogHeader>
          <DialogTitle className="mx-auto mb-4">Please Sign In</DialogTitle>
          <DialogDescription className="flex flex-col gap-y-2">
            {/* {Object.values(pm).map((provider, i) => (
              <InlineAuthButton provider={provider} key={i} />
            ))} */}
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
