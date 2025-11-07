import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import styles from './CreateCampaign.module.css';

const CreateCampaign = ({ account, service = campaignService }) => {
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!metadata.trim()) {
      setError('Please enter campaign details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await service.createCampaign(metadata.trim());
      
      if (result.campaignId) {
        navigate(`/campaign/${result.campaignId}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.header}>
          <h2>Create New Campaign</h2>
          <p>Start a transparent charity campaign on the blockchain</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="metadata" className={styles.label}>
              Campaign Title & Description
            </label>
            <textarea
              id="metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder="Enter your campaign title and description. Be clear about your goals, how funds will be used, and the impact you plan to make."
              className={styles.textarea}
              rows={6}
              disabled={loading}
            />
            <div className={styles.hint}>
              This information will be stored on the blockchain and cannot be changed later.
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.info}>
            <h4>What happens next?</h4>
            <ul>
              <li>Your campaign will be created on the blockchain</li>
              <li>People can donate ETH to support your cause</li>
              <li>You can record expenses with receipts and descriptions</li>
              <li>All transactions are publicly visible and transparent</li>
              <li>You pay a small gas fee to create the campaign</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !metadata.trim()}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating Campaign...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          </div>
        </form>

        <div className={styles.accountInfo}>
          <div className={styles.account}>
            <span>Campaign Owner:</span>
            <span className={styles.address}>{account}</span>
          </div>
          <div className={styles.note}>
            Only you will be able to record expenses and withdraw funds from this campaign.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;