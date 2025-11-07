const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campaign Contract", function () {
    let Campaign;
    let campaign;
    let owner;
    let donor1;
    let donor2;
    let recipient;
    let addrs;

    beforeEach(async function () {
        Campaign = await ethers.getContractFactory("Campaign");
        [owner, donor1, donor2, recipient, ...addrs] = await ethers.getSigners();
        campaign = await Campaign.deploy();
        await campaign.deployed();
    });

    describe("Campaign Creation", function () {
        it("Should create a campaign successfully", async function () {
            const metadata = "Test Campaign for Children's Education";
            await campaign.createCampaign(metadata);

            const campaignData = await campaign.getCampaign(1);
            expect(campaignData.owner).to.equal(owner.address);
            expect(campaignData.balance.toNumber()).to.equal(0);
            expect(campaignData.metadata).to.equal(metadata);
            expect(campaignData.active).to.be.true;
        });

        it("Should revert when creating campaign with empty metadata", async function () {
            await expect(campaign.createCampaign(""))
                .to.be.revertedWith("Metadata cannot be empty");
        });

        it("Should increment campaign counter correctly", async function () {
            await campaign.createCampaign("Campaign 1");
            await campaign.createCampaign("Campaign 2");
            
            const totalCampaigns = await campaign.getTotalCampaigns();
            expect(totalCampaigns.toNumber()).to.equal(2);
        });
    });

    describe("Donations", function () {
        beforeEach(async function () {
            await campaign.createCampaign("Test Campaign");
        });

        it("Should accept donations successfully", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            
            await campaign.connect(donor1).donate(1, { value: donationAmount });

            const campaignData = await campaign.getCampaign(1);
            expect(campaignData.balance.toString()).to.equal(donationAmount.toString());
            expect(campaignData.totalDonations.toString()).to.equal(donationAmount.toString());
            
            const donorAmount = await campaign.getDonationAmount(1, donor1.address);
            expect(donorAmount.toString()).to.equal(donationAmount.toString());
        });

        it("Should handle multiple donations from same donor", async function () {
            const donationAmount1 = ethers.utils.parseEther("0.5");
            const donationAmount2 = ethers.utils.parseEther("1.5");
            
            await campaign.connect(donor1).donate(1, { value: donationAmount1 });
            await campaign.connect(donor1).donate(1, { value: donationAmount2 });
            
            const totalDonation = donationAmount1.add(donationAmount2);
            const donorAmount = await campaign.getDonationAmount(1, donor1.address);
            expect(donorAmount.toString()).to.equal(totalDonation.toString());
            
            const campaignData = await campaign.getCampaign(1);
            expect(campaignData.balance.toString()).to.equal(totalDonation.toString());
        });

        it("Should handle donations from multiple donors", async function () {
            const donationAmount1 = ethers.utils.parseEther("1.0");
            const donationAmount2 = ethers.utils.parseEther("2.0");
            
            await campaign.connect(donor1).donate(1, { value: donationAmount1 });
            await campaign.connect(donor2).donate(1, { value: donationAmount2 });
            
            const expectedTotal = donationAmount1.add(donationAmount2);
            const campaignData = await campaign.getCampaign(1);
            expect(campaignData.balance.toString()).to.equal(expectedTotal.toString());
            expect(campaignData.totalDonations.toString()).to.equal(expectedTotal.toString());
        });

        it("Should revert donation with zero amount", async function () {
            await expect(campaign.connect(donor1).donate(1, { value: 0 }))
                .to.be.revertedWith("Donation must be greater than 0");
        });

        it("Should revert donation to non-existent campaign", async function () {
            await expect(campaign.connect(donor1).donate(999, { value: ethers.utils.parseEther("1.0") }))
                .to.be.revertedWith("Campaign does not exist");
        });

        it("Should revert donation to inactive campaign", async function () {
            await campaign.toggleCampaign(1); // Deactivate campaign
            
            await expect(campaign.connect(donor1).donate(1, { value: ethers.utils.parseEther("1.0") }))
                .to.be.revertedWith("Campaign is not active");
        });
    });

    describe("Expense Recording", function () {
        beforeEach(async function () {
            await campaign.createCampaign("Test Campaign");
            await campaign.connect(donor1).donate(1, { value: ethers.utils.parseEther("5.0") });
        });

        it("Should record expense successfully", async function () {
            const expenseAmount = ethers.utils.parseEther("1.0");
            const description = "Medical supplies";
            
            const initialBalance = await ethers.provider.getBalance(recipient.address);
            
            await campaign.recordExpense(1, recipient.address, expenseAmount, description);

            const campaignData = await campaign.getCampaign(1);
            expect(campaignData.balance.toString()).to.equal(ethers.utils.parseEther("4.0").toString());
            expect(campaignData.totalExpenses.toString()).to.equal(expenseAmount.toString());
            
            const finalBalance = await ethers.provider.getBalance(recipient.address);
            expect(finalBalance.sub(initialBalance).toString()).to.equal(expenseAmount.toString());
            
            const expenses = await campaign.getCampaignExpenses(1);
            expect(expenses.length).to.equal(1);
            expect(expenses[0].recipient).to.equal(recipient.address);
            expect(expenses[0].amount.toString()).to.equal(expenseAmount.toString());
            expect(expenses[0].description).to.equal(description);
        });

        it("Should revert expense recording by non-owner", async function () {
            const expenseAmount = ethers.utils.parseEther("1.0");
            
            await expect(campaign.connect(donor1).recordExpense(1, recipient.address, expenseAmount, "Test expense"))
                .to.be.revertedWith("Only campaign owner can perform this action");
        });

        it("Should revert expense with zero amount", async function () {
            await expect(campaign.recordExpense(1, recipient.address, 0, "Test expense"))
                .to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should revert expense with zero address recipient", async function () {
            const expenseAmount = ethers.utils.parseEther("1.0");
            
            await expect(campaign.recordExpense(1, ethers.constants.AddressZero, expenseAmount, "Test expense"))
                .to.be.revertedWith("Recipient cannot be zero address");
        });

        it("Should revert expense with empty description", async function () {
            const expenseAmount = ethers.utils.parseEther("1.0");
            
            await expect(campaign.recordExpense(1, recipient.address, expenseAmount, ""))
                .to.be.revertedWith("Description cannot be empty");
        });

        it("Should revert expense exceeding campaign balance", async function () {
            const expenseAmount = ethers.utils.parseEther("10.0"); // More than the 5 ETH donated
            
            await expect(campaign.recordExpense(1, recipient.address, expenseAmount, "Expensive item"))
                .to.be.revertedWith("Insufficient campaign balance");
        });

        it("Should revert expense recording for non-existent campaign", async function () {
            const expenseAmount = ethers.utils.parseEther("1.0");
            
            await expect(campaign.recordExpense(999, recipient.address, expenseAmount, "Test expense"))
                .to.be.revertedWith("Campaign does not exist");
        });
    });

    describe("Fund Withdrawal", function () {
        beforeEach(async function () {
            await campaign.createCampaign("Test Campaign");
            await campaign.connect(donor1).donate(1, { value: ethers.utils.parseEther("5.0") });
        });

        it("Should allow owner to withdraw funds", async function () {
            const withdrawAmount = ethers.utils.parseEther("2.0");
            
            await campaign.withdrawFunds(1, withdrawAmount);

            const campaignData = await campaign.getCampaign(1);
            expect(campaignData.balance.toString()).to.equal(ethers.utils.parseEther("3.0").toString());
        });

        it("Should revert withdrawal by non-owner", async function () {
            const withdrawAmount = ethers.utils.parseEther("1.0");
            
            await expect(campaign.connect(donor1).withdrawFunds(1, withdrawAmount))
                .to.be.revertedWith("Only campaign owner can perform this action");
        });

        it("Should revert withdrawal exceeding balance", async function () {
            const withdrawAmount = ethers.utils.parseEther("10.0");
            
            await expect(campaign.withdrawFunds(1, withdrawAmount))
                .to.be.revertedWith("Insufficient campaign balance");
        });

        it("Should revert withdrawal with zero amount", async function () {
            await expect(campaign.withdrawFunds(1, 0))
                .to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Campaign Management", function () {
        beforeEach(async function () {
            await campaign.createCampaign("Test Campaign");
        });

        it("Should allow owner to toggle campaign status", async function () {
            let campaignData = await campaign.getCampaign(1);
            expect(campaignData.active).to.be.true;
            
            await campaign.toggleCampaign(1);
            
            campaignData = await campaign.getCampaign(1);
            expect(campaignData.active).to.be.false;
            
            await campaign.toggleCampaign(1);
            
            campaignData = await campaign.getCampaign(1);
            expect(campaignData.active).to.be.true;
        });

        it("Should revert toggle by non-owner", async function () {
            await expect(campaign.connect(donor1).toggleCampaign(1))
                .to.be.revertedWith("Only campaign owner can perform this action");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await campaign.createCampaign("Test Campaign");
            await campaign.connect(donor1).donate(1, { value: ethers.utils.parseEther("3.0") });
            await campaign.recordExpense(1, recipient.address, ethers.utils.parseEther("1.0"), "Test expense");
        });

        it("Should return correct campaign balance", async function () {
            const balance = await campaign.getCampaignBalance(1);
            expect(balance.toString()).to.equal(ethers.utils.parseEther("2.0").toString());
        });

        it("Should return campaign expenses", async function () {
            const expenses = await campaign.getCampaignExpenses(1);
            expect(expenses.length).to.equal(1);
            expect(expenses[0].amount.toString()).to.equal(ethers.utils.parseEther("1.0").toString());
            expect(expenses[0].description).to.equal("Test expense");
        });
    });

    // Helper function to get current block timestamp
    async function getBlockTimestamp() {
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        return block.timestamp;
    }
});