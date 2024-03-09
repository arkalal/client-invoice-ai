"use client";

import React, { useState, useEffect } from "react";
import styles from "./InvoiceSheet.module.scss";
import InvoiceCard from "../InvoiceCard/InvoiceCard";
import axios from "../../axios/api";

const InvoiceSheet = () => {
  const [Invoice, setInvoice] = useState(null);

  useEffect(() => {
    const getInvoice = async () => {
      try {
        const res = await axios.get("invoices");
        setInvoice(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getInvoice();
  }, []);

  return (
    <div className={styles.InvoiceSheet}>
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
