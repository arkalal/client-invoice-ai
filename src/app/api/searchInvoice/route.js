// pages/api/search.js

import { NextResponse } from "next/server";
import OpenAI from "openai";
import InvoiceData from "../../../../models/invoiceData";
import { searchInPinecone } from "../../../../utils/pineconeConfig";
import connectMongoDB from "../../../../utils/mongoDB";
import mongoose from "mongoose";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to vectorize the query text
async function vectorizeQuery(query) {
  const response = await openAi.embeddings.create({
    model: "text-embedding-ada-002", // Adjust the model as per your requirements
    input: query,
    encoding_format: "float", // Ensure the format matches what Pinecone expects
  });
  // Extract and return the embedding vector
  return response.data[0].embedding;
}

async function fetchRelevantInvoicesFromMongoDB(searchResults) {
  const invoiceIds = searchResults.map(
    (result) => new mongoose.Types.ObjectId(result.id)
  );
  const relevantInvoices = await InvoiceData.find({
    _id: { $in: invoiceIds },
  }).exec();
  return relevantInvoices;
}

export async function POST(req) {
  try {
    // Parse the query parameter
    const { query } = await req.json();

    // Connect to MongoDB
    await connectMongoDB();

    // Adjusted to use a vectorized query for invoice data if using Pinecone
    // Otherwise, implement a direct MongoDB text search or other logic as needed
    const queryVector = await vectorizeQuery(query);
    const searchResults = await searchInPinecone(queryVector);

    // Fetching the relevant invoice documents based on Pinecone search results
    // Adjust this part if you're using a direct MongoDB search instead
    const relevantInvoices = await fetchRelevantInvoicesFromMongoDB(
      searchResults
    );

    const response = await openAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent assistant and you answer to user's questions based on the existing content " +
            "the relevant content for this query are:\n" +
            relevantInvoices
              .map((invoice) => {
                // Construct a string for each product line
                const productsDetails = invoice.products
                  .map(
                    (product) =>
                      `${product.name}: Quantity ${product.quantity}, Unit Price ${product.unitPrice} ${invoice.currency}, Total ${product.totalPrice} ${invoice.currency}`
                  )
                  .join("\n");

                return `Invoice ID: ${invoice.invoiceId}\nCurrency: ${invoice.currency}\nProducts:\n${productsDetails}\nSubtotal: ${invoice.subtotal} ${invoice.currency}\nDiscount: ${invoice.discount} ${invoice.currency}\nTax: ${invoice.tax} ${invoice.currency}\nTotal Due: ${invoice.totalDue} ${invoice.currency}\n---`;
              })
              .join("\n"),
        },
        { role: "user", content: query },
      ],
      model: "gpt-4-0613",
      temperature: 0.9,
      max_tokens: 1000,
    });

    // Return the data as a JSON response
    return NextResponse.json(response.choices[0].message.content);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "error searching data" },
      { status: 400 }
    );
  }
}
