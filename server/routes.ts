import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Products API
  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const productData = insertProductSchema.parse({
      ...req.body,
      createdBy: req.user.id,
    });
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  });

  // Transactions API
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactionData = insertTransactionSchema.parse({
      ...req.body,
      fromUserId: req.user.id,
    });
    const transaction = await storage.createTransaction(transactionData);
    res.status(201).json(transaction);
  });

  const httpServer = createServer(app);
  return httpServer;
}
