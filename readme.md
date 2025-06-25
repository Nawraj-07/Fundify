# Mutual Fund Explorer - Full Stack Application

## Overview

This is a comprehensive mutual fund discovery and management platform built with a modern full-stack architecture. The application allows users to search, analyze, and save mutual funds from India's leading fund houses, providing real-time data and investment insights.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Key Technologies
- **TypeScript**: End-to-end type safety across frontend and backend
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Neon Database**: Cloud PostgreSQL database provider
- **JWT**: Secure authentication tokens
- **Zod**: Runtime type validation and schema definition

## Key Components

### Authentication System
- User registration and login with email/password
- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes on both client and server
- Session persistence with localStorage

### Database Schema
- **Users Table**: Stores user credentials and profile information
- **Saved Funds Table**: User's saved mutual funds with metadata
- Schema validation with Drizzle-Zod integration

### API Structure
- RESTful endpoints for authentication (`/api/auth/*`)
- CRUD operations for saved funds (`/api/saved-funds/*`)
- Middleware for JWT token validation
- Error handling and response formatting

### UI Components
- Comprehensive component library using shadcn/ui
- Responsive design with mobile-first approach
- Dark/light theme support
- Accessible form components with proper validation
- Loading states and error handling

## Data Flow

1. **User Authentication**: Users register/login through secure forms with validation
2. **Fund Search**: Search functionality for discovering mutual funds
3. **Fund Management**: Users can save, view, and remove funds from their portfolio
4. **Real-time Updates**: TanStack Query manages cache and real-time data synchronization
5. **Responsive UI**: Clean, modern interface adapts to all screen sizes

## External Dependencies

### Database
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database
- **Connection**: Via environment variable `DATABASE_URL`

### Core Libraries
- **@radix-ui**: Accessible, unstyled UI primitives
- **TanStack Query**: Powerful data synchronization
- **React Hook Form**: Performant form handling
- **date-fns**: Date manipulation utilities
- **Wouter**: Lightweight routing

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production
- **TSX**: TypeScript execution for development
- **Drizzle Kit**: Database migration management

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Hot Reload**: Vite development server with HMR
- **Database Migrations**: Automated with Drizzle Kit
- **Port Configuration**: Frontend (client) served through Vite, backend on port 5000

### Production Build
- **Frontend**: Static assets built with Vite to `dist/public`
- **Backend**: Bundled with ESBuild to `dist/index.js`
- **Deployment**: Autoscale deployment target on Replit
- **Database**: Managed PostgreSQL with connection pooling

### Environment Configuration
- Database URL for PostgreSQL connection
- JWT secret for token signing
- Node environment detection for development/production modes

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```