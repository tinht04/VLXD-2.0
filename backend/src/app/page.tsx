export default function RootPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>VLXD Backend API 🚀</h1>
      <p>Vật Liệu Xây Dựng Pro - Backend Server</p>

      <h2>Available Endpoints:</h2>
      <h3>Authentication</h3>
      <ul>
        <li>POST /api/auth/register - Register new user</li>
        <li>POST /api/auth/login - Login user</li>
        <li>GET /api/auth/verify - Verify token</li>
      </ul>

      <h3>Products</h3>
      <ul>
        <li>
          GET /api/products - Get all products (with optional category filter)
        </li>
        <li>POST /api/products - Create product (requires auth)</li>
        <li>GET /api/products/[id] - Get product details</li>
        <li>PUT /api/products/[id] - Update product (requires auth)</li>
        <li>DELETE /api/products/[id] - Delete product (requires auth)</li>
      </ul>

      <h3>Customers</h3>
      <ul>
        <li>GET /api/customers - Get all customers</li>
        <li>POST /api/customers - Create customer</li>
        <li>GET /api/customers/[id] - Get customer with invoices</li>
        <li>PUT /api/customers/[id] - Update customer (requires auth)</li>
        <li>DELETE /api/customers/[id] - Delete customer (requires auth)</li>
      </ul>

      <h3>Invoices</h3>
      <ul>
        <li>
          GET /api/invoices - Get invoices (with filters: customerId, startDate,
          endDate)
        </li>
        <li>POST /api/invoices - Create invoice</li>
        <li>GET /api/invoices/[id] - Get invoice details</li>
        <li>PUT /api/invoices/[id] - Update invoice</li>
        <li>DELETE /api/invoices?id=[id] - Delete invoice</li>
        <li>GET /api/invoices/stats - Get statistics</li>
      </ul>

      <hr />
      <p>API Documentation: See backend/README.md for detailed documentation</p>
    </div>
  );
}
