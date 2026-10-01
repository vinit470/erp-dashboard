import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Search,
  Bell,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  User,
  ShieldCheck,
  Package,
  ShoppingCart,
  Warehouse,
  Briefcase,
  Receipt,
  HardHat,
  Layers
} from 'lucide-react';

export default function Header() {
  const {
    filters,
    setFilters,
    data,
    openAddModal,
    setIsReportModalOpen
  } = useErp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const unreadNotifs = data.notifications.filter(n => !n.read).length;

  const addNewOptions = [
    { label: "Item Master", type: "item", category: "Purchase", icon: Package },
    { label: "Purchase Order (PO)", type: "po", category: "Purchase", icon: ShoppingCart },
    { label: "Dispatch Instruction (DI)", type: "di", category: "Purchase", icon: ShoppingCart },
    { label: "Purchase Invoice (PI)", type: "pi", category: "Purchase", icon: ShoppingCart },
    { label: "Store Receipt (SR)", type: "receipt", category: "Store & Inventory", icon: Warehouse },
    { label: "Store Inward (SI)", type: "inward", category: "Store & Inventory", icon: Warehouse },
    { label: "Material Issue Note (MIN)", type: "issue", category: "Store & Inventory", icon: Warehouse },
    { label: "Contractor Return", type: "return", category: "Store & Inventory", icon: Warehouse },
    { label: "Outward Register", type: "outward", category: "Store & Inventory", icon: Warehouse },
    { label: "Inter Transfer", type: "transfer", category: "Store & Inventory", icon: Warehouse },
    { label: "Work Order (WO)", type: "wo", category: "Work Order & Site", icon: Briefcase },
    { label: "Demand Note", type: "dn", category: "Work Order & Site", icon: Briefcase },
    { label: "MRHOV Record", type: "mrhov", category: "Work Order & Site", icon: Briefcase },
    { label: "Client Billing", type: "clientBill", category: "Billing", icon: Receipt },
    { label: "Contractor Billing", type: "contractorBill", category: "Billing", icon: Receipt }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 shadow-2xs">
      {/* Brand & Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-sm">
          <HardHat className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-extrabold text-base tracking-tight block">INFRA ERP</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Single Page Operations Dashboard
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search items, POs, work orders, bills, stores..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 hover:bg-slate-100/90 border border-slate-200/60 focus:border-indigo-500 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Detailed Report Action */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:text-indigo-600 transition"
          title="Open Comprehensive LOA/BOM/DI/MRHOV/Billing Report"
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span className="hidden md:inline">Detailed Report</span>
        </button>


        {/* Contextual "Add New" Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {isAddMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 text-xs animate-fade-in max-h-96 overflow-y-auto"
              onClick={() => setIsAddMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Create New Entry
              </div>
              {addNewOptions.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => openAddModal(opt.type)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50/70 hover:text-indigo-700 text-slate-700 font-medium transition"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 relative transition shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications ({data.notifications.length})</span>
                <span className="text-[11px] text-indigo-600 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 mt-1 max-h-72 overflow-y-auto">
                {data.notifications.map(n => (
                  <div key={n.id} className="py-2.5 px-1 flex items-start gap-2.5 hover:bg-slate-50 rounded-lg transition text-xs">
                    {n.type === 'danger' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{n.message}</div>
                      <div className="text-slate-400 text-[10px] mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
            VK
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <span className="font-bold text-slate-800 block">Vinit K.</span>
            <span className="text-[10px] text-slate-400 block">Project Director</span>
          </div>
        </div>
      </div>
    </header>
  );
}
