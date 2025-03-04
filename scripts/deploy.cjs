require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying BlockTrust Supply Chain contracts...");

  // Deploy the contract
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.deployed();

  console.log("SupplyChain deployed to:", supplyChain.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
