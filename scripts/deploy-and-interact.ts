import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BlockTrust Supply Chain contracts...");

  // Deploy the contract
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.deployed();

  console.log("SupplyChain deployed to:", supplyChain.address);

  // Get signers for different roles
  const [admin, manufacturer, distributor, retailer] = await ethers.getSigners();

  // Grant roles
  const MANUFACTURER_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE")
  );
  const DISTRIBUTOR_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("DISTRIBUTOR_ROLE")
  );
  const RETAILER_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("RETAILER_ROLE")
  );

  console.log("\nSetting up roles...");
  await supplyChain.grantRole(MANUFACTURER_ROLE, manufacturer.address);
  await supplyChain.grantRole(DISTRIBUTOR_ROLE, distributor.address);
  await supplyChain.grantRole(RETAILER_ROLE, retailer.address);

  // Create a new product as manufacturer
  console.log("\nCreating a new product...");
  const manufacturerContract = supplyChain.connect(manufacturer);
  const tx = await manufacturerContract.createProduct(
    "Laptop XPS 15",
    "High-performance laptop with 32GB RAM"
  );
  await tx.wait();

  // Get the product details
  const productId = 0; // First product has ID 0
  const product = await supplyChain.getProduct(productId);
  console.log("\nProduct created:");
  console.log("- Name:", product.name);
  console.log("- Description:", product.description);
  console.log("- Current Owner:", product.currentOwner);
  console.log("- Status:", ["Created", "InTransit", "Delivered"][product.status]);

  // Transfer to distributor
  console.log("\nTransferring to distributor...");
  await supplyChain.transferOwnership(productId, distributor.address);
  await supplyChain.updateStatus(productId, 1); // Set to InTransit

  // Transfer to retailer
  console.log("\nTransferring to retailer...");
  await supplyChain.transferOwnership(productId, retailer.address);
  await supplyChain.updateStatus(productId, 2); // Set to Delivered

  // Get final product state
  const finalProduct = await supplyChain.getProduct(productId);
  console.log("\nFinal product state:");
  console.log("- Current Owner:", finalProduct.currentOwner);
  console.log("- Status:", ["Created", "InTransit", "Delivered"][finalProduct.status]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
