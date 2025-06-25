import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertSavedFundSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

// Auth middleware
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await storage.verifyPassword(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get saved funds
  app.get("/api/saved-funds", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const savedFunds = await storage.getSavedFunds(req.user!.id);
      res.json(savedFunds);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save a fund
  app.post("/api/saved-funds", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const savedFundData = insertSavedFundSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Check if fund is already saved
      const isAlreadySaved = await storage.isFundSaved(req.user!.id, savedFundData.fundId);
      if (isAlreadySaved) {
        return res.status(400).json({ message: "Fund is already saved" });
      }

      const savedFund = await storage.saveFund(savedFundData);
      res.json(savedFund);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove a saved fund
  app.delete("/api/saved-funds/:fundId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { fundId } = req.params;
      const removed = await storage.removeSavedFund(req.user!.id, fundId);
      
      if (!removed) {
        return res.status(404).json({ message: "Saved fund not found" });
      }

      res.json({ message: "Fund removed from saved list" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if fund is saved
  app.get("/api/saved-funds/:fundId/check", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { fundId } = req.params;
      const isSaved = await storage.isFundSaved(req.user!.id, fundId);
      res.json({ isSaved });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
