# Stock Management System

## Overview
This document describes the stock management system implemented for the CeluCol e-commerce platform.

## Features

### 1. Stock Field in Products
- All products now include a `stock` field (number) to track available inventory
- Stock is optional but defaults to 0 when creating new products
- Administrators can set and update stock levels through the product form

### 2. Product Display
- Product cards display current stock levels
- Visual indicators:
  - Green/Gray text: Stock available
  - Orange text: Low stock warning (< 10 units) with "(Pocas unidades)" message
  - Red text: Out of stock with "Sin stock" message
- "Add to Cart" button is disabled when stock is 0

### 3. Cart Validation
- When adding items to cart, the system validates available stock
- Users cannot add more items than available stock
- Error messages inform users of stock limitations
- Cart quantity controls are disabled when maximum stock is reached
- Real-time stock warnings in the cart sheet

### 4. Automatic Stock Updates

#### Order Creation
When a customer completes an order:
- Stock is automatically reduced for each product in the order
- Stock cannot go below 0

#### Order Cancellation
When an administrator cancels an order:
- Stock is automatically restored for all products in the cancelled order
- This ensures inventory accuracy when orders are cancelled

## Technical Implementation

### Frontend Changes
1. **Product Interface** - Added `stock?: number` field to:
   - `src/App.tsx`
   - `src/components/ProductCard.tsx`
   - `src/components/ProductForm.tsx`
   - `src/components/CartSheet.tsx`

2. **ProductForm Component** - Added stock input field with validation (min: 0, required)

3. **ProductCard Component** - Added stock display and validation for "Add to Cart" button

4. **CartSheet Component** - Added stock warnings and disabled quantity increase when at max stock

### Backend Changes
1. **Product Creation** (`POST /products`) - Accepts and stores stock field

2. **Product Update** (`PUT /products/:id`) - Updates stock field

3. **Cart Add** (`POST /cart`) - Validates stock availability before adding items

4. **Cart Update** (`PUT /cart/:productId`) - Validates stock when updating quantities

5. **Order Creation** (`POST /orders`) - Automatically reduces stock for ordered items

6. **Order Status Update** (`PUT /orders/:id/status`) - Restores stock when orders are cancelled

### Sample Data
All sample products now include realistic stock values (5-30 units)

## Usage

### For Administrators
1. Navigate to the "Administración" tab
2. Create or edit a product
3. Set the "Stock disponible" field to the desired quantity
4. Save the product

### For Customers
1. View available stock on product cards
2. Add items to cart (disabled if out of stock)
3. Stock is validated when adding/updating cart
4. Stock is automatically reduced when order is completed

## Error Messages
- **"Producto sin stock disponible"** - Displayed when trying to add out-of-stock product
- **"Solo hay X unidades disponibles"** - Displayed when trying to add/update cart beyond available stock
- **"Solo quedan X unidades disponibles"** - Warning in cart when cart quantity exceeds current stock
- **"Pocas unidades disponibles"** - Warning for low stock items (< 10 units)
