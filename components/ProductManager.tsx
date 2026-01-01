import React, { useState, useEffect } from "react";
import { Product, UNITS, CATEGORIES } from "../types";
import { StorageService } from "../services/storageService";
import { Edit2, Save, X, Loader2, Undo2, Pencil } from "lucide-react";

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null); // Track which ID is being edited
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState(UNITS[0]);
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await StorageService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewName("");
    setNewUnit(UNITS[0]);
    setNewPrice("");
    setNewCategory(CATEGORIES[0]);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setNewName(product.name);
    setNewUnit(product.unit);
    setNewPrice(product.price.toLocaleString("vi-VN"));
    setNewCategory(product.category);
    // Scroll to top for better UX on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSaveProduct = async () => {
    // Validation
    const errors: string[] = [];

    if (!newName.trim()) {
      errors.push("Tên sản phẩm không được để trống");
    }

    if (!newPrice) {
      errors.push("Giá không được để trống");
    }

    if (newPrice && parseFloat(newPrice.replace(/\./g, "")) <= 0) {
      errors.push("Giá phải lớn hơn 0");
    }

    if (errors.length > 0) {
      alert("❌ Lỗi nhập liệu:\n• " + errors.join("\n• "));
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // UPDATE EXISTING
        const updatedProduct: Product = {
          id: editingId,
          name: newName,
          unit: newUnit,
          price: parseFloat(newPrice.replace(/\./g, "")),
          quantity: 0,
          category: newCategory,
        };
        await StorageService.updateProduct(updatedProduct);
      } else {
        // CREATE NEW
        const newProduct: Product = {
          id: Date.now().toString(),
          name: newName,
          unit: newUnit,
          price: parseFloat(newPrice.replace(/\./g, "")),
          quantity: 0,
          category: newCategory,
        };
        await StorageService.saveProduct(newProduct);
      }

      await loadProducts();
      resetForm();
    } catch (e: any) {
      const errorMessage = e?.message || "Có lỗi xảy ra khi lưu dữ liệu.";
      alert("❌ " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `⚠️ Bạn có chắc chắn muốn xóa sản phẩm "${name}"?\n\nHành động này không thể hoàn tác!`
      )
    )
      return;
    setSaving(true);
    try {
      await StorageService.deleteProduct(id);
      await loadProducts();
      if (editingId === id) resetForm();
      alert("✅ Đã xóa sản phẩm thành công!");
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể xóa sản phẩm!";
      alert("❌ " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin h-8 w-8 mr-2" />
        <span>Đang tải kho hàng...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-bold text-slate-800">Quản Lý Kho Hàng</h2>
        {saving && (
          <span className="text-sm text-blue-500 flex items-center">
            <Loader2 className="animate-spin h-3 w-3 mr-1" /> Đang lưu...
          </span>
        )}
      </div>

      {/* Form Area */}
      <div
        className={`p-4 rounded-lg mb-8 border transition-colors duration-300 ${
          editingId
            ? "bg-orange-50 border-orange-200"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3
            className={`font-semibold ${
              editingId ? "text-orange-700" : "text-slate-700"
            }`}
          >
            {editingId ? "Cập nhật thông tin sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs flex items-center text-slate-500 hover:text-slate-800 bg-white px-2 py-1 rounded shadow-sm"
            >
              <Undo2 className="h-3 w-3 mr-1" /> Hủy bỏ
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 block mb-1">
              Tên vật liệu
            </label>
            <input
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nhập tên..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Đơn vị</label>
            <select
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">
              Danh mục
            </label>
            <select
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">
              Đơn giá (VNĐ)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
              value={newPrice}
              onChange={(e) => {
                const raw = e.target.value;
                // keep only digits
                const digits = raw.replace(/\D+/g, "");
                // format with dots for thousands
                const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setNewPrice(formatted);
              }}
            />
          </div>
          <button
            onClick={handleSaveProduct}
            disabled={saving}
            className={`font-medium p-2 rounded transition-colors disabled:opacity-50 text-white flex items-center justify-center ${
              editingId
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "..." : editingId ? "Cập Nhật" : "Thêm Mới"}
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3 rounded-tl-lg">Tên Sản Phẩm</th>
              <th className="p-3">Danh Mục</th>
              <th className="p-3 text-center">ĐVT</th>
              <th className="p-3 text-right">Đơn Giá</th>
              <th className="p-3 text-center">Tồn Kho</th>
              <th className="p-3 rounded-tr-lg text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className={`hover:bg-slate-50 ${
                  editingId === product.id ? "bg-blue-50" : ""
                }`}
              >
                <td className="p-3 font-medium text-slate-800">
                  {product.name}
                  {editingId === product.id && (
                    <span className="ml-2 text-xs text-blue-500 font-normal">
                      (Đang sửa)
                    </span>
                  )}
                </td>
                <td className="p-3 text-slate-600">
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="p-3 text-center text-slate-600">
                  {product.unit}
                </td>
                <td className="p-3 text-right font-semibold text-slate-800">
                  {product.price.toLocaleString("vi-VN")} đ
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      (product.quantity ?? 0) <= 5
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {(product.quantity ?? 0).toLocaleString("vi-VN")}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"
                      title="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Xóa"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center p-8 text-slate-400">
            Kho hàng trống. Hãy thêm sản phẩm.
          </p>
        )}
      </div>
    </div>
  );
};
