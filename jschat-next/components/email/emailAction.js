"use server";

import { Resend } from "resend";
import { SpreedVerifyIdentityEmail } from "@/components/email/EmailTemplate";
import { render } from "@react-email/render";
import { v4 as uuid } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);
const dummy =
  process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000" ? true : false;
export async function sendPaymentEmail({
  status,
  sessionId,
  tokensRemaining,
  email,
  date,
  time,
  currency,
  amount,
}) {
  // console.log("status", status);
  // console.log("sessionId", sessionId);
  // console.log("tokensRemaining", tokensRemaining);
  // console.log("email", email);
  // console.log("date", date);
  const emailFinal = dummy ? "delivered@resend.dev" : email;
  const text = await render(
    <SpreedVerifyIdentityEmail
      status={status}
      tokensRemaining={tokensRemaining}
      email={emailFinal}
      time={time.replace(/\./g, "")}
      sessionId={sessionId}
      date={date}
      amount={amount}
      currency={currency.toUpperCase()}
    />,
    {
      plainText: true,
    }
  );

  // console.log(text);
  // return;

  const { data, error } = await resend.emails.send({
    from: "Spreed.chat Payment <payment@account.spreed.chat>",
    to: emailFinal,
    subject: "Transaction Details - Spreed.chat",
    react: (
      <SpreedVerifyIdentityEmail
        status={status}
        tokensRemaining={tokensRemaining}
        email={emailFinal}
        sessionId={sessionId}
        date={date}
        time={time.replace(/\./g, "")}
        amount={amount}
        currency={currency.toUpperCase()}
      />
    ),
    text: text,
    headers: {
      "X-Entity-Ref-ID": uuid(),
    },
  });
  if (error) {
    console.log("error", error);
  } else {
    console.log("data", data);
  }
  return data;
}
