"use server";

import { Resend } from "resend";
import { SpreedVerifyIdentityEmail } from "@/components/email/EmailTemplate";
import { render } from "@react-email/render";
import { v4 as uuid } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const text = await render(
    <SpreedVerifyIdentityEmail
      status={status}
      currentTokens={tokensRemaining}
      email={email}
      time={time}
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
    to: email,
    subject: "Transaction Details - Spreed.chat",
    react: (
      <SpreedVerifyIdentityEmail
        status={status}
        currentTokens={tokensRemaining}
        email={email}
        sessionId={sessionId}
        date={date}
        time={time}
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
