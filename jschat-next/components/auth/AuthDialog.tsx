"use client";

import { providerMap } from "@/auth.config";
import { signInClientAction } from "@/lib/actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";

type Provider = {
  id: string;
  name: string;
};

const InlineAuthButton: React.FC<{ provider: Provider }> = ({ provider }) => {
  const [loading, setLoading] = useState(false);
  const icon = provider.id === "google" ? faGoogle : faGithub;
  return (
    <Button
      className="flex flex-row "
      onClick={() => {
        setLoading(true);
        signInClientAction({ providerId: provider.id });
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" /> Sign in with {provider.name}
          <FontAwesomeIcon icon={icon} />
        </>
      ) : (
        <>
          Sign in with {provider.name} <FontAwesomeIcon icon={icon} />
        </>
      )}
    </Button>
  );
};

type AuthDialogProps = React.ComponentPropsWithoutRef<typeof Dialog> & {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthDialog: React.FC<AuthDialogProps> = (props) => {
  return (
    <>
      <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
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
};
