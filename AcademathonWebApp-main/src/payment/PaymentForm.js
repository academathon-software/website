// src/StripePaymentForm.js
/*
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const StripePaymentForm = () => {
  const [amount, setAmount] = useState(0);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
    }
  };

  const createPaymentIntent = async () => {
    const { data } = await axios.post("https://academathon-84824.cloudfunctions.net/api/create-payment-intent", {
      amount: amount, // amount in cents
    }).catch((error) => {
      alert("Network error, please try again!");
    });
    setClientSecret(data.clientSecret);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <input
        type="number"
        id="amount"
        name="amount"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="button" onClick={createPaymentIntent}>
        Create Payment Intent
      </button>
      <CardElement id="card-element" onChange={handleChange} />
      <button
        disabled={processing || disabled || succeeded}
        id="submit"
      >
        <span id="button-text">
          {processing ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {error && <div className="card-error" role="alert">{error}</div>}
      <p className={succeeded ? "result-message" : "result-message hidden"}>
        Payment succeeded
      </p>
    </form>
  );
};

export default StripePaymentForm;**/