import React from "react";
import InvoiceSheet from "../../../components/InvoiceSheet/InvoiceSheet";
import axios from "../../../axios/api";

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

  return (
    <div>
      <InvoiceSheet invoice={invoice} />
    </div>
  );
};

export default InvoiceData;
