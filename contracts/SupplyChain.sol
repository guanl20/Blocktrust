// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BlockTrust Supply Chain Contract
 * @dev Manages product tracking and ownership transfers in the supply chain
 * 
 * This contract handles:
 * - Product creation and tracking
 * - Role-based access control (Manufacturer, Distributor, Retailer)
 * - Ownership transfers between supply chain participants
 * - Product status updates throughout the supply chain
 */
contract SupplyChain is AccessControl, Pausable {
    using Counters for Counters.Counter;

    // Define roles for different participants in the supply chain
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    // Counter for generating unique product IDs
    Counters.Counter private _productIdCounter;

    // Structure to store product information
    struct Product {
        uint256 id;              // Unique identifier for the product
        string name;             // Name of the product
        string description;      // Product description
        address currentOwner;    // Current owner's blockchain address
        Status status;          // Current status in supply chain
        uint256 timestamp;      // Last update timestamp
    }

    // Different stages a product can be in
    enum Status { 
        Created,    // Just manufactured
        InTransit,  // Being shipped
        Delivered   // Reached destination
    }

    // Store all products with their IDs
    mapping(uint256 => Product) public products;

    // Events to notify when important actions happen
    event ProductCreated(uint256 indexed productId, string name, address manufacturer);
    event OwnershipTransferred(uint256 indexed productId, address indexed from, address indexed to);
    event StatusUpdated(uint256 indexed productId, Status status);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new product in the supply chain
     * Only manufacturers can create products
     */
    function createProduct(string memory name, string memory description) 
        public
        onlyRole(MANUFACTURER_ROLE)
        whenNotPaused
        returns (uint256)
    {
        uint256 productId = _productIdCounter.current();
        _productIdCounter.increment();

        products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            currentOwner: msg.sender,
            status: Status.Created,
            timestamp: block.timestamp
        });

        emit ProductCreated(productId, name, msg.sender);
        return productId;
    }

    /**
     * @dev Transfers product ownership to another supply chain participant
     * Can only transfer to authorized participants (manufacturers, distributors, retailers)
     */
    function transferOwnership(uint256 productId, address newOwner)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenNotPaused
    {
        require(products[productId].currentOwner != address(0), "Product does not exist");
        require(newOwner != address(0), "New owner cannot be zero address");
        require(
            hasRole(MANUFACTURER_ROLE, newOwner) ||
            hasRole(DISTRIBUTOR_ROLE, newOwner) ||
            hasRole(RETAILER_ROLE, newOwner),
            "New owner must have a valid role"
        );

        address previousOwner = products[productId].currentOwner;
        products[productId].currentOwner = newOwner;
        products[productId].timestamp = block.timestamp;

        emit OwnershipTransferred(productId, previousOwner, newOwner);
    }

    /**
     * @dev Updates the status of a product (e.g., from Created to InTransit)
     * Only admin can update status to ensure proper tracking
     */
    function updateStatus(uint256 productId, Status newStatus)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenNotPaused
    {
        require(products[productId].currentOwner != address(0), "Product does not exist");
        products[productId].status = newStatus;
        products[productId].timestamp = block.timestamp;

        emit StatusUpdated(productId, newStatus);
    }

    /**
     * @dev Gets all information about a product
     * Anyone can view product information
     */
    function getProduct(uint256 productId)
        public
        view
        returns (
            string memory name,
            string memory description,
            address currentOwner,
            Status status,
            uint256 timestamp
        )
    {
        Product memory product = products[productId];
        return (
            product.name,
            product.description,
            product.currentOwner,
            product.status,
            product.timestamp
        );
    }

    /**
     * @dev Pauses all contract operations in case of emergency
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Resumes contract operations after being paused
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}