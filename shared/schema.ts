import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model: Represents participants in the supply chain
// Each user has a specific role (manufacturer, distributor, retailer)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Stored as hashed value
  role: text("role").notNull(), // Role in supply chain (manufacturer, distributor, retailer)
  companyName: text("company_name").notNull(), // Organization name
});

// Product model: Represents items being tracked in the supply chain
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  currentLocation: text("current_location").notNull(), // Current position in supply chain
  status: text("status").notNull(), // Product status (e.g., manufactured, in-transit, delivered)
  createdBy: integer("created_by").references(() => users.id), // User who created the product
});

// Transaction model: Records all product movements and ownership changes
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id), // Product being transferred
  fromUserId: integer("from_user_id").references(() => users.id), // Sender
  toUserId: integer("to_user_id").references(() => users.id), // Receiver
  type: text("type").notNull(), // Transaction type (e.g., transfer, inspection)
  timestamp: timestamp("timestamp").notNull().defaultNow(), // When the transaction occurred
  status: text("status").notNull(), // Transaction status (pending, completed)
  metadata: json("metadata").notNull(), // Additional transaction details
});

// Zod schemas for input validation
export const insertUserSchema = createInsertSchema(users);
export const insertProductSchema = createInsertSchema(products);
export const insertTransactionSchema = createInsertSchema(transactions);

// TypeScript types for type safety
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;