require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { INFURA_PROJECT_ID, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // Built-in Hardhat network for testing
    }
  }
};

// Only add external networks if environment variables are properly configured
if (INFURA_PROJECT_ID && PRIVATE_KEY && PRIVATE_KEY.length === 64) {
  module.exports.networks.holesky = {
    url: `https://holesky.infura.io/v3/${INFURA_PROJECT_ID}`,
    accounts: [`0x${PRIVATE_KEY}`]
  };
  
  module.exports.networks.mainnet = {
    url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    accounts: [`0x${PRIVATE_KEY}`]
  };
  
  module.exports.networks.sepolia = {
    url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    accounts: [`0x${PRIVATE_KEY}`]
  };
}
