import { loadStripe } from '@stripe/stripe-js';

// The publishable key is read from VITE_STRIPE_PUBLISHABLE_KEY at build time.
// See .env.example for the expected value. The publishable key is safe to expose
// in the browser; the secret key lives on the backend.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  // Surface a clear error in the dev console rather than failing silently when
  // the user forgets to copy .env.example -> .env.
  console.error(
    'VITE_STRIPE_PUBLISHABLE_KEY is not set. Copy website/Frontend/.env.example to ' +
    'website/Frontend/.env and fill in your Stripe publishable key.'
  );
}

// Single shared Stripe instance — loadStripe should only be invoked once per page load.
export const stripePromise = loadStripe(publishableKey || '');
