"use client";

import React, { useState } from "react";
import styles from "./InvoiceSheet.module.scss";
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

  return (
    <div className={styles.InvoiceSheet}>
      <button onClick={getInvoice}>Get Invoice Data</button>

      <div className={styles.invoiceCards}>
        {Invoice &&
          Invoice.map((item, index) => {
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
