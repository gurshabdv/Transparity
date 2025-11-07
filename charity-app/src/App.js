import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import CreateCampaign from './components/CreateCampaign';
import campaignService from './services/campaignService';
import MockCampaignService from './services/mockCampaignService';
import './App.css';

const App = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Detect MetaMask and initialize appropriate service
    const initializeService = async () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        setService(campaignService);
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      } else {
        // No MetaMask detected, use mock service for demo
        const mockService = new MockCampaignService();
        setService(mockService);
        setIsDemo(true);
        // Auto-connect to demo mode
        setTimeout(async () => {
          const demoAccount = await mockService.connectWallet();
          setAccount(demoAccount);
        }, 1000);
      }
    };

    initializeService();
  }, []);

  const connectWallet = async () => {
    if (!service) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const account = await service.connectWallet();
      setAccount(account);
    } catch (error) {
      setError(error.message);
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (service) {
      service.disconnect();
      setAccount(null);
    }
  };

  return (
    <Router>
      <div className="App">
        <Header 
          account={account}
          loading={loading}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
        
        {isDemo && (
          <div className="demo-banner">
            <p>🎭 Demo Mode Active - No MetaMask required! All transactions are simulated.</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <main className="main-content">
          {!account ? (
            <div className="welcome-section">
              <h1>Welcome to Transparity</h1>
              <p>A transparent charity platform powered by blockchain technology.</p>
              {!isDemo ? (
                <>
                  <p>Connect your MetaMask wallet to get started.</p>
                  <button 
                    onClick={connectWallet} 
                    disabled={loading}
                    className="connect-button"
                  >
                    {loading ? 'Connecting...' : 'Connect MetaMask'}
                  </button>
                </>
              ) : (
                <p>Loading demo environment...</p>
              )}
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<CampaignList account={account} service={service} />} />
              <Route path="/create" element={<CreateCampaign account={account} service={service} />} />
              <Route path="/campaign/:id" element={<CampaignDetail account={account} service={service} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
};

export default App;
