import React from 'react';
import { useErp } from '../../context/ErpContext';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';
import {
  ShoppingCart,
  Warehouse,
  Briefcase,
  Receipt,
  CheckSquare,
  Package,
  FileCheck2,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  DoorOpen,
  ArrowRightLeft,
  Building,
  Building2,
  FileText,
  ShieldCheck,
  HardHat,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function FiveBoxesHub() {
  const {
    activeModule,
    setActiveModule,
    moduleTabs,
    setModuleTabs,
    data,
    reportingItems,
    matchesGlobalFilters,
    openAddModal,
    handleApprovalAction
  } = useErp();


  // Active module mapping
  const boxIdMap = {
    overview: 1,
    purchase: 1,
    store: 2,
    workorder: 3,
    billing: 4,
    approval: 1
  };

  const activeBox = boxIdMap[activeModule] || 1;

  // Active sub-point per module
  const activeSubPoint =
    activeBox === 1 ? (moduleTabs.purchase || 'item-master') :
    activeBox === 2 ? (moduleTabs.store || 'store-master') :
    activeBox === 3 ? (moduleTabs.workorder || 'wo-creation') :
    (moduleTabs.billing || 'client-billing');

  // Filtered raw datasets
  const rawItems = reportingItems.filter(matchesGlobalFilters);
  const rawPOs = data.purchaseOrders.filter(matchesGlobalFilters);
  const rawDIs = data.dispatchInstructions.filter(matchesGlobalFilters);
  const rawPIs = data.purchaseInvoices.filter(matchesGlobalFilters);

  const rawStores = data.stores.filter(s => matchesGlobalFilters({ circle: s.circle, name: s.name }));
  const rawReceipts = data.storeReceipts.filter(matchesGlobalFilters);
  const rawInwards = data.storeInwards.filter(matchesGlobalFilters);
  const rawIssues = data.materialIssues.filter(matchesGlobalFilters);
  const rawReturns = data.contractorReturns.filter(matchesGlobalFilters);
  const rawOutwards = data.outwardRegisters.filter(matchesGlobalFilters);
  const rawTransfers = data.interTransfers.filter(matchesGlobalFilters);

  const rawWOs = data.workOrders.filter(matchesGlobalFilters);
  const rawDNs = data.demandNotes.filter(matchesGlobalFilters);
  const rawMRHOVs = data.mrhovs.filter(matchesGlobalFilters);

  const rawClientBills = data.clientBills.filter(matchesGlobalFilters);
  const rawContractorBills = data.contractorBills.filter(matchesGlobalFilters);

  const rawApprovals = data.approvals.filter(matchesGlobalFilters);

  // Helper to link item reporting metrics
  const enrichWithItemMetrics = (record, idx) => {
    const item = reportingItems.find(i => i.tempCode === record.tempCode) || {};
    return {
      ...item,
      ...record,
      srNo: idx + 1,
      tempCode: record.tempCode || item.tempCode || 'TC-GEN',
      itemName: record.itemName || item.itemName || record.title || record.name || 'Material Item',
      package: record.package || item.package || 'PKG-01',
      circle: record.circle || item.circle || 'Jaipur',
      unit: record.unit || item.unit || 'Nos'
    };
  };

  // Enriched datasets with static 5 columns guaranteed
  const filteredItems = rawItems.map((it, idx) => ({ ...it, srNo: idx + 1 }));
  const filteredPOs = rawItems.map((item, idx) => {
    const po = rawPOs.find(p => p.tempCode === item.tempCode) || {};
    return {
      ...item,
      ...po,
      srNo: idx + 1,
      tempCode: item.tempCode,
      itemName: item.itemName,
      package: item.package,
      circle: item.circle,
      unit: item.unit || 'Nos',
      status: po.status || item.status || 'Approved'
    };
  });
  const filteredDIs = rawDIs.map(enrichWithItemMetrics);
  const filteredPIs = rawPIs.map(enrichWithItemMetrics);

  const filteredStores = rawStores.map((st, idx) => ({
    ...st,
    srNo: idx + 1,
    tempCode: 'STR-HUB',
    itemName: st.name,
    package: 'ALL-PKG',
    circle: st.circle
  }));

  const filteredReceipts = rawReceipts.map(enrichWithItemMetrics);
  const filteredInwards = rawInwards.map(enrichWithItemMetrics);
  const filteredIssues = rawIssues.map(enrichWithItemMetrics);
  const filteredReturns = rawReturns.map(enrichWithItemMetrics);
  const filteredOutwards = rawOutwards.map(enrichWithItemMetrics);
  const filteredTransfers = rawTransfers.map(enrichWithItemMetrics);

  const filteredWOs = rawWOs.map(enrichWithItemMetrics);
  const filteredDNs = rawDNs.map(enrichWithItemMetrics);
  const filteredMRHOVs = rawMRHOVs.map(enrichWithItemMetrics);

  const filteredClientBills = rawClientBills.map(enrichWithItemMetrics);
  const filteredContractorBills = rawContractorBills.map(enrichWithItemMetrics);

  const filteredApprovals = rawApprovals.map((app, idx) => {
    // Resolve item info from reference
    let refItem = reportingItems.find(i => i.circle === app.circle && i.package === app.package) || reportingItems[0];
    return {
      ...app,
      srNo: idx + 1,
      tempCode: refItem?.tempCode || 'TC-1001',
      itemName: app.title || refItem?.itemName,
      package: app.package || refItem?.package,
      circle: app.circle || refItem?.circle
    };
  });

  const siteApprovals = filteredApprovals.filter(a => a.type === 'Site Approval');
  const pmApprovals = filteredApprovals.filter(a => a.type === 'PM Approval');
  const pdApprovals = filteredApprovals.filter(a => a.type === 'PD Approval');

  // Definition of the 5 Boxes with Decent Light Color Themes & exact sub-points
  const boxes = [
    {
      id: 1,
      moduleKey: "purchase",
      moduleNumber: "1",
      moduleName: "Purchase Management",
      icon: ShoppingCart,
      badgeColor: "bg-indigo-600 text-white",
      boxBg: "bg-gradient-to-b from-indigo-50/70 via-indigo-50/20 to-white",
      boxBorder: "border-indigo-200/80 hover:border-indigo-400",
      headerBg: "bg-gradient-to-r from-indigo-100/90 via-indigo-50/80 to-indigo-100/40 border-indigo-200/70",
      activeRing: "border-indigo-500 ring-2 ring-indigo-500/25 shadow-md shadow-indigo-100/70",
      subActiveBg: "bg-indigo-600 text-white shadow-xs",
      subHoverBg: "hover:bg-indigo-100/70 text-slate-800 hover:text-indigo-950",
      subCountActive: "bg-white text-indigo-700",
      subCountInactive: "bg-indigo-100 text-indigo-700 group-hover/sub:bg-indigo-200/70",
      footerActive: "bg-indigo-100/70 text-indigo-800 font-bold border-indigo-200",
      footerInactive: "bg-indigo-50/40 text-indigo-600 hover:bg-indigo-100/60 border-indigo-100/80",
      accentText: "text-indigo-600",
      accentBg: "bg-indigo-50",
      summaryStat: `${filteredPOs.length} POs • ₹${(filteredPOs.reduce((a, b) => a + (b.totalAmount || 0), 0) / 10000000).toFixed(1)} Cr`,
      subPoints: [
        { id: "item-master", label: "Item Master", icon: Package, count: filteredItems.length },
        { id: "purchase-order", label: "Purchase Order (PO)", icon: ShoppingCart, count: filteredPOs.length },
        { id: "dispatch-instruction", label: "Dispatch Instruction (DI)", icon: ArrowUpRight, count: filteredDIs.length },
        { id: "purchase-invoice", label: "Purchase Invoice (PI)", icon: Receipt, count: filteredPIs.length }
      ],
      quickAddType: "po",
      quickAddLabel: "+ PO"
    },
    {
      id: 2,
      moduleKey: "store",
      moduleNumber: "2",
      moduleName: "Store & Inventory Management",
      icon: Warehouse,
      badgeColor: "bg-sky-600 text-white",
      boxBg: "bg-gradient-to-b from-sky-50/70 via-sky-50/20 to-white",
      boxBorder: "border-sky-200/80 hover:border-sky-400",
      headerBg: "bg-gradient-to-r from-sky-100/90 via-sky-50/80 to-sky-100/40 border-sky-200/70",
      activeRing: "border-sky-500 ring-2 ring-sky-500/25 shadow-md shadow-sky-100/70",
      subActiveBg: "bg-sky-600 text-white shadow-xs",
      subHoverBg: "hover:bg-sky-100/70 text-slate-800 hover:text-sky-950",
      subCountActive: "bg-white text-sky-700",
      subCountInactive: "bg-sky-100 text-sky-700 group-hover/sub:bg-sky-200/70",
      footerActive: "bg-sky-100/70 text-sky-800 font-bold border-sky-200",
      footerInactive: "bg-sky-50/40 text-sky-600 hover:bg-sky-100/60 border-sky-100/80",
      accentText: "text-sky-600",
      accentBg: "bg-sky-50",
      summaryStat: `${filteredStores.length} Depots • ${filteredItems.reduce((a, b) => a + (b.availableStock || 0), 0).toLocaleString()} Stock`,
      subPoints: [
        { id: "store-master", label: "Store Master", icon: Building, count: filteredStores.length },
        { id: "store-receipt", label: "Store Receipt", icon: FileCheck2, count: filteredReceipts.length },
        { id: "store-inward", label: "Store Inward", icon: ArrowDownLeft, count: filteredInwards.length },
        { id: "material-issue-note", label: "Material Issue Note", icon: ArrowUpRight, count: filteredIssues.length },
        { id: "contractor-return", label: "Contractor Return", icon: RotateCcw, count: filteredReturns.length },
        { id: "outward-register", label: "Outward Register", icon: DoorOpen, count: filteredOutwards.length },
        { id: "inter-transfer", label: "Inter Transfer", icon: ArrowRightLeft, count: filteredTransfers.length }
      ],
      quickAddType: "issue",
      quickAddLabel: "+ MIN"
    },
    {
      id: 3,
      moduleKey: "workorder",
      moduleNumber: "3",
      moduleName: "Work Order & Site Management",
      icon: Briefcase,
      badgeColor: "bg-emerald-600 text-white",
      boxBg: "bg-gradient-to-b from-emerald-50/70 via-emerald-50/20 to-white",
      boxBorder: "border-emerald-200/80 hover:border-emerald-400",
      headerBg: "bg-gradient-to-r from-emerald-100/90 via-emerald-50/80 to-emerald-100/40 border-emerald-200/70",
      activeRing: "border-emerald-500 ring-2 ring-emerald-500/25 shadow-md shadow-emerald-100/70",
      subActiveBg: "bg-emerald-600 text-white shadow-xs",
      subHoverBg: "hover:bg-emerald-100/70 text-slate-800 hover:text-emerald-950",
      subCountActive: "bg-white text-emerald-700",
      subCountInactive: "bg-emerald-100 text-emerald-700 group-hover/sub:bg-emerald-200/70",
      footerActive: "bg-emerald-100/70 text-emerald-800 font-bold border-emerald-200",
      footerInactive: "bg-emerald-50/40 text-emerald-600 hover:bg-emerald-100/60 border-emerald-100/80",
      accentText: "text-emerald-600",
      accentBg: "bg-emerald-50",
      summaryStat: `${filteredWOs.length} WOs • ₹${(filteredWOs.reduce((a, b) => a + (b.contractValue || 0), 0) / 10000000).toFixed(1)} Cr Execution`,
      subPoints: [
        { id: "wo-creation", label: "Work Order (WO) Creation", icon: Building2, count: filteredWOs.length },
        { id: "demand-note", label: "Demand Note", icon: FileText, count: filteredDNs.length },
        { id: "mrhov", label: "MRHOV", icon: ShieldCheck, count: filteredMRHOVs.length }
      ],
      quickAddType: "wo",
      quickAddLabel: "+ WO"
    },
    {
      id: 4,
      moduleKey: "billing",
      moduleNumber: "4",
      moduleName: "Billing Management",
      icon: Receipt,
      badgeColor: "bg-purple-600 text-white",
      boxBg: "bg-gradient-to-b from-purple-50/70 via-purple-50/20 to-white",
      boxBorder: "border-purple-200/80 hover:border-purple-400",
      headerBg: "bg-gradient-to-r from-purple-100/90 via-purple-50/80 to-purple-100/40 border-purple-200/70",
      activeRing: "border-purple-500 ring-2 ring-purple-500/25 shadow-md shadow-purple-100/70",
      subActiveBg: "bg-purple-600 text-white shadow-xs",
      subHoverBg: "hover:bg-purple-100/70 text-slate-800 hover:text-purple-950",
      subCountActive: "bg-white text-purple-700",
      subCountInactive: "bg-purple-100 text-purple-700 group-hover/sub:bg-purple-200/70",
      footerActive: "bg-purple-100/70 text-purple-800 font-bold border-purple-200",
      footerInactive: "bg-purple-50/40 text-purple-600 hover:bg-purple-100/60 border-purple-100/80",
      accentText: "text-purple-600",
      accentBg: "bg-purple-50",
      summaryStat: `₹${((filteredClientBills.reduce((a, b) => a + (b.claimedAmount || 0), 0) + filteredContractorBills.reduce((a, b) => a + (b.billedAmount || 0), 0)) / 10000000).toFixed(1)} Cr Billed`,
      subPoints: [
        { id: "client-billing", label: "Client Billing", icon: Building, count: filteredClientBills.length },
        { id: "contractor-billing", label: "Contractor Billing", icon: HardHat, count: filteredContractorBills.length }
      ],
      quickAddType: "clientBill",
      quickAddLabel: "+ Bill"
    }
  ];

  // Helper to select a box & sub-point
  const handleSelectSubPoint = (boxKey, subId) => {
    setActiveModule(boxKey);
    setModuleTabs(prev => ({
      ...prev,
      [boxKey]: subId
    }));

    setTimeout(() => {
      const tableEl = document.getElementById('active-workspace-table');
      if (tableEl) {
        tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 40);
  };

  const currentBoxConfig = boxes.find(b => b.id === activeBox);
  const currentSubConfig = currentBoxConfig?.subPoints.find(sp => sp.id === activeSubPoint);

  // 5 STATIC COMMON COLUMNS
  const staticCommonColumns = [
    { key: 'srNo', label: 'Sr. No.', sortable: true, align: 'center', defaultHidden: false, isStatic: true },
    {
      key: 'tempCode',
      label: 'Temp Code',
      sortable: true,
      defaultHidden: false,
      isStatic: true,
      render: (v) => <span className="font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200">{v}</span>
    },
    {
      key: 'itemName',
      label: 'Item Name',
      sortable: true,
      defaultHidden: false,
      isStatic: true,
      render: (v, r) => (
        <div className="max-w-[240px]">
          <div className="font-semibold text-slate-900 truncate" title={v}>{v}</div>
          {r.poNumber && <div className="text-[10px] text-slate-400 font-mono truncate">{r.poNumber} • {r.vendorName}</div>}
          {!r.poNumber && r.category && <div className="text-[10px] text-slate-400">{r.category}</div>}
        </div>
      )
    },
    { key: 'package', label: 'Package', sortable: true, defaultHidden: false, isStatic: true },
    { key: 'circle', label: 'Circle', sortable: true, defaultHidden: false, isStatic: true }
  ];

  return (
    <div className="space-y-6">
      {/* 5 BOXES CONTAINER */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-xs">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Single Page Operations Hub — Core Modules
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sr. No., Temp Code, Item Name, Package & Circle remain static across all ledgers. Other columns adapt to each topic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Active Topic: <strong className="text-indigo-700">{currentBoxConfig?.moduleName}</strong> → {currentSubConfig?.label}
            </span>
          </div>
        </div>

        {/* 4 BOXES GRID - DECENT LIGHT COLORS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
          {boxes.map((box) => {
            const Icon = box.icon;
            const isBoxActive = activeBox === box.id;

            return (
              <div
                key={box.id}
                className={`${box.boxBg} rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${
                  isBoxActive
                    ? `${box.activeRing} shadow-md`
                    : `${box.boxBorder} hover:shadow-xs`
                }`}
              >
                {/* Box Header */}
                <div className={`p-3.5 border-b ${box.headerBg}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`w-6 h-6 rounded-lg ${box.badgeColor} text-xs font-black flex items-center justify-center shrink-0 shadow-xs`}>
                      {box.moduleNumber}
                    </span>
                    <button
                      onClick={() => openAddModal(box.quickAddType)}
                      className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-800 bg-white/90 hover:bg-white px-2 py-0.5 rounded-md border border-slate-200/80 transition shadow-2xs"
                      title={`Quick add for ${box.moduleName}`}
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                      <span>{box.quickAddLabel}</span>
                    </button>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-1 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>{box.moduleName}</span>
                  </h3>
                  <div className="text-[10px] text-slate-600 font-medium mt-1 truncate">
                    {box.summaryStat}
                  </div>
                </div>

                {/* Sub-Points List Inside This Box */}
                <div className="p-2 space-y-1 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>Sub Points</span>
                    <span className="text-[9px] bg-white/80 text-slate-500 px-1.5 py-0.2 rounded font-mono border border-slate-200/60 shadow-2xs">
                      {box.subPoints.length}
                    </span>
                  </div>

                  <div className="space-y-1 bg-white/70 backdrop-blur-xs rounded-xl p-1 border border-slate-100/80 shadow-2xs">
                    {box.subPoints.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = isBoxActive && activeSubPoint === sub.id;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectSubPoint(box.moduleKey, sub.id)}
                          className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group/sub ${
                            isSubActive
                              ? `${box.subActiveBg} shadow-xs`
                              : `${box.subHoverBg} border border-transparent hover:border-slate-200/60`
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-white' : 'text-slate-400 group-hover/sub:text-slate-800'
                              }`}
                            />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-bold ml-1 ${
                              isSubActive
                                ? box.subCountActive
                                : box.subCountInactive
                            }`}
                          >
                            {sub.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Box Footer Banner */}
                <div
                  onClick={() => handleSelectSubPoint(box.moduleKey, box.subPoints[0].id)}
                  className={`px-3 py-2 border-t text-[11px] flex items-center justify-between cursor-pointer transition ${
                    isBoxActive
                      ? box.footerActive
                      : box.footerInactive
                  }`}
                >
                  <span className="truncate">{isBoxActive ? 'Active Topic' : 'View Topic'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SUB-POINT TABLE WORKSPACE */}
      <div id="active-workspace-table" className="pt-1 animate-fade-in scroll-mt-20">
        {/* Active Feature Sub-Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black">
              {currentBoxConfig?.moduleNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                <span>Box {currentBoxConfig?.moduleNumber}: {currentBoxConfig?.moduleName}</span>
                <span>•</span>
                <span>Topic: {currentSubConfig?.label}</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                {currentSubConfig?.label} Live Ledger
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeSubPoint === 'item-master') openAddModal('item');
                else if (activeSubPoint === 'purchase-order') openAddModal('po');
                else if (activeSubPoint === 'dispatch-instruction') openAddModal('di');
                else if (activeSubPoint === 'purchase-invoice') openAddModal('pi');
                else if (activeSubPoint === 'store-master') openAddModal('store');
                else if (activeSubPoint === 'store-receipt') openAddModal('receipt');
                else if (activeSubPoint === 'store-inward') openAddModal('inward');
                else if (activeSubPoint === 'material-issue-note') openAddModal('issue');
                else if (activeSubPoint === 'contractor-return') openAddModal('return');
                else if (activeSubPoint === 'outward-register') openAddModal('outward');
                else if (activeSubPoint === 'inter-transfer') openAddModal('transfer');
                else if (activeSubPoint === 'wo-creation') openAddModal('wo');
                else if (activeSubPoint === 'demand-note') openAddModal('dn');
                else if (activeSubPoint === 'mrhov') openAddModal('mrhov');
                else if (activeSubPoint === 'client-billing') openAddModal('clientBill');
                else if (activeSubPoint === 'contractor-billing') openAddModal('contractorBill');
                else openAddModal('approval');
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry to {currentSubConfig?.label}</span>
            </button>
          </div>
        </div>

        {/* 1. PURCHASE MANAGEMENT SUB-POINTS */}

        {/* 1.1 Item Master */}
        {activeSubPoint === 'item-master' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'unit', label: 'Unit', sortable: true, align: 'center' },
              { key: 'unitRate', label: 'Unit Rate (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'loaQty', label: 'LOA Quantity', sortable: true, align: 'right', render: (v, r) => `${v || 0} ${r.unit}` },
              { key: 'availableStock', label: 'Available Stock', sortable: true, align: 'right', render: (v, r) => (
                <span className={`font-bold ${v <= (r.minStockLevel || 0) ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {v} {r.unit}
                </span>
              )},
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredItems}
            recordType="item"
            title="Item Master Directory"
            subtitle="Static identifiers with live stock health, unit rates & category mapping"
          />
        )}

        {/* 1.2 Purchase Order (PO) - COMPLETE REQUESTED REPORTING LEDGER */}
        {activeSubPoint === 'purchase-order' && (
          <DataTable key={activeSubPoint}
            columns={[
              // Static Common 5 Identifiers
              ...staticCommonColumns,

              // Requested Reporting Columns
              { key: 'loaQty', label: 'LOA Quantity', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              { key: 'bomQty', label: 'BOM Quantity', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              { key: 'totalDiDone', label: 'Total DI Done', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              {
                key: 'balDiAgainstLoa',
                label: 'Bal for DI against LOA',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v, r) => (
                  <span className={r.isDiOverTarget ? 'text-rose-600 font-bold' : 'text-slate-800 font-semibold'}>
                    {v != null ? (r.isDiOverTarget ? `Over target (+${(r.totalDiDone || 0) - (r.loaQty || 0)})` : `${v} ${r.unit}`) : 'N/A'}
                  </span>
                )
              },
              {
                key: 'balDispatchAgainstLoa',
                label: 'Bal for Dispatch against LOA',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v, r) => v != null ? `${v} ${r.unit}` : 'N/A'
              },
              { key: 'totalPiDone', label: 'Total PI Done (IR)', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              { key: 'balForIr', label: 'Bal for IR', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              { key: 'totalMrhovDone', label: 'Total MRHOV Done', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              {
                key: 'balForMrhov',
                label: 'Bal for MRHOV',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v, r) => (
                  <span className={r.isMrhovOverTarget ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                    {v != null ? (r.isMrhovOverTarget ? 'Over Target' : `${v} ${r.unit}`) : 'N/A'}
                  </span>
                )
              },
              { key: 'totalJmcDone', label: 'Total JMC Done', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => `${v || 0} ${r.unit}` },
              {
                key: 'balForJmc',
                label: 'Bal for JMC',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v, r) => v != null ? (r.isJmcOverTarget ? 'Over Target' : `${v} ${r.unit}`) : 'N/A'
              },
              {
                key: 'supplyBillRa',
                label: 'Supply Bill RA',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v) => v != null ? `₹${(v / 100000).toFixed(1)} L` : 'N/A'
              },
              {
                key: 'balForSupplyBill',
                label: 'Bal for Supply Bill',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v) => v != null ? (typeof v === 'number' ? `₹${(v / 100000).toFixed(1)} L` : v) : 'N/A'
              },
              {
                key: 'erectionBillRa',
                label: 'Erection Bill RA',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v) => v != null ? `₹${(v / 100000).toFixed(1)} L` : 'N/A'
              },
              {
                key: 'balForErectionBill',
                label: 'Bal for Erection Bill',
                sortable: true,
                align: 'right',
                defaultHidden: false,
                render: (v) => v != null ? (typeof v === 'number' ? `₹${(v / 100000).toFixed(1)} L` : v) : 'N/A'
              },
              { key: 'wipConsumed', label: 'WIP Consumed', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => v != null ? `${v} ${r.unit}` : 'N/A' },
              { key: 'wipRequired', label: 'WIP Required', sortable: true, align: 'right', defaultHidden: false, render: (v, r) => v != null ? `${v} ${r.unit}` : 'N/A' },

              // Status
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredPOs}
            recordType="purchase-order"
            title="Purchase Order (PO) Live Ledger"
            subtitle="Static 5 common identifiers + Full LOA, BOM, DI, IR, MRHOV, JMC, Billing & WIP reporting balances"
          />
        )}

        {/* 1.3 Dispatch Instruction (DI) */}
        {activeSubPoint === 'dispatch-instruction' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'diNumber', label: 'DI Number', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'poNumber', label: 'Linked PO Ref', sortable: true },
              { key: 'dispatchQty', label: 'Dispatch Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'destinationStore', label: 'Destination Store', sortable: true },
              { key: 'transporterName', label: 'Transporter', sortable: true },
              { key: 'vehicleNo', label: 'Vehicle No.', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredDIs}
            recordType="dispatch-instruction"
            title="Dispatch Instruction (DI) Register"
            subtitle="Factory dispatches and transit movements"
          />
        )}

        {/* 1.4 Purchase Invoice (PI) */}
        {activeSubPoint === 'purchase-invoice' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'invoiceNumber', label: 'Invoice No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'irNumber', label: 'IR Number', sortable: true, render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
              { key: 'poNumber', label: 'PO Ref', sortable: true },
              { key: 'vendorName', label: 'Vendor', sortable: true },
              { key: 'billedQty', label: 'Billed Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'totalInvoiceAmount', label: 'Invoice Total (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredPIs}
            recordType="purchase-invoice"
            title="Purchase Invoice (PI) & IR Register"
            subtitle="Vendor tax invoices, IR references and GRN linkages"
          />
        )}

        {/* 2. STORE & INVENTORY MANAGEMENT SUB-POINTS */}

        {/* 2.1 Store Master */}
        {activeSubPoint === 'store-master' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'code', label: 'Store Code', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'inCharge', label: 'Store In-Charge Officer', sortable: true },
              { key: 'contact', label: 'Contact Phone', sortable: true },
              { key: 'capacityUtilization', label: 'Capacity Utilization', sortable: true, align: 'right', render: (v) => `${v}%` }
            ]}
            data={filteredStores}
            recordType="store"
            title="Store Master Directory"
            subtitle="Regional warehousing hubs, facilities and storage capacities"
          />
        )}

        {/* 2.2 Store Receipt */}
        {activeSubPoint === 'store-receipt' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'srNumber', label: 'Receipt No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'storeName', label: 'Receiving Store', sortable: true },
              { key: 'diNumber', label: 'Linked DI No.', sortable: true },
              { key: 'receivedQty', label: 'Received Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'condition', label: 'Physical Condition', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredReceipts}
            recordType="store-receipt"
            title="Store Receipt Register"
            subtitle="Physical consignment receipt logs and unloading verification notes"
          />
        )}

        {/* 2.3 Store Inward */}
        {activeSubPoint === 'store-inward' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'inwardNumber', label: 'Inward / GRN No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'storeName', label: 'Store Facility', sortable: true },
              { key: 'acceptedQty', label: 'Accepted Inward Qty', sortable: true, align: 'right', render: (v, r) => (
                <span className="font-bold text-emerald-700">+{v} {r.unit}</span>
              )},
              { key: 'binLocation', label: 'Bin / Yard Location', sortable: true, render: (v) => <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">{v}</span> },
              { key: 'acceptedBy', label: 'Accepted By', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredInwards}
            recordType="store-inward"
            title="Store Inward (GRN) Ledger"
            subtitle="Formal stock additions with bin location mapping"
          />
        )}

        {/* 2.4 Material Issue Note */}
        {activeSubPoint === 'material-issue-note' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'minNumber', label: 'MIN Number', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'storeName', label: 'Issuing Store', sortable: true },
              { key: 'contractorName', label: 'Contractor / Agency', sortable: true, render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
              { key: 'workOrderNumber', label: 'Work Order Ref', sortable: true },
              { key: 'issuedQty', label: 'Issued Qty', sortable: true, align: 'right', render: (v, r) => (
                <span className="font-bold text-rose-600">-{v} {r.unit}</span>
              )},
              { key: 'purpose', label: 'Purpose / Site Section', sortable: true, render: (v) => <span className="truncate max-w-[180px] block">{v}</span> },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredIssues}
            recordType="material-issue"
            title="Material Issue Note (MIN) Register"
            subtitle="Contractor line material dispatches with immediate stock validation"
          />
        )}

        {/* 2.5 Contractor Return */}
        {activeSubPoint === 'contractor-return' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'crNumber', label: 'Return Note No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'storeName', label: 'Returned Store', sortable: true },
              { key: 'contractorName', label: 'Contractor Name', sortable: true },
              { key: 'returnQty', label: 'Returned Qty', sortable: true, align: 'right', render: (v, r) => (
                <span className="font-bold text-amber-700">+{v} {r.unit}</span>
              )},
              { key: 'reason', label: 'Reason for Return', sortable: true, render: (v) => <span className="truncate max-w-[200px] block">{v}</span> },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredReturns}
            recordType="contractor-return"
            title="Contractor Return Register"
            subtitle="Surplus length cuts, joint scrap and returned assets credited to store inventory"
          />
        )}

        {/* 2.6 Outward Register */}
        {activeSubPoint === 'outward-register' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'gatePassNo', label: 'Gate Pass No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'storeName', label: 'Dispatch Store', sortable: true },
              { key: 'destinationName', label: 'Site / Destination', sortable: true },
              { key: 'qty', label: 'Outward Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'vehicleNo', label: 'Vehicle No.', sortable: true },
              { key: 'driverName', label: 'Driver Name', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredOutwards}
            recordType="outward-register"
            title="Outward Security Register"
            subtitle="Gatepass documentation, vehicle registrations and security authorizations"
          />
        )}

        {/* 2.7 Inter Transfer */}
        {activeSubPoint === 'inter-transfer' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'transferNumber', label: 'Transfer No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'sourceStore', label: 'Source Store (From)', sortable: true, render: (v) => <span className="font-semibold text-rose-700">{v}</span> },
              { key: 'destinationStore', label: 'Destination Store (To)', sortable: true, render: (v) => <span className="font-semibold text-emerald-700">{v}</span> },
              { key: 'transferQty', label: 'Transfer Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'transportDetails', label: 'Logistics Details', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredTransfers}
            recordType="inter-transfer"
            title="Inter Transfer Register"
            subtitle="Inter-depot material movements tracking both source and destination stores"
          />
        )}

        {/* 3. WORK ORDER & SITE MANAGEMENT SUB-POINTS */}

        {/* 3.1 Work Order Creation */}
        {activeSubPoint === 'wo-creation' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'woNumber', label: 'WO Number', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'contractorName', label: 'Assigned Contractor', sortable: true },
              { key: 'contractValue', label: 'Contract Value (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'currentProgress', label: 'Progress (%)', sortable: true, align: 'right', render: (v) => `${v}%` },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredWOs}
            recordType="work-order"
            title="Work Order (WO) Creation Register"
            subtitle="Field contractor engineering work orders, milestones and progress rates"
          />
        )}

        {/* 3.2 Demand Note */}
        {activeSubPoint === 'demand-note' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'dnNumber', label: 'Demand Note No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'workOrderNumber', label: 'Work Order Ref', sortable: true },
              { key: 'requestedQty', label: 'Required Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'requiredByDate', label: 'Required By Date', sortable: true },
              { key: 'requestedBy', label: 'Site Incharge Engineer', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredDNs}
            recordType="demand-note"
            title="Demand Note Register"
            subtitle="Site material requisitions submitted by resident field engineers"
          />
        )}

        {/* 3.3 MRHOV */}
        {activeSubPoint === 'mrhov' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'mrhovNumber', label: 'MRHOV Number', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'workOrderNumber', label: 'Linked Work Order', sortable: true },
              { key: 'contractorName', label: 'Executing Contractor', sortable: true },
              { key: 'mrhovQty', label: 'MRHOV Qty', sortable: true, align: 'right', render: (v, r) => `${v} ${r.unit}` },
              { key: 'verifiedByDiscom', label: 'DISCOM Verifying Officer', sortable: true },
              { key: 'testReportRef', label: 'Test Report Ref', sortable: true, render: (v) => <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">{v}</span> },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredMRHOVs}
            recordType="mrhov"
            title="MRHOV Verification Records"
            subtitle="Material Receipt & Handover Verification inspection sign-offs with test reports"
          />
        )}

        {/* 4. BILLING MANAGEMENT SUB-POINTS */}

        {/* 4.1 Client Billing */}
        {activeSubPoint === 'client-billing' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'billNumber', label: 'RA Bill No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'clientName', label: 'Client / DISCOM Authority', sortable: true, render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
              { key: 'billType', label: 'Category (Reporting)', sortable: true, render: (v) => (
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${v === 'Supply Bill RA' ? 'bg-indigo-50 text-indigo-700' : 'bg-cyan-50 text-cyan-700'}`}>
                  {v}
                </span>
              )},
              { key: 'claimedAmount', label: 'Claimed (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'certifiedAmount', label: 'Certified (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'netPayable', label: 'Net Payable (₹)', sortable: true, align: 'right', render: (v) => <span className="font-black text-slate-900">₹{Number(v).toLocaleString('en-IN')}</span> },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredClientBills}
            recordType="client-billing"
            title="Client Billing Directory"
            subtitle="DISCOM Supply & Erection RA bills certified against contract milestones"
          />
        )}

        {/* 4.2 Contractor Billing */}
        {activeSubPoint === 'contractor-billing' && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'billNumber', label: 'RA Bill No.', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'contractorName', label: 'Contractor Name', sortable: true, render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
              { key: 'workOrderNumber', label: 'Linked WO No.', sortable: true },
              { key: 'billedAmount', label: 'Gross Billed (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'verifiedAmount', label: 'Verified Amount (₹)', sortable: true, align: 'right', isCurrency: true },
              { key: 'netPayable', label: 'Net Disbursable (₹)', sortable: true, align: 'right', render: (v) => <span className="font-black text-emerald-700">₹{Number(v).toLocaleString('en-IN')}</span> },
              { key: 'status', label: 'Status', sortable: true, isStatus: true }
            ]}
            data={filteredContractorBills}
            recordType="contractor-billing"
            title="Contractor Billing Directory"
            subtitle="Subcontractor RA invoices with statutory TDS (2%) and Retention (5%)"
          />
        )}

        {/* 5. APPROVAL MANAGEMENT SUB-POINTS */}
        {(activeSubPoint === 'site-approval' || activeSubPoint === 'pm-approval' || activeSubPoint === 'pd-approval') && (
          <DataTable key={activeSubPoint}
            columns={[
              ...staticCommonColumns,
              { key: 'id', label: 'Approval ID', sortable: true, render: (v) => <span className="font-bold text-indigo-700">{v}</span> },
              { key: 'requestDate', label: 'Submission Date', sortable: true },
              { key: 'requestedBy', label: 'Requested By', sortable: true },
              { key: 'assignedTo', label: 'Sign-off Authority', sortable: true },
              { key: 'status', label: 'Status', sortable: true, isStatus: true },
              {
                key: 'actions',
                label: 'Decision Action Desk',
                sortable: false,
                align: 'right',
                render: (_, r) => (
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {r.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleApprovalAction(r.id, 'Approve', 'Approved via quick desk')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(r.id, 'Request Changes', 'Please revise parameters')}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold transition shadow-2xs"
                        >
                          Changes
                        </button>
                        <button
                          onClick={() => handleApprovalAction(r.id, 'Reject', 'Rejected by reviewing authority')}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition shadow-2xs"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic font-medium">Completed</span>
                    )}
                  </div>
                )
              }
            ]}
            data={activeSubPoint === 'site-approval' ? siteApprovals : activeSubPoint === 'pm-approval' ? pmApprovals : pdApprovals}
            recordType="approval"
            title={`${currentSubConfig?.label} Desk`}
            subtitle="Governance authorization queue with immediate Approve / Reject actions and audit logging"
          />
        )}
      </div>
    </div>
  );
}
