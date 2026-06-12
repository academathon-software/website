import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Wallet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faPlus,
  faArrowUp,
  faArrowDown,
  faCreditCard,
  faRotate,
  faCheck,
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

const formatCurrency = (amount, currency = 'CAD') => {
  const value = Number(amount);
  if (Number.isNaN(value)) return '$0.00';
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency || 'CAD',
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
};

const TX_LABELS = {
  TOP_UP: 'Top-up',
  AUTO_RELOAD: 'Auto-reload',
  LESSON_CHARGE: 'Lesson charge',
  REFUND: 'Refund',
  ADJUSTMENT: 'Adjustment',
};

const stripeAppearance = {
  theme: 'stripe',
  variables: { colorPrimary: '#1A803D' },
};

/** Stripe PaymentElement form used to confirm a wallet top-up. */
const TopUpForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setConfirming(true);
    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/wallet' },
        redirect: 'if_required',
      });
      if (confirmError) {
        setError(confirmError.message);
        setConfirming(false);
        return;
      }
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await onSuccess(paymentIntent.id);
      } else {
        setError('Payment did not complete. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Could not process payment. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wallet-stripe-form">
      <p className="wallet-stripe-total">Adding {formatCurrency(amount)}</p>
      <PaymentElement onReady={() => setIsReady(true)} />
      {error && <p className="wallet-error">{error}</p>}
      <div className="wallet-form-actions">
        <button
          type="submit"
          className="wallet-btn-primary"
          disabled={!stripe || !elements || !isReady || confirming}
        >
          {confirming ? 'Processing…' : `Pay ${formatCurrency(amount)}`}
        </button>
        <button type="button" className="wallet-btn-secondary" onClick={onCancel} disabled={confirming}>
          Cancel
        </button>
      </div>
    </form>
  );
};

