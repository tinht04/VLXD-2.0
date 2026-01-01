import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  HardHat,
  X,
} from "lucide-react";
import { ViewState } from "../types";

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  isOpen,
  onClose,
}) => {
  const menuItems = [
    { id: "DASHBOARD", label: "Tổng Quan", icon: LayoutDashboard },
    { id: "INVOICE", label: "Tạo Hóa Đơn", icon: ShoppingCart },
    { id: "PRODUCTS", label: "Kho Hàng", icon: Package },
    { id: "REPORTS", label: "Báo Cáo", icon: BarChart3 },
  ];

  const handleNavClick = (view: ViewState) => {
    setView(view);
    onClose(); // Close sidebar on mobile when item clicked
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white w-64 z-50 shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <HardHat className="text-yellow-400 h-8 w-8" />
            <div>
              <h1 className="font-bold text-lg">VLXD Tú Phát</h1>
              <p className="text-xs text-slate-400">Quản lý cửa hàng</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as ViewState)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-center text-slate-500">
            Phiên bản 2.0.0 Cloud
          </p>
        </div>
      </div>
    </>
  );
};
