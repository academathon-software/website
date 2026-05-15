import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentAPI } from '../../services/api';
import './PaymentModal.css';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51SyIFk1eqTRE9VS7RgNIFVBLxwvQr2BBHTtTmtiFXSkusrXWRdgCj3uVI9P7RrF1ukRVxjj6Dcl9VlqYTmnBOdh500jdKUu7Ha');

const PaymentForm = ({ bookingId, bookingDetails, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard',
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message);
        setIsProcessing(false);
      } else {
        // Payment successful
        // Confirm with backend
        const paymentIntent = await stripe.retrievePaymentIntent(
          bookingDetails.clientSecret
        );
        
        if (paymentIntent.paymentIntent.status === 'succeeded') {
          try {
            await paymentAPI.confirmPayment(paymentIntent.paymentIntent.id);
            onSuccess();
          } catch (confirmError) {
            console.error('Backend confirmation error:', confirmError);
            // Payment succeeded with Stripe but backend confirmation failed
            // This is okay - the webhook will handle it
            onSuccess(); // Still close the modal since payment succeeded
          }
        } else if (paymentIntent.paymentIntent.status === 'requires_payment_method') {
          setError('Payment failed. Please check your card details and try again.');
          setIsProcessing(false);
        } else if (paymentIntent.paymentIntent.status === 'processing') {
          setError('Payment is processing. Please wait...');
          setIsProcessing(false);
        } else {
          setError('Payment status: ' + paymentIntent.paymentIntent.status);
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement 
        id="payment-element"
        onReady={() => {
          setIsReady(true);
        }}
      />
      
      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}
      
      <div className="payment-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-cancel"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || !isReady || isProcessing}
          className="btn-pay"
        >
          {isProcessing ? 'Processing...' : `Pay $${bookingDetails?.amount?.toFixed(2) || '0.00'}`}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ bookingId, onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get payment details first
        const detailsResponse = await paymentAPI.getPaymentDetails(bookingId);
        setBookingDetails(detailsResponse.data);

        // Create payment intent
        const intentResponse = await paymentAPI.createPaymentIntent(bookingId);
        setClientSecret(intentResponse.data.clientSecret);
        setBookingDetails(prev => ({ ...prev, ...intentResponse.data }));
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.response?.data?.error || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchPaymentIntent();
    }
  }, [bookingId]);

  const options = useMemo(() => ({
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4caf50',
      },
    },
  }), [clientSecret]);

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Complete Your Payment</h2>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>

        <div className="payment-modal-body">
          {loading && (
            <div className="payment-loading">
              <p>Initializing payment...</p>
            </div>
          )}

          {error && (
            <div className="payment-error">
              <p>{error}</p>
              <button onClick={onCancel} className="btn-cancel">Close</button>
            </div>
          )}

          {!loading && !error && bookingDetails && (
            <>
              <div className="booking-summary">
                <h3>Booking Details</h3>
                <div className="summary-row">
                  <span>Tutor:</span>
                  <span>{bookingDetails.tutorName}</span>
                </div>
                <div className="summary-row">
                  <span>Subject:</span>
                  <span>{bookingDetails.subject}</span>
                </div>
                <div className="summary-row">
                  <span>Start Time:</span>
                  <span>{new Date(bookingDetails.startTime).toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>End Time:</span>
                  <span>{new Date(bookingDetails.endTime).toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span className="amount">${bookingDetails.amount?.toFixed(2)}</span>
                </div>
              </div>

              {clientSecret && (
                <Elements key={clientSecret} stripe={stripePromise} options={options}>
                  <PaymentForm
                    bookingId={bookingId}
                    bookingDetails={bookingDetails}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;


