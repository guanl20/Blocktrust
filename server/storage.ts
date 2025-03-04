import { IStorage } from "./storage";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, Product, Transaction, InsertUser, InsertProduct, InsertTransaction } from "@shared/schema";

// Create memory store for session management
const MemoryStore = createMemoryStore(session);

// MemStorage: In-memory implementation of the storage interface
// Manages users, products, and transactions using Map objects
export class MemStorage implements IStorage {
  // In-memory storage using Maps
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private transactions: Map<number, Transaction>;
  sessionStore: session.Store;
  private currentId: number; // Auto-incrementing ID counter

  constructor() {
    // Initialize storage maps
    this.users = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.currentId = 1;
    // Configure session store with 24-hour cleanup period
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // User Management Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product Management Methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Transaction Management Methods
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

// Single instance of storage used throughout the application
export const storage = new MemStorage();