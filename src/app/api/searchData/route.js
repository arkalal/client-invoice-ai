// pages/api/search.js

import { NextResponse } from "next/server";
import OpenAI from "openai";
import connectMongoDB from "../../../../utils/mongoDB";
import Instruct from "../../../../models/instruct";
import { searchInPinecone } from "../../../../utils/pineconeConfig";
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

async function fetchRelevantDataFromMongoDB(searchResults) {
  const ids = searchResults.map(
    (result) => new mongoose.Types.ObjectId(result.id)
  );
  const relevantDocuments = await Instruct.find({
    _id: { $in: ids },
  }).exec();
  return relevantDocuments;
}

export async function POST(req) {
  try {
    // Parse the query parameter
    const { query, deleteIntent } = await req.json();

    // Connect to MongoDB
    await connectMongoDB();

    // Vectorize the query text
    const queryVector = await vectorizeQuery(query);

    // Search for similar vectors in Pinecone
    const searchResults = await searchInPinecone(queryVector);
    const relevantData = await fetchRelevantDataFromMongoDB(searchResults);

    if (!deleteIntent) {
      const response = await openAi.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an intelligent assistant and you answer to user's questions based on the existing content " +
              "the relevant content for this query are:\n" +
              relevantData
                .map(
                  (item) => `id: ${item._id}\n\nContent:\n${item.instructions}`
                )
                .join("\n\n"),
          },
          { role: "user", content: query },
        ],
        model: "gpt-4-0613",
        temperature: 0.9,
        max_tokens: 1000,
      });

      // Return the data as a JSON response
      return NextResponse.json(response.choices[0].message.content);
    } else {
      const response = await openAi.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an intelligent assistant and you answer to user's questions based on the existing content " +
              "the relevant content for this query are:\n" +
              relevantData
                .map(
                  (item) => `id: ${item._id}\n\nContent:\n${item.instructions}`
                )
                .join("\n\n") +
              "if the user wants to delete some content as per the query give that content to him that he wants to delete:\n" +
              relevantData,
          },
          { role: "user", content: query },
        ],
        model: "gpt-4-0613",
        temperature: 0.9,
        max_tokens: 1000,
      });

      const aiTextResponse = response.choices[0].message.content;
      const itemToDelete = relevantData.find((item) =>
        aiTextResponse.includes(item._id.toString())
      );

      let responseContent;
      if (itemToDelete) {
        responseContent = {
          id: itemToDelete._id.toString(),
          content: itemToDelete.instructions,
        };
      } else {
        responseContent = "No matching item found to delete.";
      }

      return NextResponse.json(responseContent);
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "error searching data" },
      { status: 400 }
    );
  }
}
