import React, { useState } from 'react';
import campaignService from '../services/campaignService';
import styles from './DonationForm.module.css';

const DonationForm = ({ campaignId, onSuccess, service = campaignService }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    if (donationAmount > 10) {
      setError('Maximum donation is 10 ETH for this demo');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Optimistic UI: Show pending state immediately
      const result = await service.donate(campaignId, donationAmount);
      
      setTxHash(result.tx.hash);
      setSuccess(true);
      setAmount('');
      
      // Call success callback to refresh parent component
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset success state after a few seconds
      setTimeout(() => {
        setSuccess(false);
        setTxHash(null);
      }, 5000);
      
    } catch (error) {
      console.error('Donation failed:', error);
      setError(error.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [0.01, 0.05, 0.1, 0.5, 1.0];

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.header}>
          <h3>Make a Donation</h3>
          <p>Support this campaign by donating ETH. All transactions are transparent and recorded on the blockchain.</p>
        </div>

        {success && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <div>
              <h4>Donation Successful!</h4>
              <p>Thank you for your contribution of {amount} ETH</p>
              {txHash && (
                <a 
                  href={service.getEtherscanLink(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.txLink}
                >
                  View Transaction on Etherscan ↗
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="amount" className={styles.label}>
              Donation Amount (ETH)
            </label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.1"
                step="0.001"
                min="0.001"
                max="10"
                className={styles.input}
                disabled={loading}
              />
              <span className={styles.currency}>ETH</span>
            </div>
          </div>

          <div className={styles.quickAmounts}>
            <span className={styles.quickLabel}>Quick amounts:</span>
            <div className={styles.quickButtons}>
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={styles.quickButton}
                  disabled={loading}
                >
                  {quickAmount} ETH
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.info}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gas fees:</span>
              <span>You'll pay network gas fees for this transaction</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Transparency:</span>
              <span>This donation will be publicly visible on the blockchain</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Usage:</span>
              <span>Campaign owner can record how funds are spent</span>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Processing Donation...
              </>
            ) : (
              `Donate ${amount || '0'} ETH`
            )}
          </button>
        </form>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingIcon}>⏳</div>
            <div>
              <h4>Processing Your Donation</h4>
              <p>Please confirm the transaction in MetaMask and wait for blockchain confirmation.</p>
              <div className={styles.steps}>
                <div className={styles.step}>1. Confirm in MetaMask</div>
                <div className={styles.step}>2. Transaction mining...</div>
                <div className={styles.step}>3. Update campaign balance</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationForm;