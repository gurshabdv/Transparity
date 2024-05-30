async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Deploy the Donation contract
    const Donation = await ethers.getContractFactory("Donation");
    const donation = await Donation.deploy("0x6767845E3D09F6a32B3D46d23A30509AD372F276");
    await donation.deployed();
    console.log("Donation contract deployed to:", donation.address);
  
    // Deploy the Expenditure contract
    const Expenditure = await ethers.getContractFactory("Expenditure");
    const expenditure = await Expenditure.deploy();
    await expenditure.deployed();
    console.log("Expenditure contract deployed to:", expenditure.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  