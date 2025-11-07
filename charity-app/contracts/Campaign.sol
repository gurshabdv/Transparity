// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Campaign is ReentrancyGuard {
    struct CampaignData {
        address owner;
        uint256 balance;
        string metadata;
        bool active;
        uint256 totalDonations;
        uint256 totalExpenses;
    }
    
    struct Expense {
        address recipient;
        uint256 amount;
        string description;
        uint256 timestamp;
        uint256 campaignId;
    }
    
    mapping(uint256 => CampaignData) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;
    mapping(uint256 => Expense[]) public expenses;
    
    uint256 public campaignCounter;
    
    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string metadata);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 timestamp);
    event ExpenseRecorded(uint256 indexed campaignId, address indexed recipient, uint256 amount, string description, uint256 timestamp);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    
    modifier onlyCampaignOwner(uint256 _campaignId) {
        require(campaigns[_campaignId].owner == msg.sender, "Only campaign owner can perform this action");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].active, "Campaign is not active");
        _;
    }
    
    function createCampaign(string memory _metadata) public returns (uint256) {
        require(bytes(_metadata).length > 0, "Metadata cannot be empty");
        
        campaignCounter++;
        
        campaigns[campaignCounter] = CampaignData({
            owner: msg.sender,
            balance: 0,
            metadata: _metadata,
            active: true,
            totalDonations: 0,
            totalExpenses: 0
        });
        
        emit CampaignCreated(campaignCounter, msg.sender, _metadata);
        return campaignCounter;
    }
    
    function donate(uint256 _campaignId) public payable campaignExists(_campaignId) campaignActive(_campaignId) {
        require(msg.value > 0, "Donation must be greater than 0");
        
        campaigns[_campaignId].balance += msg.value;
        campaigns[_campaignId].totalDonations += msg.value;
        donations[_campaignId][msg.sender] += msg.value;
        
        emit DonationReceived(_campaignId, msg.sender, msg.value, block.timestamp);
    }
    
    function recordExpense(uint256 _campaignId, address _recipient, uint256 _amount, string memory _description) 
        public 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
        onlyCampaignOwner(_campaignId) 
    {
        require(_recipient != address(0), "Recipient cannot be zero address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= campaigns[_campaignId].balance, "Insufficient campaign balance");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        campaigns[_campaignId].balance -= _amount;
        campaigns[_campaignId].totalExpenses += _amount;
        
        Expense memory newExpense = Expense({
            recipient: _recipient,
            amount: _amount,
            description: _description,
            timestamp: block.timestamp,
            campaignId: _campaignId
        });
        
        expenses[_campaignId].push(newExpense);
        
        // Transfer funds to recipient
        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit ExpenseRecorded(_campaignId, _recipient, _amount, _description, block.timestamp);
    }
    
    function withdrawFunds(uint256 _campaignId, uint256 _amount) 
        public 
        nonReentrant 
        campaignExists(_campaignId) 
        onlyCampaignOwner(_campaignId) 
    {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= campaigns[_campaignId].balance, "Insufficient campaign balance");
        
        campaigns[_campaignId].balance -= _amount;
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(_campaignId, msg.sender, _amount);
    }
    
    // View functions
    function getCampaign(uint256 _campaignId) public view campaignExists(_campaignId) returns (CampaignData memory) {
        return campaigns[_campaignId];
    }
    
    function getCampaignExpenses(uint256 _campaignId) public view campaignExists(_campaignId) returns (Expense[] memory) {
        return expenses[_campaignId];
    }
    
    function getDonationAmount(uint256 _campaignId, address _donor) public view campaignExists(_campaignId) returns (uint256) {
        return donations[_campaignId][_donor];
    }
    
    function getCampaignBalance(uint256 _campaignId) public view campaignExists(_campaignId) returns (uint256) {
        return campaigns[_campaignId].balance;
    }
    
    function getTotalCampaigns() public view returns (uint256) {
        return campaignCounter;
    }
    
    // Emergency functions
    function toggleCampaign(uint256 _campaignId) public campaignExists(_campaignId) onlyCampaignOwner(_campaignId) {
        campaigns[_campaignId].active = !campaigns[_campaignId].active;
    }
}