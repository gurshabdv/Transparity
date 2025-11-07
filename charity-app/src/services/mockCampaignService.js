import { ethers } from 'ethers';

// Mock campaign service for demo purposes when MetaMask is not available
class MockCampaignService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = '0x742d35Cc6634C0532925a3b8D2C2Cb87Bf5208C1'; // Mock account
        this.isDemo = true;
    }

    async connectWallet() {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.account;
    }

    disconnect() {
        // Mock disconnect
        console.log('Demo wallet disconnected');
    }

    isConnected() {
        return true;
    }

    getAccount() {
        return this.account;
    }

    // Mock campaign creation
    async createCampaign(metadata) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        return {
            tx: { hash: mockTxHash },
            receipt: { transactionHash: mockTxHash },
            campaignId: Math.floor(Math.random() * 100) + 1
        };
    }

    // Mock donation
    async donate(campaignId, amount) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        return {
            tx: { hash: mockTxHash },
            receipt: { transactionHash: mockTxHash }
        };
    }

    // Mock expense recording
    async recordExpense(campaignId, recipient, amount, description) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        return {
            tx: { hash: mockTxHash },
            receipt: { transactionHash: mockTxHash }
        };
    }

    // Mock campaign data
    async getCampaign(campaignId) {
        return {
            owner: this.account,
            balance: '2.5432',
            metadata: campaignId === 1 ? 'Sample Campaign for Education' : `Demo Campaign ${campaignId}`,
            active: true,
            totalDonations: '5.0000',
            totalExpenses: '2.4568'
        };
    }

    async getTotalCampaigns() {
        return 3;
    }

    // Mock donation logs
    async getDonationLogs(campaignId) {
        return [
            {
                campaignId,
                donor: '0x742d35Cc6634C0532925a3b8D2C2Cb87Bf5208C1',
                amount: '1.0000',
                timestamp: Math.floor(Date.now() / 1000) - 3600,
                txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                blockNumber: 12345
            },
            {
                campaignId,
                donor: '0x8ba1f109551bD432803012645Hac136c345d1277',
                amount: '2.0000',
                timestamp: Math.floor(Date.now() / 1000) - 1800,
                txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                blockNumber: 12346
            }
        ];
    }

    // Mock expense logs
    async getExpenseLogs(campaignId) {
        return [
            {
                campaignId,
                recipient: '0x8ba1f109551bD432803012645Hac136c345d1277',
                amount: '1.5000',
                description: 'Medical supplies for rural clinic',
                timestamp: Math.floor(Date.now() / 1000) - 900,
                txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                blockNumber: 12347
            }
        ];
    }

    // Mock event subscription
    subscribeToEvents(campaignId, callback) {
        // Simulate occasional new events for demo
        setInterval(() => {
            if (Math.random() > 0.9) { // 10% chance every interval
                callback({
                    type: Math.random() > 0.5 ? 'donation' : 'expense',
                    campaignId,
                    donor: '0x742d35Cc6634C0532925a3b8D2C2Cb87Bf5208C1',
                    amount: (Math.random() * 2).toFixed(4),
                    timestamp: Math.floor(Date.now() / 1000),
                    txHash: `0x${Math.random().toString(16).substr(2, 64)}`
                });
            }
        }, 5000);
    }

    getEtherscanLink(txHash) {
        return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
}

export default MockCampaignService;