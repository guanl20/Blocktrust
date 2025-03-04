import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication middleware and routes
  setupAuth(app);

  // Products API

  // GET /api/products: Retrieve all products
  // Requires authentication
  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const products = await storage.getAllProducts();
    res.json(products);
  });

  // POST /api/products: Create a new product
  // Requires authentication
  // Body: Product data (name, description, currentLocation, status)
  // Automatically assigns creator ID from authenticated user
  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const productData = insertProductSchema.parse({
      ...req.body,
      createdBy: req.user.id, // Associate product with current user
    });
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  });

  // Transactions API

  // GET /api/transactions: Retrieve all transactions
  // Requires authentication
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  });

  // POST /api/transactions: Create a new transaction
  // Requires authentication
  // Body: Transaction data (productId, toUserId, type, status, metadata)
  // Automatically assigns fromUserId from authenticated user
  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactionData = insertTransactionSchema.parse({
      ...req.body,
      fromUserId: req.user.id, // Set current user as transaction initiator
    });
    const transaction = await storage.createTransaction(transactionData);
    res.status(201).json(transaction);
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}