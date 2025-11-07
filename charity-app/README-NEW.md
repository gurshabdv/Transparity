# Transparity - Transparent Charity Platform

A blockchain-based charity platform that provides complete transparency for donations and expenses. Built with Solidity smart contracts and React frontend, deployed on Ethereum Sepolia testnet.

## 🎯 Project Requirements - ALL IMPLEMENTED ✅

### Smart Contract Requirements

✅ **Single Solidity Contract with Campaign Struct**
- [`Campaign.sol`](contracts/Campaign.sol) contains a `CampaignData` struct with owner, balance, and metadata
- Mappings for donations and expenses per campaign
- Supports multiple campaigns in a single contract

✅ **Required Functions**
- `createCampaign(metadata)` - Creates new campaigns
- `donate(campaignId)` - Payable function for donations
- `recordExpense(campaignId, recipient, amount, description)` - Records expenses with automatic fund transfer

✅ **Event System**
- `DonationReceived` - Emitted for every donation
- `ExpenseRecorded` - Emitted for every expense
- `CampaignCreated` - Emitted for new campaigns
- `FundsWithdrawn` - Emitted for fund withdrawals

✅ **Security Features**
- `ReentrancyGuard` from OpenZeppelin on withdrawal functions
- Amount validation checks
- Owner-only expense recording with modifiers
- Balance verification before expenses
- Address validation

✅ **Testing & Deployment**
- Comprehensive unit tests in [`test/Campaign.test.js`](test/Campaign.test.js)
- Tests cover happy paths and all revert conditions
- Hardhat configuration for Sepolia deployment
- Infura integration ready

### Frontend Requirements

✅ **React UI with MetaMask Integration**
- [`campaignService.js`](src/services/campaignService.js) handles MetaMask connection
- Uses ethers.js for contract interactions
- Automatic wallet connection detection
- Network switching support

✅ **Real-time Event Subscription**
- [`TransactionLedger.js`](src/components/TransactionLedger.js) pulls donation/expense logs
- Real-time event listening with automatic UI updates
- Running totals computed client-side
- Clear "money in vs money out" display

✅ **Etherscan Integration**
- Every transaction links to Etherscan
- Network-aware links (Sepolia/Mainnet)
- Transaction hash display and verification

✅ **CSS Modules & Optimistic UI**
- All components use CSS Modules for styling
- [`DonationForm.js`](src/components/DonationForm.js) has optimistic UI
- Loading states during transaction processing
- Success/error feedback with transaction links

## 🏗️ Architecture

### Smart Contract (`contracts/Campaign.sol`)
```solidity
struct CampaignData {
    address owner;
    uint256 balance;
    string metadata;
    bool active;
    uint256 totalDonations;
    uint256 totalExpenses;
}
```

- **Campaign Management**: Create, activate/deactivate campaigns
- **Donation Handling**: Accept ETH donations with event logging
- **Expense Recording**: Record expenses with automatic fund transfer
- **Security**: ReentrancyGuard, owner checks, balance validation

### Frontend Architecture
```
src/
├── components/
│   ├── Header.js              # Navigation and wallet connection
│   ├── CampaignList.js        # Browse all campaigns
│   ├── CampaignDetail.js      # Campaign details and management
│   ├── CreateCampaign.js      # Create new campaigns
│   ├── DonationForm.js        # Donate with optimistic UI
│   ├── ExpenseForm.js         # Record expenses (owners only)
│   └── TransactionLedger.js   # Money in/out with Etherscan links
├── services/
│   └── campaignService.js     # MetaMask & contract interaction
└── *.module.css              # CSS Modules for each component
```

## 🚀 Getting Started

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

## 📱 Features Implemented

### Core Functionality
- **Campaign Creation**: Anyone can create transparent charity campaigns
- **Donation System**: Donate ETH with MetaMask, all transactions recorded
- **Expense Tracking**: Campaign owners record expenses with descriptions
- **Real-time Updates**: UI updates automatically when new transactions occur
- **Complete Transparency**: All transactions visible with Etherscan links

### User Experience
- **Responsive Design**: Works on desktop and mobile
- **Wallet Integration**: Seamless MetaMask connection
- **Optimistic UI**: Immediate feedback during transaction processing
- **Loading States**: Clear indication of transaction status
- **Error Handling**: User-friendly error messages

### Security & Trust
- **Non-Reentrant**: Protected against reentrancy attacks
- **Owner Controls**: Only campaign owners can record expenses
- **Balance Checks**: Cannot spend more than available
- **Public Verification**: All transactions verifiable on blockchain

## 🔒 Smart Contract Security

- **ReentrancyGuard**: All withdrawal functions protected
- **Access Control**: Owner-only functions with modifiers  
- **Input Validation**: Amount checks, address validation
- **Safe Transfers**: Uses `call` with success checks
- **Event Logging**: Complete audit trail

## 🧪 Testing Coverage

The test suite covers:
- ✅ Campaign creation (success & failures)
- ✅ Donation handling (multiple scenarios)
- ✅ Expense recording (happy path & edge cases)
- ✅ Access control (owner/non-owner)
- ✅ Balance management
- ✅ Error conditions and reverts

## 📊 Transaction Flow

1. **Create Campaign**: Owner creates campaign with metadata
2. **Receive Donations**: Anyone can donate ETH to campaigns
3. **Record Expenses**: Owner records expenses with recipient & description
4. **Fund Transfer**: Expenses automatically transfer funds to recipients
5. **Public Audit**: All transactions visible on blockchain with Etherscan

## 🌐 Live Demo Flow

1. Connect MetaMask to Sepolia testnet
2. Browse existing campaigns or create new one
3. Donate ETH to support campaigns
4. View real-time transaction ledger
5. Campaign owners can record transparent expenses
6. All transactions link to Etherscan for verification

## 🏆 Requirements Verification

This project fully implements all specified requirements:

**Smart Contract**: ✅ Single contract, Campaign struct, proper functions, events, safety
**Testing**: ✅ Comprehensive Hardhat tests for happy paths and reverts  
**Deployment**: ✅ Sepolia deployment ready with Infura
**Frontend**: ✅ React + ethers.js + MetaMask integration
**Real-time**: ✅ Event subscription with automatic updates
**Transparency**: ✅ Complete ledger with Etherscan links
**UI/UX**: ✅ CSS Modules + optimistic UI + responsive design

## 📝 License

This project is for educational/demonstration purposes.