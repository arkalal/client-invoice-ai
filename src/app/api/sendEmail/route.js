import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    const { email, subject, body } = await req.json();

    const message = {
      to: email,
      from: "arkalal.chakravarty@gmail.com",
      subject: subject,
      text: body,
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

    sgMail
      .send(message)
      .then(() => {
        return NextResponse.json(
          { message: "Email is sent successfully" },
          { status: 200 }
        );
      })
      .catch(async (error) => {
        console.log(error);

        return NextResponse.json(
          { message: "Failed sending email" },
          { status: 400 }
        );
      });

    return NextResponse.json(
      { message: "Email is sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
  }
}
