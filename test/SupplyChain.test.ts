import { expect } from "chai";
import { ethers } from "hardhat";
import { SupplyChain } from "../typechain-types";

describe("SupplyChain", function () {
  let supplyChain: SupplyChain;
  let owner: any;
  let manufacturer: any;
  let distributor: any;
  let retailer: any;

  // Example roles we'll use in our tests
  const MANUFACTURER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE"));
  const DISTRIBUTOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DISTRIBUTOR_ROLE"));
  const RETAILER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RETAILER_ROLE"));

  beforeEach(async function () {
    // Get test accounts
    [owner, manufacturer, distributor, retailer] = await ethers.getSigners();

    // Deploy the contract
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    await supplyChain.deployed();

    // Grant roles to different participants
    await supplyChain.grantRole(MANUFACTURER_ROLE, manufacturer.address);
    await supplyChain.grantRole(DISTRIBUTOR_ROLE, distributor.address);
    await supplyChain.grantRole(RETAILER_ROLE, retailer.address);
  });

  describe("Product Creation", function () {
    it("Should allow manufacturer to create a product", async function () {
      // Example: Creating a new laptop product
      await supplyChain.connect(manufacturer).createProduct(
        "Laptop XPS 15",
        "High-performance laptop with 32GB RAM"
      );

      // Get the product details
      const product = await supplyChain.getProduct(0);
      
      expect(product.name).to.equal("Laptop XPS 15");
      expect(product.currentOwner).to.equal(manufacturer.address);
      expect(product.status).to.equal(0); // Created status
    });
  });

  describe("Product Transfer", function () {
    it("Should transfer product from manufacturer to distributor", async function () {
      // First create a product
      await supplyChain.connect(manufacturer).createProduct(
        "Laptop XPS 15",
        "High-performance laptop with 32GB RAM"
      );

      // Transfer ownership to distributor
      await supplyChain.transferOwnership(0, distributor.address);

      // Update status to InTransit
      await supplyChain.updateStatus(0, 1); // 1 = InTransit

      const product = await supplyChain.getProduct(0);
      expect(product.currentOwner).to.equal(distributor.address);
      expect(product.status).to.equal(1); // InTransit status
    });

    it("Should complete product journey to retailer", async function () {
      // Create and transfer product as before
      await supplyChain.connect(manufacturer).createProduct(
        "Laptop XPS 15",
        "High-performance laptop with 32GB RAM"
      );
      await supplyChain.transferOwnership(0, distributor.address);
      await supplyChain.updateStatus(0, 1); // InTransit

      // Transfer to retailer and mark as delivered
      await supplyChain.transferOwnership(0, retailer.address);
      await supplyChain.updateStatus(0, 2); // 2 = Delivered

      const product = await supplyChain.getProduct(0);
      expect(product.currentOwner).to.equal(retailer.address);
      expect(product.status).to.equal(2); // Delivered status
    });
  });

  describe("Emergency Controls", function () {
    it("Should pause and unpause contract operations", async function () {
      // Pause the contract
      await supplyChain.pause();
      
      // Try to create a product (should fail)
      await expect(
        supplyChain.connect(manufacturer).createProduct("Test Product", "Description")
      ).to.be.revertedWith("Pausable: paused");

      // Unpause the contract
      await supplyChain.unpause();
      
      // Should now work
      await supplyChain.connect(manufacturer).createProduct("Test Product", "Description");
    });
  });
});
