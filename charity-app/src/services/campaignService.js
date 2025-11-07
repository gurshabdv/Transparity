import { ethers } from 'ethers';

// Contract ABI - This would normally be imported from the compiled contract artifacts
const CAMPAIGN_ABI = [
    "function createCampaign(string memory _metadata) public returns (uint256)",
    "function donate(uint256 _campaignId) public payable",
    "function recordExpense(uint256 _campaignId, address _recipient, uint256 _amount, string memory _description) public",
    "function withdrawFunds(uint256 _campaignId, uint256 _amount) public",
    "function getCampaign(uint256 _campaignId) public view returns (tuple(address owner, uint256 balance, string metadata, bool active, uint256 totalDonations, uint256 totalExpenses))",
    "function getCampaignExpenses(uint256 _campaignId) public view returns (tuple(address recipient, uint256 amount, string description, uint256 timestamp, uint256 campaignId)[])",
    "function getDonationAmount(uint256 _campaignId, address _donor) public view returns (uint256)",
    "function getCampaignBalance(uint256 _campaignId) public view returns (uint256)",
    "function getTotalCampaigns() public view returns (uint256)",
    "function toggleCampaign(uint256 _campaignId) public",
    "event CampaignCreated(uint256 indexed campaignId, address indexed owner, string metadata)",
    "event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 timestamp)",
    "event ExpenseRecorded(uint256 indexed campaignId, address indexed recipient, uint256 amount, string description, uint256 timestamp)",
    "event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount)"
];

// Contract address - should be set after deployment
const CAMPAIGN_CONTRACT_ADDRESS = process.env.REACT_APP_CAMPAIGN_CONTRACT_ADDRESS || '';

