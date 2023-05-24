require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("solidity-docgen")


//commented out production env code

// const SEPURL = process.env.SEPOLIA_URL;
// const SEPKEY = process.env.SEPOLIA_PRIVATE_KEY;
//hardhat network built in no need to specify its details
/** @type import('hardhat/config').HardhatUserConfig */
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
  docgen:{
    outputDir: './docs',
    pages : "files",
  }

  
};
