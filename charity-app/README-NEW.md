# Transparity - Transparent Charity Platform

A blockchain-based charity platform that provides complete transparency for donations and expenses. Built with Solidity smart contracts and React frontend, deployed on Ethereum Sepolia testnet.

## Getting Started

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Sepolia testnet ETH (from faucet)

### Installation

1. **Clone and Install Dependencies**
```bash
cd charity-app
npm install
```

2. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your Infura project ID and private key
```

3. **Run Tests**
```bash
npx hardhat test
```

4. **Deploy to Sepolia**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

5. **Update Frontend Config**
```bash
# Copy the deployed contract address to .env
echo "REACT_APP_CAMPAIGN_CONTRACT_ADDRESS=0x..." >> .env
```

6. **Start Frontend**
```bash
npm start
```


**Frontend**: ✅ React + ethers.js + MetaMask integration
**Real-time**: ✅ Event subscription with automatic updates
**Transparency**: ✅ Complete ledger with Etherscan links
**UI/UX**: ✅ CSS Modules + optimistic UI + responsive design

## 📝 License

This project is for educational/demonstration purposes.