class CampaignService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = null;
    }

    // Initialize connection to MetaMask
    async connectWallet() {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install MetaMask from https://metamask.io and refresh this page.');
        }

        // Check if MetaMask is the provider
        if (!window.ethereum.isMetaMask) {
            throw new Error('Please use MetaMask as your wallet provider.');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            this.account = accounts[0];
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            if (CAMPAIGN_CONTRACT_ADDRESS) {
                this.contract = new ethers.Contract(
                    CAMPAIGN_CONTRACT_ADDRESS,
                    CAMPAIGN_ABI,
                    this.signer
                );
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.signer = this.provider.getSigner();
                    if (CAMPAIGN_CONTRACT_ADDRESS) {
                        this.contract = new ethers.Contract(
                            CAMPAIGN_CONTRACT_ADDRESS,
                            CAMPAIGN_ABI,
                            this.signer
                        );
                    }
                } else {
                    this.disconnect();
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            return this.account;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    // Disconnect wallet
    disconnect() {
        this.account = null;
        this.provider = null;
        this.signer = null;
        this.contract = null;
    }

    // Check if wallet is connected
    isConnected() {
        return !!this.account;
    }

    // Get current account
    getAccount() {
        return this.account;
    }

    // Get provider for read-only operations
    getProvider() {
        if (!this.provider) {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
        }
        return this.provider;
    }

    // Get contract instance
    getContract() {
        if (!this.contract) {
            throw new Error('Contract not initialized. Connect wallet first.');
        }
        return this.contract;
    }

    // Create a new campaign
    async createCampaign(metadata) {
        const contract = this.getContract();
        const tx = await contract.createCampaign(metadata);
        const receipt = await tx.wait();
        
        // Get campaign ID from the event
        const event = receipt.events?.find(e => e.event === 'CampaignCreated');
        const campaignId = event?.args?.campaignId;
        
        return {
            tx,
            receipt,
            campaignId: campaignId ? campaignId.toNumber() : null
        };
    }

    // Donate to a campaign
    async donate(campaignId, amount) {
        const contract = this.getContract();
        const tx = await contract.donate(campaignId, {
            value: ethers.utils.parseEther(amount.toString())
        });
        const receipt = await tx.wait();
        return { tx, receipt };
    }

    // Record an expense (owner only)
    async recordExpense(campaignId, recipient, amount, description) {
        const contract = this.getContract();
        const tx = await contract.recordExpense(
            campaignId,
            recipient,
            ethers.utils.parseEther(amount.toString()),
            description
        );
        const receipt = await tx.wait();
        return { tx, receipt };
    }

    // Withdraw funds (owner only)
    async withdrawFunds(campaignId, amount) {
        const contract = this.getContract();
        const tx = await contract.withdrawFunds(
            campaignId,
            ethers.utils.parseEther(amount.toString())
        );
        const receipt = await tx.wait();
        return { tx, receipt };
    }

    // Get campaign details
    async getCampaign(campaignId) {
        const contract = this.getContract();
        const campaign = await contract.getCampaign(campaignId);
        return {
            owner: campaign.owner,
            balance: ethers.utils.formatEther(campaign.balance),
            metadata: campaign.metadata,
            active: campaign.active,
            totalDonations: ethers.utils.formatEther(campaign.totalDonations),
            totalExpenses: ethers.utils.formatEther(campaign.totalExpenses)
        };
    }

    // Get campaign expenses
    async getCampaignExpenses(campaignId) {
        const contract = this.getContract();
        const expenses = await contract.getCampaignExpenses(campaignId);
        return expenses.map(expense => ({
            recipient: expense.recipient,
            amount: ethers.utils.formatEther(expense.amount),
            description: expense.description,
            timestamp: expense.timestamp.toNumber(),
            campaignId: expense.campaignId.toNumber()
        }));
    }

    // Get donation amount for a specific donor
    async getDonationAmount(campaignId, donor) {
        const contract = this.getContract();
        const amount = await contract.getDonationAmount(campaignId, donor);
        return ethers.utils.formatEther(amount);
    }

    // Get total campaigns count
    async getTotalCampaigns() {
        const contract = this.getContract();
        const count = await contract.getTotalCampaigns();
        return count.toNumber();
    }

    // Get event logs for donations
    async getDonationLogs(campaignId, fromBlock = 0) {
        const contract = this.getContract();
        const filter = contract.filters.DonationReceived(campaignId);
        const logs = await contract.queryFilter(filter, fromBlock);
        
        return logs.map(log => ({
            campaignId: log.args.campaignId.toNumber(),
            donor: log.args.donor,
            amount: ethers.utils.formatEther(log.args.amount),
            timestamp: log.args.timestamp.toNumber(),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber
        }));
    }

    // Get event logs for expenses
    async getExpenseLogs(campaignId, fromBlock = 0) {
        const contract = this.getContract();
        const filter = contract.filters.ExpenseRecorded(campaignId);
        const logs = await contract.queryFilter(filter, fromBlock);
        
        return logs.map(log => ({
            campaignId: log.args.campaignId.toNumber(),
            recipient: log.args.recipient,
            amount: ethers.utils.formatEther(log.args.amount),
            description: log.args.description,
            timestamp: log.args.timestamp.toNumber(),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber
        }));
    }

    // Subscribe to real-time events
    subscribeToEvents(campaignId, callback) {
        const contract = this.getContract();
        
        const donationFilter = contract.filters.DonationReceived(campaignId);
        const expenseFilter = contract.filters.ExpenseRecorded(campaignId);
        
        contract.on(donationFilter, (campaignId, donor, amount, timestamp, event) => {
            callback({
                type: 'donation',
                campaignId: campaignId.toNumber(),
                donor,
                amount: ethers.utils.formatEther(amount),
                timestamp: timestamp.toNumber(),
                txHash: event.transactionHash
            });
        });
        
        contract.on(expenseFilter, (campaignId, recipient, amount, description, timestamp, event) => {
            callback({
                type: 'expense',
                campaignId: campaignId.toNumber(),
                recipient,
                amount: ethers.utils.formatEther(amount),
                description,
                timestamp: timestamp.toNumber(),
                txHash: event.transactionHash
            });
        });
    }

    // Get Etherscan link for transaction
    getEtherscanLink(txHash) {
        const network = process.env.REACT_APP_NETWORK || 'sepolia';
        if (network === 'mainnet') {
            return `https://etherscan.io/tx/${txHash}`;
        } else {
            return `https://${network}.etherscan.io/tx/${txHash}`;
        }
    }
}

// Export singleton instance
const campaignService = new CampaignService();
export default campaignService;