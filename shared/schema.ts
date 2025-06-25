import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedFunds = pgTable("saved_funds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fundId: text("fund_id").notNull(),
  fundName: text("fund_name").notNull(),
  fundCategory: text("fund_category"),
  nav: text("nav"),
  savedAt: timestamp("saved_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const insertSavedFundSchema = createInsertSchema(savedFunds).pick({
  userId: true,
  fundId: true,
  fundName: true,
  fundCategory: true,
  nav: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SavedFund = typeof savedFunds.$inferSelect;
export type InsertSavedFund = z.infer<typeof insertSavedFundSchema>;
