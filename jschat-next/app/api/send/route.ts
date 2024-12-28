import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";
import { v4 as uuid } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Spreed.chat Authentication <verify@account.spreed.chat>",
      //   from: "verify@account.spreed.chat",
      to: ["wadidavood@gmail.com"],
      subject: "Welcome to Spreed.chat",
      react: EmailTemplate({ firstName: "John" }),
      headers: {
        "X-Entity-Ref-ID": uuid(),
      },
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
