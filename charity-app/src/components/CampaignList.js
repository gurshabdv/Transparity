import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import campaignService from '../services/campaignService';
import styles from './CampaignList.module.css';

const CampaignList = ({ account, service = campaignService }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (service) {
      loadCampaigns();
    }
  }, [service]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const totalCampaigns = await service.getTotalCampaigns();
      
      const campaignPromises = [];
      for (let i = 1; i <= totalCampaigns; i++) {
        campaignPromises.push(
          service.getCampaign(i).then(campaign => ({
            id: i,
            ...campaign
          }))
        );
      }
      
      const campaignsData = await Promise.all(campaignPromises);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatEther = (amount) => {
    return parseFloat(amount).toFixed(4);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error Loading Campaigns</h3>
          <p>{error}</p>
          <button onClick={loadCampaigns} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Active Campaigns</h2>
        <Link to="/create" className={styles.createButton}>
          Create New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className={styles.empty}>
          <h3>No Campaigns Yet</h3>
          <p>Be the first to create a campaign and make a difference!</p>
          <Link to="/create" className={styles.createFirstButton}>
            Create First Campaign
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{campaign.metadata}</h3>
                <span className={`${styles.status} ${campaign.active ? styles.active : styles.inactive}`}>
                  {campaign.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.label}>Total Raised</span>
                  <span className={styles.value}>
                    {formatEther(campaign.totalDonations)} ETH
                  </span>
                </div>
                
                <div className={styles.stat}>
                  <span className={styles.label}>Total Spent</span>
                  <span className={styles.value}>
                    {formatEther(campaign.totalExpenses)} ETH
                  </span>
                </div>
                
                <div className={styles.stat}>
                  <span className={styles.label}>Available</span>
                  <span className={styles.value}>
                    {formatEther(campaign.balance)} ETH
                  </span>
                </div>
              </div>

              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{
                      width: campaign.totalDonations > 0 
                        ? `${(parseFloat(campaign.totalExpenses) / parseFloat(campaign.totalDonations)) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <span className={styles.progressText}>
                  {campaign.totalDonations > 0 
                    ? `${((parseFloat(campaign.totalExpenses) / parseFloat(campaign.totalDonations)) * 100).toFixed(1)}% spent`
                    : 'No donations yet'
                  }
                </span>
              </div>

              <div className={styles.owner}>
                <span className={styles.ownerLabel}>Owner:</span>
                <span className={styles.ownerAddress}>
                  {campaign.owner === account ? 'You' : `${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}
                </span>
              </div>

              <Link 
                to={`/campaign/${campaign.id}`} 
                className={styles.viewButton}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;