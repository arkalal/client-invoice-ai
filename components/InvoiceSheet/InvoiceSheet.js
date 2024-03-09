"use client";

import React, { useEffect, useState } from "react";
import styles from "./InvoiceSheet.module.scss";
import { CSVLink } from "react-csv";
import InvoiceCard from "../InvoiceCard/InvoiceCard";
import axios from "../../axios/api";

const InvoiceSheet = () => {
  const [Invoice, setInvoice] = useState(null);

  const getInvoice = async () => {
    try {
      const res = await axios.get("invoices");
      setInvoice(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const headers = [
    { label: "Invoice ID", key: "_id" },
    { label: "Currency", key: "currency" },
    { label: "Subtotal", key: "subtotal" },
    { label: "Discount", key: "discount" },
    { label: "Tax", key: "tax" },
    { label: "Total Due", key: "totalDue" },
    // Assuming you want to include product details, you might add headers for each product field
    { label: "Product Name", key: "productName" },
    { label: "Quantity", key: "quantity" },
    { label: "Unit Price", key: "unitPrice" },
    { label: "Total Price", key: "productTotalPrice" },
    // Add more product-related headers if you have more products
    // You might need to repeat for each product if your CSV structure requires it
  ];

  // Function to preprocess invoice data for CSV export
  const processForCSV = (invoices) => {
    return invoices.map((invoice) => {
      // Start with a base object for the invoice
      let baseObject = {
        _id: invoice._id,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        tax: invoice.tax,
        totalDue: invoice.totalDue,
      };

      // If the invoice has products, add their details to the base object
      invoice.products.forEach((product, index) => {
        baseObject[`productName_${index + 1}`] = product.name;
        baseObject[`quantity_${index + 1}`] = product.quantity;
        baseObject[`unitPrice_${index + 1}`] = product.unitPrice;
        baseObject[`productTotalPrice_${index + 1}`] = product.totalPrice;
      });

      return baseObject;
    });
  };

  // Process the invoice data to match the headers format
  const csvData = processForCSV(invoice);

  return (
    <div className={styles.InvoiceSheet}>
      <CSVLink data={csvData} headers={headers} filename="invoices.csv">
        Export to Excel
      </CSVLink>

      <button onClick={getInvoice}>Get Invoice data</button>

      <div className={styles.invoiceCards}>
        {Invoice.map((item, index) => {
          return (
            <div key={index}>
              <InvoiceCard invoice={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceSheet;
