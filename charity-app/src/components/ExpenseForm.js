import React, { useState } from 'react';
import campaignService from '../services/campaignService';
import styles from './ExpenseForm.module.css';

const ExpenseForm = ({ campaignId, availableBalance, onSuccess, service = campaignService }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    if (expenseAmount > availableBalance) {
      setError(`Amount exceeds available balance of ${availableBalance.toFixed(4)} ETH`);
      return;
    }

    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description for this expense');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await service.recordExpense(
        campaignId, 
        recipient, 
        expenseAmount, 
        description.trim()
      );
      
      setTxHash(result.tx.hash);
      setSuccess(true);
      
      // Clear form
      setRecipient('');
      setAmount('');
      setDescription('');
      
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
      console.error('Expense recording failed:', error);
      setError(error.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  const formatEther = (amount) => {
    return parseFloat(amount).toFixed(4);
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.header}>
          <h3>Record Expense</h3>
          <p>Record how campaign funds were spent. This creates a transparent record on the blockchain.</p>
          <div className={styles.balance}>
            Available balance: <span>{formatEther(availableBalance)} ETH</span>
          </div>
        </div>

        {success && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <div>
              <h4>Expense Recorded Successfully!</h4>
              <p>Expense of {amount} ETH has been recorded and funds transferred</p>
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
            <label htmlFor="recipient" className={styles.label}>
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className={styles.input}
              disabled={loading}
            />
            <div className={styles.hint}>
              The Ethereum address that will receive the funds
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="amount" className={styles.label}>
              Amount (ETH)
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
                max={availableBalance}
                className={styles.input}
                disabled={loading}
              />
              <span className={styles.currency}>ETH</span>
            </div>
            <div className={styles.hint}>
              Maximum: {formatEther(availableBalance)} ETH
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this expense is for (e.g., Medical supplies, School materials, Emergency aid, etc.)"
              className={styles.textarea}
              rows={4}
              disabled={loading}
            />
            <div className={styles.hint}>
              Provide details about what the funds will be used for
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.warning}>
            <div className={styles.warningIcon}>⚠️</div>
            <div>
              <h4>Important Notes</h4>
              <ul>
                <li>Funds will be immediately transferred to the recipient address</li>
                <li>This transaction cannot be undone once confirmed</li>
                <li>All expense records are publicly visible on the blockchain</li>
                <li>Make sure the recipient address is correct</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !recipient || !amount || !description.trim() || parseFloat(amount) <= 0}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Recording Expense...
              </>
            ) : (
              `Record Expense & Transfer ${amount || '0'} ETH`
            )}
          </button>
        </form>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingIcon}>⏳</div>
            <div>
              <h4>Processing Expense Record</h4>
              <p>Please confirm the transaction in MetaMask. Funds will be transferred to the recipient.</p>
              <div className={styles.steps}>
                <div className={styles.step}>1. Confirm in MetaMask</div>
                <div className={styles.step}>2. Recording expense on blockchain...</div>
                <div className={styles.step}>3. Transferring funds to recipient</div>
                <div className={styles.step}>4. Update campaign records</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;