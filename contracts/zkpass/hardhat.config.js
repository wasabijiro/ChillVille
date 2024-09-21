require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      chainId: 11155111,
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    airdaoTestnet: {
      chainId: 22040,
      url: "https://network.ambrosus-test.io",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
