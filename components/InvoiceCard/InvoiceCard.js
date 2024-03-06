import React from "react";
import styles from "./InvoiceCard.module.scss";

const InvoiceCard = ({ invoice }) => {
  return (
    <div className={styles.invoiceCard}>
      <div className={styles.cardHeader}>
        <h3>Invoice ID: {invoice._id}</h3>
        <p>Currency: {invoice.currency}</p>
      </div>
      <div className={styles.cardBody}>
        <h4>Products:</h4>
        {invoice.products.map((product, index) => (
          <div key={index} className={styles.product}>
            <p>{product.name}</p>
            <p>Quantity: {product.quantity}</p>
            <p>Unit Price: {product.unitPrice}</p>
            <p>Total Price: {product.totalPrice}</p>
          </div>
        ))}
      </div>
      <div className={styles.cardFooter}>
        <p>Subtotal: {invoice.subtotal}</p>
        <p>Discount: {invoice.discount}</p>
        <p>Tax: {invoice.tax}</p>
        <p className={styles.totalDue}>Total Due: {invoice.totalDue}</p>
      </div>
    </div>
  );
};

export default InvoiceCard;
