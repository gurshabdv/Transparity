import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ account, loading, onConnect, onDisconnect }) => {
  const location = useLocation();

  const formatAccount = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <h1>Transparity</h1>
            <span className={styles.tagline}>Transparent Charity Platform</span>
          </Link>
        </div>

        {account && (
          <nav className={styles.nav}>
            <Link 
              to="/" 
              className={location.pathname === '/' ? styles.active : ''}
            >
              Campaigns
            </Link>
            <Link 
              to="/create" 
              className={location.pathname === '/create' ? styles.active : ''}
            >
              Create Campaign
            </Link>
          </nav>
        )}

        <div className={styles.wallet}>
          {account ? (
            <div className={styles.connected}>
              <span className={styles.account}>
                <span className={styles.indicator}></span>
                {formatAccount(account)}
              </span>
              <button 
                onClick={onDisconnect}
                className={styles.disconnectButton}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnect}
              disabled={loading}
              className={styles.connectButton}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;