import { NextResponse } from "next/server";
import OpenAI from "openai";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt, images } = await req.json();

    if (!prompt) {
      return NextResponse.json({ message: "prompt required" }, { status: 401 });
    }

    const response = await openAi.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content:
            "So you are a product categorization bot. You will get the images of the invoices in spanish and categorize the products purchased based on this parameter : 'currency', 'products', 'subtotal', 'discount', 'tax', 'totalDue' and under the 'products' take this parameter: 'name', 'quantity', 'unitPrice', 'totalPrice' and give the response to the user in english language. Do not say anything else just give them the data thats it.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: images,
            },
          ],
        },
      ],
      temperature: 0.9,
      max_tokens: 1000,
    });

    return NextResponse.json(response.choices[0].message.content);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
