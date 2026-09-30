import React from 'react';
import { useErp } from '../../context/ErpContext';
import {
  ShoppingCart,
  Warehouse,
  Briefcase,
  Receipt,
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function OverviewCards() {
  const {
    data,
    reportingItems,
    matchesGlobalFilters,
    navigateTo,
    setFilters
  } = useErp();

  // Compute filtered metrics based on shared underlying records & global filters
  const filteredItems = reportingItems.filter(matchesGlobalFilters);
  const filteredPOs = data.purchaseOrders.filter(matchesGlobalFilters);
  const filteredWOs = data.workOrders.filter(matchesGlobalFilters);
  const filteredClientBills = data.clientBills.filter(matchesGlobalFilters);
  const filteredContractorBills = data.contractorBills.filter(matchesGlobalFilters);
  const filteredApprovals = data.approvals.filter(matchesGlobalFilters);

  // 1. Purchase Orders
  const totalPoCount = filteredPOs.length;
  const totalPoValue = filteredPOs.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);

  // 2. Available Stock
  const totalAvailableStock = filteredItems.reduce((acc, item) => acc + (Number(item.availableStock) || 0), 0);
  const lowStockCount = filteredItems.filter(i => (i.availableStock || 0) <= (i.minStockLevel || 0)).length;

  // 3. Work Orders
  const activeWOs = filteredWOs.filter(w => w.status === 'In Progress');
  const totalWoValue = filteredWOs.reduce((acc, w) => acc + (Number(w.contractValue) || 0), 0);

  // 4. Billing Amounts (Supply + Erection billed)
  const totalSupplyBilled = filteredItems.reduce((acc, item) => acc + (Number(item.supplyBillRa) || 0), 0);
  const totalErectionBilled = filteredItems.reduce((acc, item) => acc + (Number(item.erectionBillRa) || 0), 0);
  const totalBilled = totalSupplyBilled + totalErectionBilled;

  // 5. Pending Approvals
  const pendingApprovals = filteredApprovals.filter(a => a.status === 'Pending');

  const cards = [
    {
      id: 'po',
      title: 'Total Purchase Orders',
      value: totalPoCount,
      subValue: `₹${(totalPoValue / 10000000).toFixed(2)} Cr`,
      description: 'Active procurement orders',
      icon: ShoppingCart,
      color: 'indigo',
      badge: `${filteredPOs.filter(p => p.status === 'Approved').length} Approved`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      onClick: () => {
        navigateTo('purchase', 'purchase-order');
      }
    },
    {
      id: 'stock',
      title: 'Available Stock',
      value: totalAvailableStock.toLocaleString('en-IN'),
      subValue: `${filteredItems.length} SKUs in Ledger`,
      description: lowStockCount > 0 ? `${lowStockCount} items below safety limit` : 'Stock health optimal',
      icon: Warehouse,
      color: lowStockCount > 0 ? 'amber' : 'emerald',
      badge: lowStockCount > 0 ? `${lowStockCount} Needs Reorder` : 'Healthy Reserves',
      badgeColor: lowStockCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      onClick: () => {
        navigateTo('store', 'store-inward');
      }
    },
    {
      id: 'wo',
      title: 'Active Work Orders',
      value: activeWOs.length,
      subValue: `₹${(totalWoValue / 10000000).toFixed(2)} Cr Target`,
      description: 'EPC field executions underway',
      icon: Briefcase,
      color: 'blue',
      badge: `${Math.round(filteredWOs.reduce((acc, w) => acc + (w.currentProgress || 0), 0) / (filteredWOs.length || 1))}% Avg Progress`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      onClick: () => {
        navigateTo('workorder', 'wo-creation');
      }
    },
    {
      id: 'billing',
      title: 'Total RA Billing',
      value: `₹${(totalBilled / 10000000).toFixed(2)} Cr`,
      subValue: `Supply: ₹${(totalSupplyBilled / 10000000).toFixed(1)}Cr • Erec: ₹${(totalErectionBilled / 10000000).toFixed(1)}Cr`,
      description: 'Supply & Erection certified RA bills',
      icon: Receipt,
      color: 'violet',
      badge: `${filteredClientBills.length + filteredContractorBills.length} Invoices`,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      onClick: () => {
        navigateTo('billing', 'client-billing');
      }
    },
    {
      id: 'approvals',
      title: 'Pending Approvals',
      value: pendingApprovals.length,
      subValue: `${filteredApprovals.filter(a => a.status === 'Approved').length} Cleared`,
      description: 'Site, PM & PD executive decisions',
      icon: CheckSquare,
      color: pendingApprovals.length > 0 ? 'rose' : 'slate',
      badge: pendingApprovals.length > 0 ? 'Urgent Action' : 'All Clear',
      badgeColor: pendingApprovals.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200',
      onClick: () => {
        setFilters(prev => ({ ...prev, status: 'Pending' }));
        navigateTo('approval', 'site-approval');
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className="group relative bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 transition">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
                <span className="text-xs font-semibold text-slate-500 truncate">
                  {card.subValue}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="inline-flex items-center text-slate-400 group-hover:text-indigo-600 font-semibold transition text-[11px]">
                Explore
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
