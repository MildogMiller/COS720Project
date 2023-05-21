require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

//commented out production env code

// const SEPURL = process.env.SEPOLIA_URL;
// const SEPKEY = process.env.SEPOLIA_PRIVATE_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
//hardhat network built in no need to specify its details
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  // networks: {
  //   sepolia: {
  //     url: SEPURL,
  //     accounts: [SEPKEY],
  //     chainId: 11155111
  //   }
  // },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY
  // }
  
};
