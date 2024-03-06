import InvoiceData from "../../../../models/invoiceData";
import connectMongoDB from "../../../../utils/mongoDB";
import {
  upsertToPinecone,
  vectorizeText,
} from "../../../../utils/pineconeConfig";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Parse the incoming invoice data
  const invoiceData = await req.json();
  await connectMongoDB();

  // Create the invoice document in MongoDB
  const invoiceDocument = await InvoiceData.create(invoiceData);

  // For vectorization, choose key invoice details that will be searchable or relevant
  // For simplicity, let's concatenate some of the invoice details into a searchable string
  // Adjust based on your application's needs
  //   const searchableText =
  //     `Invoice ID ${invoiceDocument.invoiceId} ` +
  //     invoiceDocument.products
  //       .map((p) => `${p.name} ${p.quantity} ${p.unitPrice}`)
  //       .join(" ") +
  //     ` Total Due ${invoiceDocument.totalDue}`;

  // Vectorize the concatenated invoice text
  const textToVectorize = JSON.stringify(invoiceData); // Simplistic approach for demonstration

  const vector = await vectorizeText(textToVectorize);

  // Upsert the vector to Pinecone using the invoice ID as the unique identifier
  await upsertToPinecone(invoiceDocument._id.toString(), vector);

  return NextResponse.json(
    { message: "Invoice stored and indexed successfully" },
    { status: 200 }
  );
}

export async function GET() {
  await connectMongoDB();
  // Fetch all invoices
  const invoices = await InvoiceData.find();
  return NextResponse.json(invoices);
}
