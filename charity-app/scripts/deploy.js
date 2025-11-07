const hre = require("hardhat");

async function main() {
    console.log("Deploying Campaign contract...");

    // Deploy the Campaign contract
    const Campaign = await hre.ethers.getContractFactory("Campaign");
    const campaign = await Campaign.deploy();

    await campaign.deployed();

    console.log("Campaign contract deployed to:", campaign.address);

    // Wait for a few block confirmations
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await campaign.deployTransaction.wait(5);

        // Verify the contract on Etherscan if on a testnet/mainnet
        try {
            await hre.run("verify:verify", {
                address: campaign.address,
                constructorArguments: [],
            });
            console.log("Contract verified on Etherscan");
        } catch (error) {
            console.log("Error verifying contract:", error.message);
        }
    }

    // Create a sample campaign for testing
    console.log("Creating a sample campaign...");
    const tx = await campaign.createCampaign("Sample Charity Campaign for Education");
    await tx.wait();
    console.log("Sample campaign created with ID: 1");

    console.log("\nDeployment Summary:");
    console.log("==================");
    console.log(`Network: ${hre.network.name}`);
    console.log(`Campaign Contract Address: ${campaign.address}`);
    console.log(`Transaction Hash: ${campaign.deployTransaction.hash}`);
    
    if (hre.network.name === "sepolia") {
        console.log(`\nView on Etherscan: https://sepolia.etherscan.io/address/${campaign.address}`);
    }
    
    console.log("\n📋 Next Steps:");
    console.log("==============");
    console.log("1. Copy the contract address above");
    console.log("2. Create a .env file in the project root (copy from .env.example)");
    console.log("3. Set REACT_APP_CAMPAIGN_CONTRACT_ADDRESS to the contract address");
    console.log("4. Run 'npm start' to launch the frontend");
    console.log("5. Connect your MetaMask wallet to interact with the campaign");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  