import { Invoice, Product, Customer } from "../types";
import { API } from "./apiClient";

export const StorageService = {
  // PRODUCTS API
  getProducts: async (): Promise<Product[]> => {
    try {
      const response: any = await API.products.getAll();
      return response.products || [];
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  },

  saveProduct: async (product: Product): Promise<Product> => {
    try {
      const response: any = await API.products.create(product);
      return response.product;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  updateProduct: async (product: Product): Promise<Product> => {
    try {
      const response: any = await API.products.update(product.id, product);
      return response.product;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await API.products.delete(id);
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  },

  // CUSTOMERS API
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response: any = await API.customers.getAll();
      return response.customers || [];
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      return [];
    }
  },

  saveCustomer: async (customer: Customer): Promise<Customer> => {
    try {
      const response: any = await API.customers.create(customer);
      return response.customer;
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await API.customers.delete(id);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      throw error;
    }
  },

  // INVOICES API
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const response: any = await API.invoices.getAll();
      return response.invoices || [];
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      return [];
    }
  },

  saveInvoice: async (invoice: Invoice): Promise<Invoice> => {
    try {
      // API will handle customer creation if needed
      const response: any = await API.invoices.create(invoice);
      // Reload products to reflect quantity changes after invoice creation
      await StorageService.getProducts();
      return response.invoice;
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  },

  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await API.invoices.delete(id);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      throw error;
    }
  },

  exportInvoicesToCSV: async (): Promise<string> => {
    const invoices = await StorageService.getInvoices();
    let csvContent = "\uFEFF";
    csvContent +=
      "Mã HĐ,Ngày Bán,Khách Hàng,SĐT,Mặt Hàng,Đơn Vị,Số Lượng,Đơn Giá,Thành Tiền,Tổng HĐ\n";
    invoices.forEach((inv) => {
      const dateStr = new Date(inv.date).toLocaleDateString("vi-VN");
      inv.items.forEach((item) => {
        const row = [
          inv.id,
          dateStr,
          `"${inv.customerName}"`,
          `"${inv.customerPhone || ""}"`,
          `"${item.productName}"`,
          item.unit,
          item.quantity,
          item.price,
          item.total,
          inv.totalAmount,
        ];
        csvContent += row.join(",") + "\n";
      });
    });
    return csvContent;
  },
};
