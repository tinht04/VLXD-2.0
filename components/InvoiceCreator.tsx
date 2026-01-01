import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Loader2,
  User,
  Phone,
} from "lucide-react";
import { Product, InvoiceItem, Invoice, Customer } from "../types";
import { StorageService } from "../services/storageService";

interface InvoiceCreatorProps {
  onSaved: () => void;
}

export const InvoiceCreator: React.FC<InvoiceCreatorProps> = ({ onSaved }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Invoice Info
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selection state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCustomers] = await Promise.all([
          StorageService.getProducts(),
          StorageService.getCustomers(),
        ]);
        setProducts(fetchedProducts);
        setCustomers(fetchedCustomers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCustomerDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);

    if (customerId === "new") {
      // Khách hàng mới - reset form
      setCustomerName("");
      setCustomerPhone("");
    } else if (customerId) {
      // Khách hàng cũ - điền thông tin
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
      }
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      price: product.price,
      quantity: Number(quantity),
      total: product.price * Number(quantity),
    };

    setCart([...cart, newItem]);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveInvoice = async () => {
    if (cart.length === 0) {
      alert("❌ Chưa có sản phẩm nào trong giỏ hàng!");
      return;
    }

    let finalName = customerName.trim();
    if (!finalName) {
      if (
        !confirm(
          "⚠️ Bạn chưa nhập tên khách hàng. Tiếp tục lưu dưới tên 'Khách lẻ'?"
        )
      )
        return;
      finalName = "Khách lẻ";
    }

    // If creating a new customer, phone is optional but we'll warn if not provided
    if (selectedCustomerId === "new" && !customerPhone.trim()) {
      if (
        !confirm("💡 Bạn chưa nhập số điện thoại khách hàng mới. Tiếp tục lưu?")
      )
        return;
    }

    setSaving(true);
    try {
      // Get customerId from selected or find by name
      let customerId: string | undefined = undefined;
      if (selectedCustomerId && selectedCustomerId !== "new") {
        customerId = selectedCustomerId;
      } else {
        const existingCustomer = customers.find(
          (c) =>
            c.name.toLowerCase() === finalName.toLowerCase() ||
            (customerPhone && c.phone === customerPhone)
        );
        if (existingCustomer) {
          customerId = existingCustomer.id;
        }
      }

      const newInvoice: Invoice = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        customerName: finalName,
        customerPhone: customerPhone,
        customerId: customerId,
        items: cart,
        totalAmount: calculateTotal(),
      };

      await StorageService.saveInvoice(newInvoice);
      alert("✅ Đã lưu hóa đơn thành công!");

      // Reset form
      setSelectedCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCart([]);

      // Reload customers list
      const updatedCustomers = await StorageService.getCustomers();
      setCustomers(updatedCustomers);

      onSaved();
    } catch (e: any) {
      const errorMessage = e?.message || "Có lỗi xảy ra khi lưu hóa đơn!";
      alert("❌ " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <Loader2 className="animate-spin h-8 w-8 mr-2" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-20 md:pb-0">
      {/* Left Column: Product Selection */}
      <div className="lg:col-span-1 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
          1. Thông Tin Đơn Hàng
        </h2>

        <div className="space-y-4">
          {/* Customer Type Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-blue-600" />
              Thông tin khách hàng
            </h3>

            {/* Customer Type Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() =>
                  handleCustomerDropdownChange({
                    target: { value: "new" },
                  } as any)
                }
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  selectedCustomerId === "new"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-300"
                }`}
              >
                ➕ Khách hàng mới
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCustomerDropdownChange({ target: { value: "" } } as any)
                }
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  selectedCustomerId && selectedCustomerId !== "new"
                    ? "bg-blue-500 text-white shadow-md"
                    : selectedCustomerId === ""
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-300"
                }`}
              >
                👤 Khách hàng cũ
              </button>
            </div>

            {/* Customer Selection Dropdown - Only show for existing customers */}
            {selectedCustomerId !== "new" && (
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Chọn từ danh sách
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={handleCustomerDropdownChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Info Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 flex items-center">
                  <User className="h-3 w-3 mr-1" /> Tên khách hàng
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={
                    selectedCustomerId === "new"
                      ? "Nhập tên khách hàng mới..."
                      : "Chọn khách từ danh sách"
                  }
                  className={`w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none ${
                    selectedCustomerId && selectedCustomerId !== "new"
                      ? "bg-slate-100 cursor-not-allowed text-slate-600"
                      : "bg-white"
                  }`}
                  disabled={selectedCustomerId && selectedCustomerId !== "new"}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 flex items-center">
                  <Phone className="h-3 w-3 mr-1" /> Số điện thoại
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={
                    selectedCustomerId === "new" ? "VD: 0912345678" : ""
                  }
                  className={`w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none ${
                    selectedCustomerId && selectedCustomerId !== "new"
                      ? "bg-slate-100 cursor-not-allowed text-slate-600"
                      : "bg-white"
                  }`}
                  disabled={selectedCustomerId && selectedCustomerId !== "new"}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chọn Sản phẩm
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Chọn vật liệu --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.price.toLocaleString("vi-VN")}đ/{p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số lượng
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0.1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xl transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(parseFloat(e.target.value) || 0.1)
                  }
                  className="flex-1 border border-slate-300 rounded-lg p-3 text-center font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddItem}
            disabled={!selectedProductId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:transform active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Thêm vào đơn
          </button>
        </div>
      </div>

      {/* Right Column: Cart List */}
      <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-slate-800">
            2. Chi Tiết Hóa Đơn
          </h2>
          <span className="text-sm text-slate-500 hidden md:inline">
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-3 text-sm font-semibold text-slate-600 border-b">
                  Tên hàng
                </th>
                <th className="p-3 text-sm font-semibold text-slate-600 border-b text-center">
                  ĐVT
                </th>
                <th className="p-3 text-sm font-semibold text-slate-600 border-b text-right">
                  SL
                </th>
                <th className="p-3 text-sm font-semibold text-slate-600 border-b text-right">
                  Đơn giá
                </th>
                <th className="p-3 text-sm font-semibold text-slate-600 border-b text-right">
                  Thành tiền
                </th>
                <th className="p-3 text-sm font-semibold text-slate-600 border-b text-center">
                  Xóa
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-800 font-medium">
                    {item.productName}
                  </td>
                  <td className="p-3 text-center text-slate-600 text-sm">
                    {item.unit}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    {item.price.toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    {item.total.toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-slate-400 italic"
                  >
                    Chưa có mặt hàng nào được chọn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-slate-500">
              Khách:{" "}
              <span className="font-medium text-slate-700">
                {customerName || "Khách lẻ"}
              </span>
              {customerPhone && <span className="ml-2">({customerPhone})</span>}
            </div>
            <div>
              <span className="text-lg font-medium text-slate-600 mr-2">
                Tổng cộng:
              </span>
              <span className="text-2xl md:text-3xl font-bold text-blue-600">
                {calculateTotal().toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <button
              className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
              onClick={() =>
                alert("Tính năng in sẽ mở cửa sổ trình duyệt để in trang này.")
              }
            >
              <Printer className="mr-2 h-5 w-5" />{" "}
              <span className="md:inline">In Đơn</span>
            </button>
            <button
              onClick={handleSaveInvoice}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors shadow-lg active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}{" "}
              Thanh Toán & Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
