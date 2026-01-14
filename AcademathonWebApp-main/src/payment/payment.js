/*


Change the profile system so that bookings are downloaded from bookings database, and
the payment must call the correct firebase function





*/


import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { functions } from "../auth/firebase.js";
import { httpsCallable } from "firebase/functions";
import {getAuth} from "firebase/auth";
import { getProfileInfo, updatePaymentStatus } from "../firefunc/firebaseFuncs.js";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import "./payment.css"; // Import the CSS file
import { updateBooking } from "../firefunc/firebaseFuncs.js";


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const PaymentForm = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState(0);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);
  const [grade, setGrade] = useState(null);
  const [paymentAmount,setPaymentAmount] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const query = useQuery();
  const booking_id = query.get('booking');
  const myuid = getAuth().currentUser.uid;
  

  useEffect(() => {
    //get profile information, grade level and pay.
    const runFunc = async () => {
      const mysnapshot = await getProfileInfo(myuid);
      const mydata = mysnapshot.data();
      setGrade(mydata.grade);
      //mapping
      const grade_to_price = {
        8:20,
        9:25,
        10:25,
        11:30,
        12:30
      };
      console.log("data:", mydata);
      console.log("amount:", grade_to_price[mydata.grade]);
      setPaymentAmount(grade_to_price[mydata.grade]);
    };
    runFunc();
    


  }, []);

  useEffect(() => {
    if (clientSecret) {
      confirmPayment();
    }
  }, [clientSecret]);

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const paymentProcess = httpsCallable(functions, 'createPaymentIntent');
    console.log("Payment processing");

    try {
      const response = await paymentProcess({ grade:grade, booking_doc_id:booking_id }); // Replace with your actual amount
      console.log("Response:", response);
      const client_secret = response.data.clientSecret;
      console.log("data stripe:", client_secret);
      setClientSecret(client_secret);
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.message);
    }
  };

  const confirmPayment = async () => {
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        setError(`Payment failed: ${error.message}`);
      } else {
        setSucceeded(true);
        setError(null);
        console.log("BOOKING_ID:",booking_id, "updated!");
        try {
          //Change this to a firebase cloud function call, would be easier.
          //How to make sure it has been paid.



          //CALL CLOUD FUNCTION
          await updatePaymentStatus({booking_doc_id:booking_id,payment_intent_id:paymentIntent.id});
          console.log(`Payment successful! PaymentIntent ID: ${paymentIntent.id}`);

          navigate('/profile');
          //window.location.reload();
        } catch (error) {
          console.log("ERROR UPDATING BOOKING!", error);
        }
        
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <h>Payment amount: ${paymentAmount} for G{grade} lesson </h>
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

export default PaymentForm;