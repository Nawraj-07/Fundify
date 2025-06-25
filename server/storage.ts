import { users, savedFunds, type User, type InsertUser, type SavedFund, type InsertSavedFund } from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  getSavedFunds(userId: number): Promise<SavedFund[]>;
  saveFund(savedFund: InsertSavedFund): Promise<SavedFund>;
  removeSavedFund(userId: number, fundId: string): Promise<boolean>;
  isFundSaved(userId: number, fundId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private savedFunds: Map<number, SavedFund>;
  private currentUserId: number;
  private currentSavedFundId: number;

  constructor() {
    this.users = new Map();
    this.savedFunds = new Map();
    this.currentUserId = 1;
    this.currentSavedFundId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getSavedFunds(userId: number): Promise<SavedFund[]> {
    return Array.from(this.savedFunds.values()).filter(
      (savedFund) => savedFund.userId === userId,
    );
  }

  async saveFund(insertSavedFund: InsertSavedFund): Promise<SavedFund> {
    const id = this.currentSavedFundId++;
    const savedFund: SavedFund = {
      ...insertSavedFund,
      id,
      fundCategory: insertSavedFund.fundCategory || null,
      nav: insertSavedFund.nav || null,
      savedAt: new Date(),
    };
    this.savedFunds.set(id, savedFund);
    return savedFund;
  }

  async removeSavedFund(userId: number, fundId: string): Promise<boolean> {
    const savedFund = Array.from(this.savedFunds.values()).find(
      (sf) => sf.userId === userId && sf.fundId === fundId,
    );
    if (savedFund) {
      this.savedFunds.delete(savedFund.id);
      return true;
    }
    return false;
  }

  async isFundSaved(userId: number, fundId: string): Promise<boolean> {
    return Array.from(this.savedFunds.values()).some(
      (sf) => sf.userId === userId && sf.fundId === fundId,
    );
  }
}

export const storage = new MemStorage();
