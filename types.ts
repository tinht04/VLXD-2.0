export interface Product {
  id: string;
  name: string;
  unit: string; // e.g., Bao, Khối, Thùng, Cái
  price: number;
  quantity: number; // Tồn kho
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId?: string; // Link to Customer table
  customerName: string; // Snapshot name (in case customer is deleted or walk-in guest)
  customerPhone?: string;
  date: string; // ISO string
  items: InvoiceItem[];
  totalAmount: number;
  note?: string;
}

export type ViewState =
  | "DASHBOARD"
  | "INVOICE"
  | "PRODUCTS"
  | "REPORTS"
  | "SETTINGS";

export const UNITS = [
  "Bao",
  "Khối",
  "Viên",
  "Thùng",
  "Cái",
  "Mét",
  "Kg",
  "Lít",
];
export const CATEGORIES = [
  "Xi măng",
  "Cát/Đá",
  "Gạch",
  "Sơn",
  "Ống nước",
  "Thiết bị vệ sinh",
  "Dụng cụ",
  "Khác",
];
