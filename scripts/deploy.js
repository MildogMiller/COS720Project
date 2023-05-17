//imports
const { ethers, run, network } = require("hardhat");
//async main
async function main() {
  //deploy
  const MSERC20Factory = await ethers.getContractFactory("MSERC20");
  console.log("Deploying MSERC20...");
  const mserc20 = await MSERC20Factory.deploy("MSERC20Test", "MSTest",5,1000);
  await mserc20.deployed();
  console.log("MSERC20 deployed to:", mserc20.address);

  if(network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    await mserc20.deployTransaction.wait(5);
    await verify(mserc20.address, ["MSERC20Test", "MSTest",5,1000]);
  }
}

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.includes("Contract source code already verified")) {
      console.log("Contract source code already verified");
    } else {
      console.log("Failed to verify contract");
      console.log(e);
    }
  }
}

function getTimestamp(addSeconds){
  var d = new Date();
  var n = d.getTime();
  return Math.floor(n/1000)+addSeconds;
}

//main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
