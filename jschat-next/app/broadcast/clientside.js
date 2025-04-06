"use client";
import { Button } from "@/components/ui/button";
import { getEmails } from "./getEmailsAction";

export function GetEmailButton() {
  return <Button onClick={getEmails}>Get emails</Button>;
}
