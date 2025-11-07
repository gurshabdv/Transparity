import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import campaignService from '../services/campaignService';
import DonationForm from './DonationForm';
import ExpenseForm from './ExpenseForm';
import TransactionLedger from './TransactionLedger';
import styles from './CampaignDetail.module.css';

const CampaignDetail = ({ account, service = campaignService }) => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (service) {
      loadCampaignData();
      subscribeToEvents();
    }
  }, [id, service]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load campaign details
      const campaignData = await service.getCampaign(parseInt(id));
      setCampaign({ id: parseInt(id), ...campaignData });

      // Load donation logs
      const donationLogs = await service.getDonationLogs(parseInt(id));
      setDonations(donationLogs);

      // Load expense logs
      const expenseLogs = await service.getExpenseLogs(parseInt(id));
      setExpenses(expenseLogs);

    } catch (error) {
      console.error('Error loading campaign:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToEvents = () => {
    service.subscribeToEvents(parseInt(id), (event) => {
      if (event.type === 'donation') {
        setDonations(prev => [...prev, event]);
        // Refresh campaign data to update balances
        loadCampaignData();
      } else if (event.type === 'expense') {
        setExpenses(prev => [...prev, event]);
        // Refresh campaign data to update balances
        loadCampaignData();
      }
    });
  };

  const handleDonationSuccess = () => {
    loadCampaignData();
  };

  const handleExpenseSuccess = () => {
    loadCampaignData();
  };

  const formatEther = (amount) => {
    return parseFloat(amount).toFixed(4);
  };

  const isOwner = campaign?.owner?.toLowerCase() === account?.toLowerCase();



  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error Loading Campaign</h3>
          <p>{error || 'Campaign not found'}</p>
          <button onClick={loadCampaignData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalIn = parseFloat(campaign.totalDonations);
  const totalOut = parseFloat(campaign.totalExpenses);
  const balance = parseFloat(campaign.balance);

  return (
    <div className={styles.container}>
      {/* Campaign Header */}
      <div className={styles.header}>
        <div className={styles.campaignInfo}>
          <h1>{campaign.metadata}</h1>
          <div className={styles.ownerInfo}>
            <span className={styles.ownerLabel}>Campaign Owner:</span>
            <span className={styles.ownerAddress}>
              {isOwner ? 'You' : campaign.owner}
            </span>
            {isOwner && <span className={styles.ownerBadge}>Owner</span>}
          </div>
        </div>
        <div className={styles.status}>
          <span className={`${styles.statusBadge} ${campaign.active ? styles.active : styles.inactive}`}>
            {campaign.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>



      {/* Financial Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ↑
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Donations</span>
            <span className={styles.summaryValue}>{formatEther(campaign.totalDonations)} ETH</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            ↓
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Expenses</span>
            <span className={styles.summaryValue}>{formatEther(campaign.totalExpenses)} ETH</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            =
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Available Balance</span>
            <span className={styles.summaryValue}>{formatEther(campaign.balance)} ETH</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{
              width: totalIn > 0 ? `${(totalOut / totalIn) * 100}%` : '0%'
            }}
          ></div>
        </div>
        <div className={styles.progressLabels}>
          <span>0 ETH</span>
          <span>
            {totalIn > 0 ? `${((totalOut / totalIn) * 100).toFixed(1)}% spent` : 'No funds raised yet'}
          </span>
          <span>{formatEther(campaign.totalDonations)} ETH</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'donate' ? styles.active : ''}`}
          onClick={() => setActiveTab('donate')}
        >
          Donate
        </button>
        {isOwner && (
          <button 
            className={`${styles.tab} ${activeTab === 'manage' ? styles.active : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <TransactionLedger 
            donations={donations}
            expenses={expenses}
            service={service}
          />
        )}

        {activeTab === 'donate' && (
          <DonationForm 
            campaignId={campaign.id}
            onSuccess={handleDonationSuccess}
            service={service}
          />
        )}

        {activeTab === 'manage' && isOwner && (
          <ExpenseForm 
            campaignId={campaign.id}
            availableBalance={balance}
            onSuccess={handleExpenseSuccess}
            service={service}
          />
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;