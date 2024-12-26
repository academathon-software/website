import React from 'react';
import './payment.css'; // Import CSS for styling
import Button from '../ui/button';

function PaymentPage() {
    return (
        <div className="payment-container">
            <h2>Payment Page</h2>
            <div className="payment-methods">
              <div className="pay-method">
                  <Button text="Credit Card"></Button>
                </div>
                <div className="pay-method">
                  <Button text="Credit Card"></Button>
                </div>
                <div className="pay-method">
                  <Button text="Credit Card"></Button>
                </div>
                {/* Add more payment methods as needed */}
            </div>
            {/* Payment form fields */}
            <form className="payment-form">
                <label htmlFor="card-number">Card Number:</label>
                <input type="text" id="card-number" name="card-number" />

                <label htmlFor="expiry">Expiry:</label>
                <input type="text" id="expiry" name="expiry" />

                <label htmlFor="cvv">CVV:</label>
                <input type="text" id="cvv" name="cvv" />
                <div className="pay-button">
                  <Button text="pay"></Button>
                </div>
            </form>
        </div>
    );
}

export default PaymentPage;