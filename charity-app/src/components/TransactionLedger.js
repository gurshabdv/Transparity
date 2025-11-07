import React, { useState, useMemo } from 'react';
import campaignService from '../services/campaignService';
import styles from './TransactionLedger.module.css';

const TransactionLedger = ({ donations, expenses, service = campaignService }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Combine and sort transactions
  const transactions = useMemo(() => {
    const allTransactions = [
      ...donations.map(d => ({ ...d, type: 'donation' })),
      ...expenses.map(e => ({ ...e, type: 'expense' }))
    ];

    // Filter transactions
    let filteredTransactions = allTransactions;
    if (filter === 'donations') {
      filteredTransactions = allTransactions.filter(t => t.type === 'donation');
    } else if (filter === 'expenses') {
      filteredTransactions = allTransactions.filter(t => t.type === 'expense');
    }

    // Sort transactions
    filteredTransactions.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'oldest') {
        return a.timestamp - b.timestamp;
      } else if (sortBy === 'amount') {
        return parseFloat(b.amount) - parseFloat(a.amount);
      }
      return 0;
    });

    return filteredTransactions;
  }, [donations, expenses, filter, sortBy]);

  // Calculate running totals
  const { totalDonations, totalExpenses, runningBalance } = useMemo(() => {
    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const runningBalance = totalDonations - totalExpenses;
    
    return { totalDonations, totalExpenses, runningBalance };
  }, [donations, expenses]);

  const formatEther = (amount) => {
    return parseFloat(amount).toFixed(4);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEtherscanLink = (txHash) => {
    return service.getEtherscanLink(txHash);
  };

  return (
    <div className={styles.container}>
      {/* Summary Cards */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>Money In</h3>
          <div className={styles.amount} style={{ color: '#10b981' }}>
            +{formatEther(totalDonations)} ETH
          </div>
          <div className={styles.count}>
            {donations.length} donation{donations.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h3>Money Out</h3>
          <div className={styles.amount} style={{ color: '#ef4444' }}>
            -{formatEther(totalExpenses)} ETH
          </div>
          <div className={styles.count}>
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h3>Net Balance</h3>
          <div 
            className={styles.amount} 
            style={{ color: runningBalance >= 0 ? '#10b981' : '#ef4444' }}
          >
            {runningBalance >= 0 ? '+' : ''}{formatEther(runningBalance)} ETH
          </div>
          <div className={styles.count}>
            Current available
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({transactions.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'donations' ? styles.active : ''}`}
            onClick={() => setFilter('donations')}
          >
            Donations ({donations.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'expenses' ? styles.active : ''}`}
            onClick={() => setFilter('expenses')}
          >
            Expenses ({expenses.length})
          </button>
        </div>

        <div className={styles.sort}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No Transactions Yet</h3>
          <p>
            {filter === 'all' && 'No transactions have been made for this campaign yet.'}
            {filter === 'donations' && 'No donations have been received yet.'}
            {filter === 'expenses' && 'No expenses have been recorded yet.'}
          </p>
        </div>
      ) : (
        <div className={styles.ledger}>
          {transactions.map((tx, index) => (
            <div key={`${tx.type}-${tx.txHash}-${index}`} className={styles.transaction}>
              <div className={styles.transactionIcon}>
                {tx.type === 'donation' ? (
                  <div className={styles.donationIcon}>↗</div>
                ) : (
                  <div className={styles.expenseIcon}>↙</div>
                )}
              </div>

              <div className={styles.transactionContent}>
                <div className={styles.transactionHeader}>
                  <div className={styles.transactionType}>
                    {tx.type === 'donation' ? (
                      <>
                        <strong>Donation</strong> from {formatAddress(tx.donor)}
                      </>
                    ) : (
                      <>
                        <strong>Expense</strong> to {formatAddress(tx.recipient)}
                      </>
                    )}
                  </div>
                  <div 
                    className={styles.transactionAmount}
                    style={{ color: tx.type === 'donation' ? '#10b981' : '#ef4444' }}
                  >
                    {tx.type === 'donation' ? '+' : '-'}{formatEther(tx.amount)} ETH
                  </div>
                </div>

                {tx.description && (
                  <div className={styles.transactionDescription}>
                    {tx.description}
                  </div>
                )}

                <div className={styles.transactionMeta}>
                  <span className={styles.timestamp}>
                    {formatDate(tx.timestamp)}
                  </span>
                  <a 
                    href={getEtherscanLink(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.etherscanLink}
                  >
                    View on Etherscan ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionLedger;