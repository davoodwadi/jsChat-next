"use client";

// import { redirect } from "next/navigation";
// import { signIn, auth } from "@/auth";
import { providerMap } from "@/auth.config";
import { AuthError } from "next-auth";
import Image from "next/image";
import { signInClientAction } from "@/lib/actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";

function InlineAuthButton({ provider }) {
  const [loading, setLoading] = useState(false);
  const icon = provider.id === "google" ? faGoogle : faGithub;
  return (
    <Button
      className="flex flex-row "
      //   type="submit"
      onClick={() => {
        setLoading(true);
        signInClientAction({ providerId: provider.id });
        // setLoading(false);
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" /> Sign in with {provider.name}
          <FontAwesomeIcon icon={icon} />
          {/* <Image
            src={`${provider.id}.svg`}
            alt="GitHub Logo"
            width={20} // Set the desired width
            height={20} // Set the desired height
            className=" ml-2"
            //   priority
          /> */}
        </>
      ) : (
        <>
          Sign in with {provider.name} <FontAwesomeIcon icon={icon} />
        </>
      )}
    </Button>
  );
}

export function AuthDialog(props) {
  console.log("AuthDialog initiated");
  return (
    <>
      <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
        {/* <DialogTrigger>Open</DialogTrigger> */}
        <DialogContent className="sm:w-1/2 rounded-xl">
          <DialogHeader>
            <DialogTitle className="mx-auto mb-4">Please Sign In</DialogTitle>
            <DialogDescription className="flex flex-col gap-y-2">
              {Object.values(providerMap).map((provider, i) => (
                <InlineAuthButton provider={provider} key={i} />
              ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
