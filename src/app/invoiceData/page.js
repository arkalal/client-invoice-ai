import React from "react";
import axios from "../../../axios/api";
import InvoiceSheet from "../../../components/InvoiceSheet/InvoiceSheet";

const getInvoice = async () => {
  try {
    const res = await axios.get("invoices");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const InvoiceData = async () => {
  const invoice = await getInvoice();
  console.log("invoice", invoice);
  return (
    <div>
      <InvoiceSheet invoice={invoice} />
    </div>
  );
};

export default InvoiceData;
