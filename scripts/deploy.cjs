require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying BlockTrust Supply Chain contracts...");

  // Deploy the contract
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.deployed();

  console.log("SupplyChain deployed to:", supplyChain.address);

  // For testing purposes, set up some initial roles
  const [owner] = await hre.ethers.getSigners();

  // Log the contract address and owner address for easy reference
  console.log("Contract deployed by:", owner.address);
  console.log("\nAdd this address to your .env file as VITE_CONTRACT_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });