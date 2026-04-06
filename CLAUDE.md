# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KN-Store is a MERN stack e-commerce platform for a shoe store. The backend is fully implemented; the frontend has been migrated to Next.js App Router with public store, auth, profile, and admin routes already in place.

## Commands

### Backend (run from `/backend`)
```bash
npm install          # Install dependencies
npm run dev          # Start dev server with nodemon (port 3000)
npm start            # Start production server

# Database seeding
npm run seed:all          # Seed all data
npm run seed:users
npm run seed:categories
npm run seed:subcategories
npm run seed:products

# Module tests (Node.js scripts, not a test framework)
npm run test:users
npm run test:categories
npm run test:subcategories
npm run test:products
```

### Frontend (run from `/frontend`)
```bash
npm install          # Install dependencies
npm run dev          # Next.js dev server (port 5173)
npm run build        # Production build to .next
npm run lint         # ESLint
npm run start        # Run the production build
```

## Environment Variables

Create `/backend/.env` with:
```
MONGO_URI=mongodb://localhost:27017/kn_store
JWT_SECRET=your_secret_here
PORT=3000
```

Both variables have fallback defaults in code, but should always be set explicitly.

## Architecture

**Module system:** Backend uses CommonJS (`require`/`module.exports`). Frontend uses ES Modules (`import`/`export`).

### Backend Request Flow
Every request must follow this chain — no skipping steps:
```
Route → Validation Middleware → Controller → JSON Response
```

All responses use the structure:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "..." }
```

### Role-Based Access Control
Three roles: `Admin`, `Manager`, `Client` (default on register).
- `protect()` — verifies JWT from `Authorization: Bearer <token>` header
- `authorizeRoles(...roles)` — restricts to specific roles

### Data Model Hierarchy
```
Category → Subcategory → Product
                           └── Manager (User with Manager role)
```

Products support variants (size/color/SKU), discounts (percentage or fixed amount with date ranges), soft delete (`active` flag), and auto-generated slugs.

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Models | PascalCase, singular | `Product.js`, `User.js` |
| Controllers/Routes/Middlewares | camelCase | `productController.js`, `productRoutes.js` |
| Variables & functions | camelCase | `generateToken`, `matchPassword` |

## Adding New Modules

When creating a new entity, follow this order:
1. Model in `backend/models/` (PascalCase)
2. Validator middleware in `backend/middlewares/` (camelCase)
3. Controller in `backend/controllers/` (camelCase)
4. Routes in `backend/routes/` (camelCase), mounted in `server.js` under `/api`

Maintain the Category → Subcategory → Product relational logic when adding new collections.

## API Base URL

`http://localhost:3000/api`

Routes: `/api/users`, `/api/categories`, `/api/subcategories`, `/api/products`

A Postman collection is available at `KN-Store_Users.postman_collection.json` for testing the Users module.
