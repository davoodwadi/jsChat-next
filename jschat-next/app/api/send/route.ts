import {
  EmailTemplate,
  SpreedVerifyIdentityEmail,
} from "@/components/EmailTemplate";
import { type NextRequest } from "next/server";
import { Resend } from "resend";
import { v4 as uuid } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log(body);
  return Response.json({ body }, { status: 200 });

  try {
    const { data, error } = await resend.emails.send({
      from: "Spreed.chat Authentication <verify@account.spreed.chat>",
      //   from: "verify@account.spreed.chat",
      to: ["wadidavood@gmail.com", "v_peikareh@yahoo.com"],
      subject: "Welcome to Spreed.chat",
      react: SpreedVerifyIdentityEmail({ validationCode: "1234" }),
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