/** Stripe PaymentElement form used to save a card (SetupIntent) for auto-reload. */
const SaveCardForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setConfirming(true);
    try {
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.origin + '/wallet' },
        redirect: 'if_required',
      });
      if (setupError) {
        setError(setupError.message);
        setConfirming(false);
        return;
      }
      if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        await onSuccess(setupIntent.payment_method);
      } else {
        setError('Could not save your card. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Could not save your card. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wallet-stripe-form">
      <p className="wallet-stripe-subtitle">Save a card to fund auto-reload.</p>
      <PaymentElement onReady={() => setIsReady(true)} />
      {error && <p className="wallet-error">{error}</p>}
      <div className="wallet-form-actions">
        <button
          type="submit"
          className="wallet-btn-primary"
          disabled={!stripe || !elements || !isReady || confirming}
        >
          {confirming ? 'Saving…' : 'Save card'}
        </button>
        <button type="button" className="wallet-btn-secondary" onClick={onCancel} disabled={confirming}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const PRESET_AMOUNTS = [20, 50, 100];

const Wallet = () => {
  const { setUserType } = useUser();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Top-up state
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpClientSecret, setTopUpClientSecret] = useState(null);
  const [topUpPending, setTopUpPending] = useState(false);

  // Save-card state
  const [cardClientSecret, setCardClientSecret] = useState(null);
  const [cardPending, setCardPending] = useState(false);

  // Auto-reload form state
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoThreshold, setAutoThreshold] = useState('');
  const [autoAmount, setAutoAmount] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setUserType('student');
  }, [setUserType]);

  const loadWallet = useCallback(async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions(),
      ]);
      setWallet(walletRes.data);
      setTransactions(txRes.data || []);
      setAutoEnabled(!!walletRes.data.autoReloadEnabled);
      setAutoThreshold(
        walletRes.data.autoReloadThreshold != null ? String(walletRes.data.autoReloadThreshold) : ''
      );
      setAutoAmount(
        walletRes.data.autoReloadAmount != null ? String(walletRes.data.autoReloadAmount) : ''
      );
    } catch (err) {
      console.error('Failed to load wallet:', err);
      setError(err.response?.data?.error || 'Failed to load your wallet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const startTopUp = async () => {
    setError(null);
    setNotice(null);
    const amount = parseFloat(topUpAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount to add.');
      return;
    }
    try {
      setTopUpPending(true);
      const res = await walletAPI.createTopUp(amount);
      setTopUpClientSecret(res.data.clientSecret);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start top-up. Please try again.');
    } finally {
      setTopUpPending(false);
    }
  };

  const handleTopUpSuccess = async (paymentIntentId) => {
    try {
      await walletAPI.confirmTopUp(paymentIntentId);
    } catch (err) {
      // Credit may still arrive via webhook; surface a soft notice.
      console.error('Top-up confirm failed (webhook will reconcile):', err);
    }
    setTopUpClientSecret(null);
    setTopUpAmount('');
    setNotice('Funds added to your wallet.');
    await loadWallet();
  };

  const startSaveCard = async () => {
    setError(null);
    setNotice(null);
    try {
      setCardPending(true);
      const res = await walletAPI.createPaymentMethodSetupIntent();
      setCardClientSecret(res.data.clientSecret);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start card setup. Please try again.');
    } finally {
      setCardPending(false);
    }
  };

  const handleSaveCardSuccess = async (paymentMethodId) => {
    try {
      await walletAPI.setPaymentMethod(paymentMethodId);
      setCardClientSecret(null);
      setNotice('Card saved for top-ups and auto-reload.');
      await loadWallet();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save card. Please try again.');
    }
  };

  const saveAutoReload = async () => {
    setError(null);
    setNotice(null);
    if (autoEnabled) {
      const t = parseFloat(autoThreshold);
      const a = parseFloat(autoAmount);
      if (Number.isNaN(t) || t < 0) {
        setError('Enter a valid reload threshold.');
        return;
      }
      if (Number.isNaN(a) || a <= 0) {
        setError('Enter a valid reload amount.');
        return;
      }
      if (!wallet?.hasPaymentMethod) {
        setError('Save a card before enabling auto-reload.');
        return;
      }
    }
    try {
      setSavingSettings(true);
      await walletAPI.updateAutoReload(
        autoEnabled,
        autoEnabled ? parseFloat(autoThreshold) : null,
        autoEnabled ? parseFloat(autoAmount) : null
      );
      setNotice('Auto-reload settings saved.');
      await loadWallet();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save auto-reload settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const topUpElementsOptions = useMemo(
    () => ({ clientSecret: topUpClientSecret, appearance: stripeAppearance }),
    [topUpClientSecret]
  );
  const cardElementsOptions = useMemo(
    () => ({ clientSecret: cardClientSecret, appearance: stripeAppearance }),
    [cardClientSecret]
  );

  const currency = wallet?.currency || 'CAD';

  return (
    <div className="wallet-page">
      <StudentSidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Wallet</h1>
          <p>Load funds and pay for lessons from your balance.</p>
        </div>

        {loading ? (
          <p className="wallet-muted">Loading your wallet…</p>
        ) : (
          <>
            {error && <div className="wallet-banner wallet-banner-error">{error}</div>}
            {notice && <div className="wallet-banner wallet-banner-success">{notice}</div>}

            {/* Balance + Add funds */}
            <div className="wallet-grid">
              <div className="wallet-card wallet-balance-card">
                <div className="wallet-balance-icon">
                  <FontAwesomeIcon icon={faWallet} />
                </div>
                <div className="wallet-balance-label">Available balance</div>
                <div className="wallet-balance-value">
                  {formatCurrency(wallet?.balance, currency)}
                </div>
              </div>

              <div className="wallet-card">
                <h3 className="wallet-card-title">
                  <FontAwesomeIcon icon={faPlus} /> Add funds
                </h3>
                {topUpClientSecret ? (
                  <Elements key={topUpClientSecret} stripe={stripePromise} options={topUpElementsOptions}>
                    <TopUpForm
                      amount={parseFloat(topUpAmount) || 0}
                      onSuccess={handleTopUpSuccess}
                      onCancel={() => setTopUpClientSecret(null)}
                    />
                  </Elements>
                ) : (
                  <>
                    <div className="wallet-preset-row">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className={`wallet-preset ${parseFloat(topUpAmount) === amt ? 'active' : ''}`}
                          onClick={() => setTopUpAmount(String(amt))}
                        >
                          {formatCurrency(amt, currency)}
                        </button>
                      ))}
                    </div>
                    <div className="wallet-input-row">
                      <span className="wallet-input-prefix">$</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Other amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="wallet-input"
                      />
                    </div>
                    <button
                      type="button"
                      className="wallet-btn-primary wallet-btn-block"
                      onClick={startTopUp}
                      disabled={topUpPending}
                    >
                      {topUpPending ? 'Preparing…' : 'Continue to payment'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Auto-reload */}
            <div className="wallet-card">
              <h3 className="wallet-card-title">
                <FontAwesomeIcon icon={faRotate} /> Auto-reload
              </h3>
              <p className="wallet-muted">
                Automatically top up your balance from a saved card when it drops below a threshold.
              </p>

              <div className="wallet-paymethod-row">
                <span className="wallet-paymethod-status">
                  <FontAwesomeIcon icon={faCreditCard} />
                  {wallet?.hasPaymentMethod ? (
                    <span className="wallet-saved"><FontAwesomeIcon icon={faCheck} /> Card on file</span>
                  ) : (
                    <span className="wallet-muted">No card saved</span>
                  )}
                </span>
                {!cardClientSecret && (
                  <button type="button" className="wallet-btn-secondary" onClick={startSaveCard} disabled={cardPending}>
                    {cardPending ? 'Preparing…' : wallet?.hasPaymentMethod ? 'Replace card' : 'Save a card'}
                  </button>
                )}
              </div>

              {cardClientSecret && (
                <Elements key={cardClientSecret} stripe={stripePromise} options={cardElementsOptions}>
                  <SaveCardForm
                    onSuccess={handleSaveCardSuccess}
                    onCancel={() => setCardClientSecret(null)}
                  />
                </Elements>
              )}

              <label className="wallet-toggle-row">
                <input
                  type="checkbox"
                  checked={autoEnabled}
                  onChange={(e) => setAutoEnabled(e.target.checked)}
                />
                <span>Enable auto-reload</span>
              </label>

              {autoEnabled && (
                <div className="wallet-settings-grid">
                  <div className="wallet-field">
                    <label>When balance falls below</label>
                    <div className="wallet-input-row">
                      <span className="wallet-input-prefix">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={autoThreshold}
                        onChange={(e) => setAutoThreshold(e.target.value)}
                        className="wallet-input"
                      />
                    </div>
                  </div>
                  <div className="wallet-field">
                    <label>Reload this amount</label>
                    <div className="wallet-input-row">
                      <span className="wallet-input-prefix">$</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={autoAmount}
                        onChange={(e) => setAutoAmount(e.target.value)}
                        className="wallet-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="wallet-btn-primary"
                onClick={saveAutoReload}
                disabled={savingSettings}
              >
                {savingSettings ? 'Saving…' : 'Save settings'}
              </button>
            </div>

            {/* Transactions */}
            <div className="wallet-card">
              <h3 className="wallet-card-title">Transaction history</h3>
              {transactions.length === 0 ? (
                <p className="wallet-muted">No transactions yet.</p>
              ) : (
                <ul className="wallet-tx-list">
                  {transactions.map((tx) => {
                    const credit = Number(tx.amount) >= 0;
                    return (
                      <li key={tx.id} className="wallet-tx-item">
                        <span className={`wallet-tx-icon ${credit ? 'credit' : 'debit'}`}>
                          <FontAwesomeIcon icon={credit ? faArrowDown : faArrowUp} />
                        </span>
                        <div className="wallet-tx-info">
                          <span className="wallet-tx-type">{TX_LABELS[tx.type] || tx.type}</span>
                          <span className="wallet-tx-desc">{tx.description}</span>
                        </div>
                        <div className="wallet-tx-amounts">
                          <span className={`wallet-tx-amount ${credit ? 'credit' : 'debit'}`}>
                            {credit ? '+' : '-'}
                            {formatCurrency(Math.abs(Number(tx.amount)), currency)}
                          </span>
                          <span className="wallet-tx-balance">
                            {formatCurrency(tx.balanceAfter, currency)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;
