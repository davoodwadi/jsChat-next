import { SpreedVerifyIdentityEmail } from "@/components/EmailTemplate";
import { sendEmail } from "@/lib/actions";
export default async function Page() {
  const status = "success";
  const sessionId =
    "cs_test_a1NVAQEWmfi82hjWE9iDLPbwZRLy2IZ8Mj1vOyOi0vEDPx7UvYxllwmvf5";
  const tokensRemaining = 20000;
  const email = "delivered@resend.dev";
  const dateObject = new Date();
  const date = dateObject.toDateString() + " " + dateObject.toTimeString();
  const amount = 499;
  const currency = "usd";
  await sendEmail({
    status: status,
    sessionId: sessionId,
    tokensRemaining: tokensRemaining,
    email: email,
    date: date,
    amount: amount,
    currency: currency.toUpperCase(),
  });
  return (
    <SpreedVerifyIdentityEmail
      currentTokens={tokensRemaining}
      status={status}
      email={email}
      sessionId={sessionId}
      date={date}
      amount={amount}
      currency={currency.toUpperCase()}
    />
  );
}
