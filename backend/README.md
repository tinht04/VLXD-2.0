# VLXD Backend API

API backend cho ứng dụng Vật Liệu Xây Dựng Pro, xây dựng bằng Next.js 15 với Prisma ORM và SQLite.

## 🚀 Tính Năng

- ✅ RESTful API cho Products, Customers, Invoices
- ✅ Authentication với JWT
- ✅ Database với Prisma ORM (SQLite)
- ✅ Statistics & Reporting
- ✅ Auto customer creation từ invoices
- ✅ Pagination support
- ✅ Error handling

## 📋 Prerequisites

- Node.js 18+
- npm hoặc yarn

## 🔧 Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env với các giá trị của bạn
```

## 📦 Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# (Optional) Seed initial data
npx prisma db seed
```

## 🏃 Running

### Development

```bash
npm run dev
```

Server chạy tại http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:

```json
{
  "user": {
    "id": "xxx",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGc..."
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify Token

```http
GET /api/auth/verify
Authorization: Bearer <token>
```

---

### Products Endpoints

#### Get All Products

```http
GET /api/products?category=Xi%20m%C4%83ng
```

Query params:

- `category` (optional) - Filter by category

Response:

```json
[
  {
    "id": "xxx",
    "name": "Xi măng Hà Tiên",
    "unit": "Bao",
    "price": 90000,
    "category": "Xi măng",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Product (requires auth)

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Xi măng Hà Tiên",
  "unit": "Bao",
  "price": 90000,
  "category": "Xi măng"
}
```

#### Get Product

```http
GET /api/products/{id}
```

#### Update Product (requires auth)

```http
PUT /api/products/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 95000
}
```

#### Delete Product (requires auth)

```http
DELETE /api/products/{id}
Authorization: Bearer <token>
```

---

### Customers Endpoints

#### Get All Customers

```http
GET /api/customers
```

#### Create Customer

```http
POST /api/customers
Content-Type: application/json

{
  "name": "Anh Hùng",
  "phone": "0901234567",
  "address": "Quận 9"
}
```

#### Get Customer with Invoices

```http
GET /api/customers/{id}
```

#### Update Customer (requires auth)

```http
PUT /api/customers/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "Thủ Đức"
}
```

#### Delete Customer (requires auth)

```http
DELETE /api/customers/{id}
Authorization: Bearer <token>
```

---

### Invoices Endpoints

#### Get All Invoices

```http
GET /api/invoices?customerId=xxx&startDate=2024-01-01&endDate=2024-01-31&limit=20&offset=0
```

Query params:

- `customerId` (optional) - Filter by customer
- `startDate` (optional) - ISO date string
- `endDate` (optional) - ISO date string
- `limit` (optional, default: 50, max: 100)
- `offset` (optional, default: 0)

Response:

```json
{
  "data": [
    {
      "id": "xxx",
      "customerId": "xxx",
      "customerName": "Anh Hùng",
      "customerPhone": "0901234567",
      "date": "2024-01-01T10:00:00Z",
      "items": [...],
      "totalAmount": 500000,
      "note": "...",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Invoice

```http
POST /api/invoices
Content-Type: application/json

{
  "customerId": "xxx",
  "customerName": "Anh Hùng",
  "customerPhone": "0901234567",
  "items": [
    {
      "productId": "xxx",
      "productName": "Xi măng",
      "unit": "Bao",
      "quantity": 10,
      "price": 90000,
      "total": 900000
    }
  ],
  "note": "Giao hàng chiều nay"
}
```

#### Get Invoice

```http
GET /api/invoices/{id}
```

#### Update Invoice

```http
PUT /api/invoices/{id}
Content-Type: application/json

{
  "note": "Updated note"
}
```

#### Delete Invoice

```http
DELETE /api/invoices?id=xxx
```

#### Get Statistics

```http
GET /api/invoices/stats?startDate=2024-01-01&endDate=2024-01-31
```

Response:

```json
{
  "summary": {
    "totalRevenue": 5000000,
    "totalInvoices": 25,
    "averageInvoiceValue": 200000,
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  },
  "productStats": [...],
  "dailyRevenue": [...]
}
```

## 🔐 Authentication

Tất cả endpoints (trừ public ones) yêu cầu JWT token trong Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL="sqlite:./prisma/dev.db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# API
API_PORT=3001
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## 🗄️ Database Schema

### Products

- `id` - Primary key
- `name` - Product name (unique)
- `unit` - Unit of measurement
- `price` - Price
- `category` - Product category

### Customers

- `id` - Primary key
- `name` - Customer name
- `phone` - Phone number (unique)
- `address` - Customer address

### Invoices

- `id` - Primary key
- `customerId` - Foreign key to Customer
- `customerName` - Snapshot of customer name
- `customerPhone` - Snapshot of customer phone
- `date` - Invoice date
- `items` - Invoice items (one-to-many)
- `totalAmount` - Total invoice amount
- `note` - Additional notes

### Users

- `id` - Primary key
- `email` - Email (unique)
- `password` - Hashed password
- `name` - User name
- `role` - User role (user, admin)

## 🐛 Troubleshooting

### Database Error

```bash
# Reset database
npx prisma migrate reset

# Or delete and recreate
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Port Already in Use

```bash
# Change port in .env
API_PORT=3002
```

## 📄 License

MIT
