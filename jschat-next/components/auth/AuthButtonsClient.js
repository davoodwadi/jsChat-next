"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function SignButton(props) {
  const [loading, setLoading] = useState(false);

  // console.log("loading", loading);
  const clientSignAction = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await props.authFunction();
    } catch (error) {
      console.error("Sign-in failed:", error);
      // Handle error (e.g., show a message to the user)
    } finally {
      setLoading(false); // Reset loading state
      // console.log("loading set to false");
    }
  };
  return (
    <form className="flex" onSubmit={clientSignAction}>
      <Button className="mx-auto" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> {props.authText}
          </>
        ) : (
          props.authText
        )}
      </Button>
    </form>
  );
}
