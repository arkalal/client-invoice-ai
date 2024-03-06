import { NextResponse } from "next/server";
import OpenAI from "openai";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
  {
    name: "send_email",
    description: "Send an email to a user",
    parameters: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description:
            "The email address of the recipient. You should always ask the user if you don't know the email address.",
        },
        subject: {
          type: "string",
          description: "The subject of the email",
        },
        body: {
          type: "string",
          description: "The body of the email.",
        },
      },
      required: ["email", "subject", "body"],
    },
  },
  {
    name: "search_invoices",
    description:
      "Use this function whenever the user asks any information about products, prices or currency that are in the invoice",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The user query for searching invoice data. This can include searching by invoice ID, product names, amounts, or any other relevant invoice information.",
        },
        searchType: {
          type: "string",
          description:
            "The type of search to perform. Examples include 'invoiceId', 'productName', 'amount', etc. This helps the system understand what kind of data the query is intended to match against in the invoices.",
          enum: ["invoiceId", "productName", "amount", "currency", "date"], // Optional, adjust based on your search capabilities
        },
      },
      required: ["query"],
    },
  },
  {
    name: "create_invoice",
    description: "Create an invoice record in the database",
    parameters: {
      type: "object",
      properties: {
        currency: {
          type: "string",
          description:
            "The currency in which the invoice amounts are denominated.",
        },
        products: {
          type: "array",
          description: "A dynamic list of products included in the invoice.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the product.",
              },
              quantity: {
                type: "number",
                description: "The quantity of the product.",
              },
              unitPrice: {
                type: "number",
                description: "The price of one unit of the product.",
              },
              totalPrice: {
                type: "number",
                description:
                  "The total price for the product, calculated as quantity * unitPrice.",
              },
            },
            required: ["name", "quantity", "unitPrice", "totalPrice"],
          },
        },
        subtotal: {
          type: "number",
          description:
            "The subtotal of the invoice before discounts and taxes.",
        },
        discount: {
          type: "number",
          description: "The total discount applied to the invoice.",
        },
        tax: {
          type: "number",
          description: "The total tax applied to the invoice.",
        },
        totalDue: {
          type: "number",
          description: "The total amount due for the invoice.",
        },
      },
      required: [
        "currency",
        "products",
        "subtotal",
        "discount",
        "tax",
        "totalDue",
      ],
    },
  },
];

export async function POST(req) {
  try {
    const { prompt, conversationHistory } = await req.json();

    if (!prompt) {
      return NextResponse.json({ message: "prompt required" }, { status: 401 });
    }

    const messages = conversationHistory.map((item) => ({
      role: item.role, // 'user' or 'system'
      content: item.content,
    }));

    messages.push({ role: "user", content: prompt });

    const response = await openAi.chat.completions.create({
      messages: messages,
      model: "gpt-4-0613",
      functions: functions,
      function_call: "auto",
      temperature: 0.9,
      max_tokens: 1000,
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
