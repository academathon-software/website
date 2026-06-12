import React, { useState, useEffect, useMemo } from 'react';
import './Wallet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faArrowDown,
  faArrowUp,
  faRotateLeft,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import StudentSidebar from '../Shared/StudentSidebar';
import { useUser } from '../../context/UserContext';
import { walletAPI } from '../../services/api';
import { stripePromise } from '../../services/stripe';

// ─── Stripe payment form (shown inline after "Continue to payment") ──────────

const TopUpForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setProcessing(true);
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/wallet' },
        redirect: 'if_required',
      });
      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        return;
      }
      await onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-stripe-form">
      <p className="w-stripe-summary">
        Adding <strong>${amount.toFixed(2)} CAD</strong> to your wallet
      </p>
      <PaymentElement onReady={() => setReady(true)} />
      {error && <p className="w-form-error">{error}</p>}
      <div className="w-stripe-actions">
        <button
          type="submit"
          className="w-btn-primary"
          disabled={!stripe || !elements || !ready || processing}
        >
          {processing
            ? <><FontAwesomeIcon icon={faSpinner} spin /> &nbsp;Processing…</>
            : `Pay $${amount.toFixed(2)} CAD`}
        </button>
        <button type="button" className="w-btn-ghost" onClick={onCancel} disabled={processing}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Main Wallet page ─────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [20, 50, 100];

const Wallet = () => {
  const { setUserType } = useUser();

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add funds state
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setUserType('student');
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [balanceRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setError('Failed to load wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resolved amount — custom input overrides preset
  const resolvedAmount = customAmount !== ''
    ? parseFloat(customAmount)
    : selectedPreset;

  const amountIsValid = resolvedAmount != null && !isNaN(resolvedAmount) && resolvedAmount >= 5;

  const handleContinue = async () => {
    if (!amountIsValid) return;
    setIntentError(null);
    setIntentLoading(true);
    try {
      const res = await walletAPI.createTopupIntent(resolvedAmount);
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      setIntentError(err.response?.data?.error || 'Could not start payment. Please try again.');
    } finally {
      setIntentLoading(false);
    }
  };

  const handleTopUpSuccess = async () => {
    setClientSecret(null);
    setCustomAmount('');
    setSelectedPreset(null);
    setSuccessMsg(`$${resolvedAmount.toFixed(2)} CAD added to your wallet!`);
    await fetchWalletData();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCancelStripe = () => {
    setClientSecret(null);
    setIntentError(null);
  };

  const stripeOptions = useMemo(() => ({
    clientSecret,
    appearance: { theme: 'stripe', variables: { colorPrimary: '#2D6A4F' } },
  }), [clientSecret]);

  const txMeta = (type) => {
    switch (type) {
      case 'TOPUP':     return { icon: faArrowDown, colour: '#2D6A4F', sign: '+' };
      case 'DEDUCTION': return { icon: faArrowUp,   colour: '#e74c3c', sign: '−' };
      case 'REFUND':    return { icon: faRotateLeft, colour: '#3498db', sign: '+' };
      default:          return { icon: faArrowDown,  colour: '#888',    sign: '' };
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-page">
        <StudentSidebar />
        <div className="w-main">
          <div className="w-center-state">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#2D6A4F" />
            <p>Loading your wallet…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-page">
        <StudentSidebar />
        <div className="w-main">
          <div className="w-center-state">
            <p style={{ color: '#e74c3c' }}>{error}</p>
            <button className="w-btn-primary" onClick={fetchWalletData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-page">
      <StudentSidebar />

      <div className="w-main">

        {/* ── Page header ── */}
        <div className="w-page-header">
          <h1 className="w-page-title">Wallet</h1>
          <p className="w-page-sub">Load funds and pay for lessons from your balance.</p>
        </div>

        {/* ── Success banner ── */}
        {successMsg && (
          <div className="w-success-banner">{successMsg}</div>
        )}

        {/* ── Top row: balance card + add funds ── */}
        <div className="w-top-row">

          {/* Balance card */}
          <div className="w-balance-card">
            <div className="w-balance-card-inner">
              <FontAwesomeIcon icon={faWallet} className="w-balance-card-icon" />
              <p className="w-balance-card-label">AVAILABLE BALANCE</p>
              <p className="w-balance-card-amount">
                ${(balance ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Add funds panel */}
          <div className="w-add-panel">
            {!clientSecret ? (
              <>
                <h3 className="w-add-panel-title">
                  <span className="w-add-plus">+</span> Add funds
                </h3>

                {/* Preset amounts */}
                <div className="w-preset-row">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      className={`w-preset-btn ${selectedPreset === amt && customAmount === '' ? 'w-preset-btn--active' : ''}`}
                      onClick={() => { setSelectedPreset(amt); setCustomAmount(''); }}
                    >
                      ${amt}.00
                    </button>
                  ))}
                </div>

                {/* Custom / other amount */}
                <div className="w-other-wrap">
                  <span className="w-other-prefix">$</span>
                  <input
                    type="number"
                    min="5"
                    step="1"
                    placeholder="Other amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                    className="w-other-input"
                  />
                </div>

                {intentError && <p className="w-form-error">{intentError}</p>}

                <button
                  className="w-continue-btn"
                  onClick={handleContinue}
                  disabled={!amountIsValid || intentLoading}
                >
                  {intentLoading
                    ? <><FontAwesomeIcon icon={faSpinner} spin /> &nbsp;Preparing…</>
                    : 'Continue to payment'}
                </button>
              </>
            ) : (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <TopUpForm
                  amount={resolvedAmount}
                  onSuccess={handleTopUpSuccess}
                  onCancel={handleCancelStripe}
                />
              </Elements>
            )}
          </div>
        </div>

        {/* ── Transaction history ── */}
        <div className="w-section">
          <h3 className="w-section-title">Transaction history</h3>

          {transactions.length === 0 ? (
            <p className="w-empty-tx">No transactions yet.</p>
          ) : (
            <div className="w-tx-list">
              {transactions.map((tx) => {
                const meta = txMeta(tx.type);
                return (
                  <div key={tx.id} className="w-tx-row">
                    <div
                      className="w-tx-icon"
                      style={{ background: meta.colour + '18', color: meta.colour }}
                    >
                      <FontAwesomeIcon icon={meta.icon} />
                    </div>
                    <div className="w-tx-info">
                      <p className="w-tx-desc">{tx.description}</p>
                      {tx.tutorName && (
                        <p className="w-tx-sub">{tx.subject} · {tx.tutorName}</p>
                      )}
                      <p className="w-tx-date">{formatDate(tx.createdAt)}</p>
                    </div>
                    <p className="w-tx-amount" style={{ color: meta.colour }}>
                      {meta.sign}${tx.amount.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Wallet;
