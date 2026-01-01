import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { InvoiceCreator } from "./components/InvoiceCreator";
import { ProductManager } from "./components/ProductManager";
import { Reports } from "./components/Reports";
import { ViewState } from "./types";
import { StorageService } from "./services/storageService";
import {
  DollarSign,
  ShoppingBag,
  Calendar,
  Menu,
  HardHat,
  Loader2,
} from "lucide-react";

const DashboardOverview: React.FC<{ onViewChange: (v: ViewState) => void }> = ({
  onViewChange,
}) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const invoices = await StorageService.getInvoices();
        const today = new Date().toISOString().split("T")[0];
        const todayInvoices = invoices.filter((i) => i.date.startsWith(today));

        setStats({
          totalRevenue: invoices.reduce(
            (acc, curr) => acc + curr.totalAmount,
            0
          ),
          todayRevenue: todayInvoices.reduce(
            (acc, curr) => acc + curr.totalAmount,
            0
          ),
          totalOrders: invoices.length,
        });
        setRecentInvoices(invoices.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="animate-spin h-8 w-8 mr-2" />
        <span>Đang tải dữ liệu từ server...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Xin chào, Chủ cửa hàng! 👋
        </h2>
        <p className="text-slate-500 text-sm md:text-base">
          Hệ thống đã kết nối cơ sở dữ liệu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div
          onClick={() => onViewChange("REPORTS")}
          className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">
                Doanh thu hôm nay
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.todayRevenue.toLocaleString("vi-VN")} đ
              </h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div
          onClick={() => onViewChange("INVOICE")}
          className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">
                Tạo đơn nhanh
              </p>
              <h3 className="text-lg font-bold text-blue-600 mt-2">
                Bán hàng ngay &rarr;
              </h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">
                Tổng đơn hàng
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.totalOrders}
              </h3>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Mini Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Đơn hàng gần đây</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-3 text-slate-700 font-medium">
                    {inv.customerName}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-sm">
                    {new Date(inv.date).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-slate-700">
                    {inv.totalAmount.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("DASHBOARD");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case "DASHBOARD":
        return <DashboardOverview onViewChange={setCurrentView} />;
      case "INVOICE":
        return <InvoiceCreator onSaved={() => setCurrentView("DASHBOARD")} />;
      case "PRODUCTS":
        return <ProductManager />;
      case "REPORTS":
        return <Reports />;
      default:
        return <DashboardOverview onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-2">
          <HardHat className="text-yellow-400 h-6 w-6" />
          <span className="font-bold text-lg">VLXD Tú Phát</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1 relative"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto">{renderContent()}</div>
      </main>
      <footer className="text-center text-slate-400 text-sm p-4 border-t border-slate-200 mt-auto">
        &copy; 2025 VLXD Tú Phát. All rights reserved. Made by TinHT
      </footer>
    </div>
  );
};

export default App;
