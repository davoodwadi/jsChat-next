"use server";

import { signOut, signIn } from "@/auth";

const signinAction = async () => {
  // Simulate an API call or some processing
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate a 2-second delay
  // await signIn("google")
  await signIn({ redirectTo: "/" });
};
const signoutAction = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate a 2-second delay

  await signOut({ redirectTo: "/" });
};

export { signinAction, signoutAction };
