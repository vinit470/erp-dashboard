import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_ITEMS,
  INITIAL_STORES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_DISPATCH_INSTRUCTIONS,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_STORE_RECEIPTS,
  INITIAL_STORE_INWARDS,
  INITIAL_MATERIAL_ISSUES,
  INITIAL_CONTRACTOR_RETURNS,
  INITIAL_OUTWARD_REGISTERS,
  INITIAL_INTER_TRANSFERS,
  INITIAL_WORK_ORDERS,
  INITIAL_DEMAND_NOTES,
  INITIAL_MRHOV,
  INITIAL_CLIENT_BILLS,
  INITIAL_CONTRACTOR_BILLS,
  INITIAL_APPROVALS,
  INITIAL_ACTIVITIES
} from '../data/initialData';

const ErpContext = createContext();

const STORAGE_KEY = 'erp_dashboard_state_v2';

export function ErpProvider({ children }) {
  // Load saved state or use initial data
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return {
      items: INITIAL_ITEMS,
      stores: INITIAL_STORES,
      purchaseOrders: INITIAL_PURCHASE_ORDERS,
      dispatchInstructions: INITIAL_DISPATCH_INSTRUCTIONS,
      purchaseInvoices: INITIAL_PURCHASE_INVOICES,
      storeReceipts: INITIAL_STORE_RECEIPTS,
      storeInwards: INITIAL_STORE_INWARDS,
      materialIssues: INITIAL_MATERIAL_ISSUES,
      contractorReturns: INITIAL_CONTRACTOR_RETURNS,
      outwardRegisters: INITIAL_OUTWARD_REGISTERS,
      interTransfers: INITIAL_INTER_TRANSFERS,
      workOrders: INITIAL_WORK_ORDERS,
      demandNotes: INITIAL_DEMAND_NOTES,
      mrhovs: INITIAL_MRHOV,
      clientBills: INITIAL_CLIENT_BILLS,
      contractorBills: INITIAL_CONTRACTOR_BILLS,
      approvals: INITIAL_APPROVALS,
      activities: INITIAL_ACTIVITIES,
      notifications: [
        { id: "notif-1", title: "Site Inspection Due", message: "33kV Outdoor VCB joint test scheduled today", time: "10m ago", read: false, type: "warning" },
        { id: "notif-2", title: "Critical Stock Alert", message: "11kV VCB Indoor Panel stock is nearing safety reserve", time: "45m ago", read: false, type: "danger" },
        { id: "notif-3", title: "Bill Certified", message: "Client Supply Bill RA-01 payment disbursed", time: "2h ago", read: true, type: "success" }
      ]
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist state to localStorage', e);
    }
  }, [data]);

  // Active module navigation
  // 'overview' | 'purchase' | 'store' | 'workorder' | 'billing' | 'approval'
  const [activeModule, setActiveModule] = useState('overview');
  // Sub-tabs per module
  const [moduleTabs, setModuleTabs] = useState({
    purchase: 'item-master',
    store: 'store-master',
    workorder: 'wo-creation',
    billing: 'client-billing',
    approval: 'site-approval'
  });

  // Global filters
  const [filters, setFilters] = useState({
    circle: 'All',
    package: 'All',
    itemName: '',
    tempCode: 'All',
    dateRange: 'All',
    status: 'All',
    searchQuery: ''
  });

  // Active Detail Drawer record
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [drawerType, setDrawerType] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Add / Edit Modal state
  const [addModalConfig, setAddModalConfig] = useState({
    isOpen: false,
    entityType: null, // 'item' | 'po' | 'di' | 'pi' | 'store' | 'receipt' | 'inward' | 'issue' | 'return' | 'outward' | 'transfer' | 'wo' | 'dn' | 'mrhov' | 'clientBill' | 'contractorBill' | 'approval'
    editItem: null
  });

  // Detailed Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Reset Demo Data
  const resetDemoData = () => {
    const freshData = {
      items: INITIAL_ITEMS,
      stores: INITIAL_STORES,
      purchaseOrders: INITIAL_PURCHASE_ORDERS,
      dispatchInstructions: INITIAL_DISPATCH_INSTRUCTIONS,
      purchaseInvoices: INITIAL_PURCHASE_INVOICES,
      storeReceipts: INITIAL_STORE_RECEIPTS,
      storeInwards: INITIAL_STORE_INWARDS,
      materialIssues: INITIAL_MATERIAL_ISSUES,
      contractorReturns: INITIAL_CONTRACTOR_RETURNS,
      outwardRegisters: INITIAL_OUTWARD_REGISTERS,
      interTransfers: INITIAL_INTER_TRANSFERS,
      workOrders: INITIAL_WORK_ORDERS,
      demandNotes: INITIAL_DEMAND_NOTES,
      mrhovs: INITIAL_MRHOV,
      clientBills: INITIAL_CLIENT_BILLS,
      contractorBills: INITIAL_CONTRACTOR_BILLS,
      approvals: INITIAL_APPROVALS,
      activities: INITIAL_ACTIVITIES,
      notifications: [
        { id: "notif-1", title: "Site Inspection Due", message: "33kV Outdoor VCB joint test scheduled today", time: "10m ago", read: false, type: "warning" },
        { id: "notif-2", title: "Critical Stock Alert", message: "11kV VCB Indoor Panel stock is nearing safety reserve", time: "45m ago", read: false, type: "danger" },
        { id: "notif-3", title: "Bill Certified", message: "Client Supply Bill RA-01 payment disbursed", time: "2h ago", read: true, type: "success" }
      ]
    };
    setData(freshData);
    localStorage.removeItem(STORAGE_KEY);
    setFilters({
      circle: 'All',
      package: 'All',
      itemName: '',
      tempCode: 'All',
      dateRange: 'All',
      status: 'All',
      searchQuery: ''
    });
    addToast('Demo data reset to factory initial state successfully!', 'info');
  };

  // Log activity helper
  const logActivity = (action, module, recordId, details, user = "System User") => {
    const newAct = {
      id: "ACT-" + Date.now(),
      timestamp: "Just now",
      user,
      action,
      module,
      recordId,
      details
    };
    setData(prev => ({
      ...prev,
      activities: [newAct, ...prev.activities.slice(0, 30)]
    }));
  };

  // Calculate available stock dynamically
  // Available stock = openingStock + accepted Inward - Material Issues + Contractor Returns
  const getStockLedger = (tempCode, storeName = null) => {
    const item = data.items.find(i => i.tempCode === tempCode);
    if (!item) return { available: 0, opening: 0, inward: 0, issued: 0, returned: 0, transferredOut: 0, transferredIn: 0 };

    // Inwards
    const inwardQty = data.storeInwards
      .filter(si => si.tempCode === tempCode && (storeName ? si.storeName === storeName : true))
      .reduce((sum, si) => sum + Number(si.acceptedQty || 0), 0);

    // Issues
    const issuedQty = data.materialIssues
      .filter(mi => mi.tempCode === tempCode && (storeName ? mi.storeName === storeName : true))
      .reduce((sum, mi) => sum + Number(mi.issuedQty || 0), 0);

    // Returns
    const returnQty = data.contractorReturns
      .filter(cr => cr.tempCode === tempCode && (storeName ? cr.storeName === storeName : true))
      .reduce((sum, cr) => sum + Number(cr.returnQty || 0), 0);

    // Inter Transfer Out
    const xferOutQty = data.interTransfers
      .filter(it => it.tempCode === tempCode && it.status === 'Approved' && (storeName ? it.sourceStore === storeName : false))
      .reduce((sum, it) => sum + Number(it.transferQty || 0), 0);

    // Inter Transfer In
    const xferInQty = data.interTransfers
      .filter(it => it.tempCode === tempCode && it.status === 'Approved' && (storeName ? it.destinationStore === storeName : false))
      .reduce((sum, it) => sum + Number(it.transferQty || 0), 0);

    const opening = storeName ? Math.round(item.openingStock / (data.stores.length || 1)) : item.openingStock;
    const available = Math.max(0, opening + inwardQty - issuedQty + returnQty - xferOutQty + xferInQty);

    return {
      available,
      opening,
      inward: inwardQty,
      issued: issuedQty,
      returned: returnQty,
      transferredOut: xferOutQty,
      transferredIn: xferInQty
    };
  };

  // Computed Item reporting rows with formulas
  const reportingItems = useMemo(() => {
    return data.items.map((item, idx) => {
      const stock = getStockLedger(item.tempCode);
      const loaQty = item.loaQty;
      const totalDiDone = item.totalDiDone || 0;
      const totalPiDone = item.totalPiDone || 0;
      const mrhovTarget = item.mrhovTarget;
      const totalMrhovDone = item.totalMrhovDone || 0;
      const jmcTarget = item.jmcTarget;
      const totalJmcDone = item.totalJmcDone || 0;
      const supplyTarget = item.supplyTarget;
      const supplyBillRa = item.supplyBillRa || 0;
      const erectionTarget = item.erectionTarget;
      const erectionBillRa = item.erectionBillRa || 0;

      // Formula: Bal = max(0, target - completed)
      const balDiAgainstLoa = loaQty != null ? Math.max(0, loaQty - totalDiDone) : "N/A";
      const isDiOverTarget = loaQty != null && totalDiDone > loaQty;

      // Bal for Dispatch against LOA
      const balDispatchAgainstLoa = loaQty != null ? Math.max(0, loaQty - totalDiDone) : "N/A";

      // Bal for IR = max(0, totalDiDone - totalPiDone)
      const balForIr = Math.max(0, totalDiDone - totalPiDone);

      // Bal for MRHOV = max(0, mrhovTarget - totalMrhovDone)
      const balForMrhov = mrhovTarget != null ? Math.max(0, mrhovTarget - totalMrhovDone) : "N/A";
      const isMrhovOverTarget = mrhovTarget != null && totalMrhovDone > mrhovTarget;

      // Bal for JMC = max(0, jmcTarget - totalJmcDone)
      const balForJmc = jmcTarget != null ? Math.max(0, jmcTarget - totalJmcDone) : "N/A";
      const isJmcOverTarget = jmcTarget != null && totalJmcDone > jmcTarget;

      // Bal for Supply Bill
      const balForSupplyBill = supplyTarget != null ? Math.max(0, supplyTarget - supplyBillRa) : "N/A";

      // Bal for Erection Bill
      const balForErectionBill = erectionTarget != null ? Math.max(0, erectionTarget - erectionBillRa) : "N/A";

      return {
        ...item,
        srNo: idx + 1,
        availableStock: stock.available,
        totalInwardDone: stock.inward,
        totalIssuedDone: stock.issued,
        balDiAgainstLoa,
        isDiOverTarget,
        balDispatchAgainstLoa,
        balForIr,
        balForMrhov,
        isMrhovOverTarget,
        balForJmc,
        isJmcOverTarget,
        balForSupplyBill,
        balForErectionBill
      };
    });
  }, [data.items, data.storeInwards, data.materialIssues, data.contractorReturns, data.interTransfers]);

  // Global Filter matching helper
  const matchesGlobalFilters = (record) => {
    if (!record) return false;

    // Circle filter
    if (filters.circle !== 'All' && record.circle && record.circle !== filters.circle) {
      return false;
    }
    // Package filter
    if (filters.package !== 'All' && record.package && record.package !== filters.package) {
      return false;
    }
    // Temp Code filter
    if (filters.tempCode !== 'All' && record.tempCode && record.tempCode !== filters.tempCode) {
      return false;
    }
    // Item Name query
    if (filters.itemName && record.itemName && !record.itemName.toLowerCase().includes(filters.itemName.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filters.status !== 'All' && record.status && record.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    // Global search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const stringified = Object.values(record).join(' ').toLowerCase();
      if (!stringified.includes(q)) {
        return false;
      }
    }
    return true;
  };

  // Approval Management Action (Approve / Reject / Request Changes)
  const handleApprovalAction = (approvalId, actionType, comment = '') => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const userRole = actionType === 'Approved' ? 'Authorized Reviewer' : 'Verification Officer';

    let updatedType = '';

    setData(prev => {
      const updatedApprovals = prev.approvals.map(app => {
        if (app.id === approvalId) {
          updatedType = app.type;
          const newStatus = actionType === 'Approve' ? 'Approved' : actionType === 'Reject' ? 'Rejected' : 'Changes Requested';
          const newHistory = [
            ...(app.history || []),
            {
              action: newStatus,
              by: userRole,
              timestamp,
              comment: comment || `Action '${newStatus}' executed.`
            }
          ];
          return {
            ...app,
            status: newStatus,
            history: newHistory,
            comments: comment || app.comments
          };
        }
        return app;
      });

      return {
        ...prev,
        approvals: updatedApprovals
      };
    });

    logActivity(
      `${actionType} Approval`,
      'Approval Management',
      approvalId,
      `Status changed to ${actionType} with remarks: "${comment || 'No comment provided'}"`
    );

    addToast(`Approval ${approvalId} marked as ${actionType}!`, actionType === 'Approve' ? 'success' : actionType === 'Reject' ? 'danger' : 'warning');
  };

  // Drawer handlers
  const openDrawer = (record, type) => {
    setDrawerRecord(record);
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerRecord(null);
    setDrawerType(null);
  };

  // Add / Edit Modal handlers
  const openAddModal = (entityType, editItem = null) => {
    setAddModalConfig({
      isOpen: true,
      entityType,
      editItem
    });
  };

  const closeAddModal = () => {
    setAddModalConfig({
      isOpen: false,
      entityType: null,
      editItem: null
    });
  };

  // CRUD Dispatcher
  const saveRecord = (entityType, recordData, isEdit = false) => {
    // Inventory validation: prevent issues exceeding available stock
    if (entityType === 'issue') {
      const stock = getStockLedger(recordData.tempCode, recordData.storeName);
      if (Number(recordData.issuedQty) > stock.available) {
        addToast(`Issue rejected! Requested ${recordData.issuedQty} ${recordData.unit || 'units'} exceeds available stock of ${stock.available}.`, 'danger');
        return false;
      }
    }

    if (entityType === 'outward') {
      const stock = getStockLedger(recordData.tempCode, recordData.storeName);
      if (Number(recordData.qty) > stock.available) {
        addToast(`Outward rejected! Requested ${recordData.qty} exceeds available stock of ${stock.available}.`, 'danger');
        return false;
      }
    }

    if (entityType === 'transfer') {
      const sourceStock = getStockLedger(recordData.tempCode, recordData.sourceStore);
      if (Number(recordData.transferQty) > sourceStock.available) {
        addToast(`Inter-transfer rejected! Source store has only ${sourceStock.available} available.`, 'danger');
        return false;
      }
    }

    const keyMap = {
      item: 'items',
      po: 'purchaseOrders',
      di: 'dispatchInstructions',
      pi: 'purchaseInvoices',
      store: 'stores',
      receipt: 'storeReceipts',
      inward: 'storeInwards',
      issue: 'materialIssues',
      return: 'contractorReturns',
      outward: 'outwardRegisters',
      transfer: 'interTransfers',
      wo: 'workOrders',
      dn: 'demandNotes',
      mrhov: 'mrhovs',
      clientBill: 'clientBills',
      contractorBill: 'contractorBills',
      approval: 'approvals'
    };

    const targetListKey = keyMap[entityType];
    if (!targetListKey) return false;

    setData(prev => {
      const currentList = prev[targetListKey] || [];
      let updatedList;
      if (isEdit) {
        updatedList = currentList.map(item => item.id === recordData.id || item.tempCode === recordData.tempCode ? { ...item, ...recordData } : item);
      } else {
        const newRecord = {
          id: recordData.id || `${entityType.toUpperCase()}-${Date.now().toString().slice(-4)}`,
          ...recordData
        };
        updatedList = [newRecord, ...currentList];
      }
      return {
        ...prev,
        [targetListKey]: updatedList
      };
    });

    logActivity(
      isEdit ? `Updated ${entityType}` : `Created New ${entityType}`,
      activeModule === 'overview' ? 'Quick Add' : activeModule,
      recordData.id || recordData.tempCode || 'NEW',
      `Record ${recordData.id || recordData.tempCode || ''} successfully saved.`
    );

    addToast(`${isEdit ? 'Updated' : 'Created'} ${entityType.toUpperCase()} successfully!`, 'success');
    closeAddModal();
    return true;
  };

  // Workflow Trace Resolver mapping the internal document flow:
  // Track 1 (Site Execution & Billing):
  // HO Billing Portal (WO) -> Site Portal (Approval -> Demand Note/MRHOV* -> Billing: Client & Contractor) -> PM Portal: Approval -> PD Portal: Approval -> Store Manager Portal (Material Issue Note)
  // Loopback: Store Manager Portal (Contractor Return) -> Site Portal (Demand Note / MRHOV*)
  // Track 2 (Purchase & Procurement):
  // Purchase Portal (Master Database -> Main Item / Store -> PO -> DI -> PI) -> Store Manager Portal (Store Receipt -> Store Inward -> MIN / Return / Outward / Transfer)
  const getWorkflowTrace = (record, type) => {
    if (!record) return null;

    let portal = 'Site Portal';
    let portalColor = 'indigo';
    let flowStep = 'Overview';
    let track = 'execution';
    let upstream = [];
    let downstream = [];
    let loopback = [];

    if (type === 'wo' || record.woNumber) {
      portal = 'HO Billing Portal';
      portalColor = 'indigo';
      flowStep = 'WO: Work Order Creation';
      track = 'execution';

      const siteApps = data.approvals.filter(a => a.type === 'Site Approval' && (a.referenceId === record.id || a.workOrderNumber === record.woNumber));
      siteApps.forEach(a => downstream.push({ type: 'approval', label: 'Site Approval', id: a.id, docNumber: a.id, status: a.status, portal: 'Site Portal', record: a }));

      const dns = data.demandNotes.filter(d => d.workOrderNumber === record.woNumber);
      dns.forEach(d => downstream.push({ type: 'dn', label: 'Demand Note', id: d.id, docNumber: d.dnNumber, status: d.status, portal: 'Site Portal', record: d }));

      const mrhovs = data.mrhovs.filter(m => m.workOrderNumber === record.woNumber);
      mrhovs.forEach(m => downstream.push({ type: 'mrhov', label: 'MRHOV Record', id: m.id, docNumber: m.mrhovNumber, status: m.status, portal: 'Site Portal', record: m }));

      const cbs = data.clientBills.filter(b => b.workOrderNumber === record.woNumber);
      cbs.forEach(b => downstream.push({ type: 'clientBill', label: 'Client Bill', id: b.id, docNumber: b.billNumber, status: b.status, portal: 'Site Portal', record: b }));
      const kbs = data.contractorBills.filter(b => b.workOrderNumber === record.woNumber);
      kbs.forEach(b => downstream.push({ type: 'contractorBill', label: 'Contractor Bill', id: b.id, docNumber: b.billNumber, status: b.status, portal: 'Site Portal', record: b }));

      const mis = data.materialIssues.filter(mi => mi.workOrderNumber === record.woNumber);
      mis.forEach(mi => downstream.push({ type: 'issue', label: 'Material Issue Note', id: mi.id, docNumber: mi.minNumber, status: mi.status, portal: 'Store Manager Portal', record: mi }));

      const crs = data.contractorReturns.filter(cr => cr.workOrderNumber === record.woNumber);
      crs.forEach(cr => loopback.push({ type: 'return', label: 'Contractor Return', id: cr.id, docNumber: cr.crNumber, status: cr.status, portal: 'Store Manager Portal', record: cr }));
    }
    else if (type === 'approval' || (record.type && record.referenceId)) {
      if (record.type === 'Site Approval') {
        portal = 'Site Portal';
        portalColor = 'emerald';
        flowStep = 'Approval';
        track = 'execution';

        const wo = data.workOrders.find(w => w.id === record.referenceId || w.woNumber === record.workOrderNumber);
        if (wo) upstream.push({ type: 'wo', label: 'Work Order Creation', id: wo.id, docNumber: wo.woNumber, status: wo.status, portal: 'HO Billing Portal', record: wo });

        const dns = data.demandNotes.filter(d => d.workOrderNumber === record.workOrderNumber || d.siteApprovalId === record.id);
        dns.forEach(d => downstream.push({ type: 'dn', label: 'Demand Note', id: d.id, docNumber: d.dnNumber, status: d.status, portal: 'Site Portal', record: d }));
        const mrhovs = data.mrhovs.filter(m => m.workOrderNumber === record.workOrderNumber || m.siteApprovalId === record.id);
        mrhovs.forEach(m => downstream.push({ type: 'mrhov', label: 'MRHOV Record', id: m.id, docNumber: m.mrhovNumber, status: m.status, portal: 'Site Portal', record: m }));
      }
      else if (record.type === 'PM Approval') {
        portal = 'PM Portal: Approval';
        portalColor = 'blue';
        flowStep = 'PM Portal: Approval';
        track = 'execution';

        const cb = data.clientBills.find(b => b.id === record.referenceId || b.billNumber === record.billNumber);
        if (cb) upstream.push({ type: 'clientBill', label: 'Client Bill', id: cb.id, docNumber: cb.billNumber, status: cb.status, portal: 'Site Portal', record: cb });
        const kb = data.contractorBills.find(b => b.id === record.referenceId || b.billNumber === record.billNumber);
        if (kb) upstream.push({ type: 'contractorBill', label: 'Contractor Bill', id: kb.id, docNumber: kb.billNumber, status: kb.status, portal: 'Site Portal', record: kb });

        const pdApp = data.approvals.find(a => a.type === 'PD Approval' && (a.pmApprovalId === record.id || a.referenceId === record.referenceId));
        if (pdApp) downstream.push({ type: 'approval', label: 'PD Approval', id: pdApp.id, docNumber: pdApp.id, status: pdApp.status, portal: 'PD Portal: Approval', record: pdApp });
      }
      else if (record.type === 'PD Approval') {
        portal = 'PD Portal: Approval';
        portalColor = 'purple';
        flowStep = 'PD Portal: Approval';
        track = 'execution';

        const pmApp = data.approvals.find(a => a.id === record.pmApprovalId || (a.type === 'PM Approval' && a.referenceId === record.referenceId));
        if (pmApp) upstream.push({ type: 'approval', label: 'PM Approval', id: pmApp.id, docNumber: pmApp.id, status: pmApp.status, portal: 'PM Portal: Approval', record: pmApp });
        const cb = data.clientBills.find(b => b.id === record.referenceId);
        if (cb) upstream.push({ type: 'clientBill', label: 'Client Bill', id: cb.id, docNumber: cb.billNumber, status: cb.status, portal: 'Site Portal', record: cb });
        const kb = data.contractorBills.find(b => b.id === record.referenceId);
        if (kb) upstream.push({ type: 'contractorBill', label: 'Contractor Bill', id: kb.id, docNumber: kb.billNumber, status: kb.status, portal: 'Site Portal', record: kb });

        const mis = data.materialIssues.filter(mi => mi.pdApprovalId === record.id || (record.authorizedMin && mi.id === record.authorizedMin) || mi.workOrderNumber === record.workOrderNumber);
        mis.forEach(mi => downstream.push({ type: 'issue', label: 'Material Issue Note', id: mi.id, docNumber: mi.minNumber, status: mi.status, portal: 'Store Manager Portal', record: mi }));
      }
    }
    else if (type === 'dn' || record.dnNumber) {
      portal = 'Site Portal';
      portalColor = 'emerald';
      flowStep = 'Demand Note / MRHOV*';
      track = 'execution';

      const wo = data.workOrders.find(w => w.woNumber === record.workOrderNumber);
      if (wo) upstream.push({ type: 'wo', label: 'Work Order Creation', id: wo.id, docNumber: wo.woNumber, status: wo.status, portal: 'HO Billing Portal', record: wo });
      const siteApp = data.approvals.find(a => a.type === 'Site Approval' && (a.workOrderNumber === record.workOrderNumber || a.id === record.siteApprovalId));
      if (siteApp) upstream.push({ type: 'approval', label: 'Site Approval', id: siteApp.id, docNumber: siteApp.id, status: siteApp.status, portal: 'Site Portal', record: siteApp });

      const cbs = data.clientBills.filter(b => b.demandNoteNumber === record.dnNumber || b.workOrderNumber === record.workOrderNumber);
      cbs.forEach(b => downstream.push({ type: 'clientBill', label: 'Client Bill', id: b.id, docNumber: b.billNumber, status: b.status, portal: 'Site Portal', record: b }));
      const kbs = data.contractorBills.filter(b => b.demandNoteNumber === record.dnNumber || b.workOrderNumber === record.workOrderNumber);
      kbs.forEach(b => downstream.push({ type: 'contractorBill', label: 'Contractor Bill', id: b.id, docNumber: b.billNumber, status: b.status, portal: 'Site Portal', record: b }));

      const crs = data.contractorReturns.filter(cr => cr.destinationDemandNote === record.dnNumber || cr.workOrderNumber === record.workOrderNumber);
      crs.forEach(cr => loopback.push({ type: 'return', label: 'Contractor Return', id: cr.id, docNumber: cr.crNumber, status: cr.status, portal: 'Store Manager Portal', record: cr }));
    }
    else if (type === 'mrhov' || record.mrhovNumber) {
      portal = 'Site Portal';
      portalColor = 'emerald';
      flowStep = 'Demand Note / MRHOV*';
      track = 'execution';

      const wo = data.workOrders.find(w => w.woNumber === record.workOrderNumber);
      if (wo) upstream.push({ type: 'wo', label: 'Work Order Creation', id: wo.id, docNumber: wo.woNumber, status: wo.status, portal: 'HO Billing Portal', record: wo });
      const siteApp = data.approvals.find(a => a.type === 'Site Approval' && (a.workOrderNumber === record.workOrderNumber || a.id === record.siteApprovalId));
      if (siteApp) upstream.push({ type: 'approval', label: 'Site Approval', id: siteApp.id, docNumber: siteApp.id, status: siteApp.status, portal: 'Site Portal', record: siteApp });

      const cbs = data.clientBills.filter(b => b.mrhovNumber === record.mrhovNumber || b.workOrderNumber === record.workOrderNumber);
      cbs.forEach(b => downstream.push({ type: 'clientBill', label: 'Client Bill', id: b.id, docNumber: b.billNumber, status: b.status, portal: 'Site Portal', record: b }));
      const kbs = data.contractorBills.filter(b => b.mrhovNumber === record.mrhovNumber || b.workOrderNumber === record.workOrderNumber);
      kbs.forEach(b => downstream.push({ type: 'contractorBill', label: 'Contractor Bill', id: b.id, docNumber: b.billNumber, status: b.status, portal: 'Site Portal', record: b }));

      const crs = data.contractorReturns.filter(cr => cr.destinationMrhov === record.mrhovNumber || cr.workOrderNumber === record.workOrderNumber);
      crs.forEach(cr => loopback.push({ type: 'return', label: 'Contractor Return', id: cr.id, docNumber: cr.crNumber, status: cr.status, portal: 'Store Manager Portal', record: cr }));
    }
    else if (type === 'clientBill' || type === 'contractorBill' || record.billNumber) {
      const isClient = type === 'clientBill' || record.clientName;
      portal = 'Site Portal';
      portalColor = 'emerald';
      flowStep = isClient ? 'Billing (Client Billing)' : 'Billing (Contractor Billing)';
      track = 'execution';

      const dns = data.demandNotes.filter(d => d.dnNumber === record.demandNoteNumber || d.workOrderNumber === record.workOrderNumber);
      dns.forEach(d => upstream.push({ type: 'dn', label: 'Demand Note', id: d.id, docNumber: d.dnNumber, status: d.status, portal: 'Site Portal', record: d }));
      const mrhovs = data.mrhovs.filter(m => m.mrhovNumber === record.mrhovNumber || m.workOrderNumber === record.workOrderNumber);
      mrhovs.forEach(m => upstream.push({ type: 'mrhov', label: 'MRHOV Record', id: m.id, docNumber: m.mrhovNumber, status: m.status, portal: 'Site Portal', record: m }));
      const wo = data.workOrders.find(w => w.woNumber === record.workOrderNumber);
      if (wo) upstream.push({ type: 'wo', label: 'Work Order Creation', id: wo.id, docNumber: wo.woNumber, status: wo.status, portal: 'HO Billing Portal', record: wo });

      const pmApp = data.approvals.find(a => a.type === 'PM Approval' && (a.referenceId === record.id || a.billNumber === record.billNumber || a.id === record.pmApprovalId));
      if (pmApp) downstream.push({ type: 'approval', label: 'PM Approval', id: pmApp.id, docNumber: pmApp.id, status: pmApp.status, portal: 'PM Portal: Approval', record: pmApp });
      const pdApp = data.approvals.find(a => a.type === 'PD Approval' && (a.referenceId === record.id || a.id === record.pdApprovalId));
      if (pdApp) downstream.push({ type: 'approval', label: 'PD Approval', id: pdApp.id, docNumber: pdApp.id, status: pdApp.status, portal: 'PD Portal: Approval', record: pdApp });
    }
    else if (type === 'issue' || record.minNumber) {
      portal = 'Store Manager Portal';
      portalColor = 'teal';
      flowStep = 'Material Issue Note';
      track = 'execution';

      const pdApp = data.approvals.find(a => a.id === record.pdApprovalId || (a.type === 'PD Approval' && (a.authorizedMin === record.id || a.workOrderNumber === record.workOrderNumber)));
      if (pdApp) upstream.push({ type: 'approval', label: 'PD Approval (Sanction)', id: pdApp.id, docNumber: pdApp.id, status: pdApp.status, portal: 'PD Portal: Approval', record: pdApp });

      const inward = data.storeInwards.find(si => si.inwardNumber === record.inwardReference || si.tempCode === record.tempCode);
      if (inward) upstream.push({ type: 'inward', label: 'Store Inward (Stock Source)', id: inward.id, docNumber: inward.inwardNumber, status: inward.status, portal: 'Store Manager Portal', record: inward });

      const wo = data.workOrders.find(w => w.woNumber === record.workOrderNumber);
      if (wo) upstream.push({ type: 'wo', label: 'Work Order', id: wo.id, docNumber: wo.woNumber, status: wo.status, portal: 'HO Billing Portal', record: wo });

      const crs = data.contractorReturns.filter(cr => cr.linkedMin === record.minNumber || cr.workOrderNumber === record.workOrderNumber);
      crs.forEach(cr => downstream.push({ type: 'return', label: 'Contractor Return', id: cr.id, docNumber: cr.crNumber, status: cr.status, portal: 'Store Manager Portal', record: cr }));
      const ors = data.outwardRegisters.filter(o => o.documentRef === record.id || o.documentRef === record.minNumber);
      ors.forEach(o => downstream.push({ type: 'outward', label: 'Outward Register', id: o.id, docNumber: o.gatePassNo, status: o.status, portal: 'Store Manager Portal', record: o }));
    }
    else if (type === 'return' || record.crNumber) {
      portal = 'Store Manager Portal';
      portalColor = 'teal';
      flowStep = 'Contractor Return';
      track = 'execution';

      const inward = data.storeInwards.find(si => si.inwardNumber === record.inwardReference || si.tempCode === record.tempCode);
      if (inward) upstream.push({ type: 'inward', label: 'Store Inward', id: inward.id, docNumber: inward.inwardNumber, status: inward.status, portal: 'Store Manager Portal', record: inward });
      const wo = data.workOrders.find(w => w.woNumber === record.workOrderNumber);
      if (wo) upstream.push({ type: 'wo', label: 'Work Order', id: wo.id, docNumber: wo.woNumber, status: wo.status, portal: 'HO Billing Portal', record: wo });

      const dn = data.demandNotes.find(d => d.dnNumber === record.destinationDemandNote || d.workOrderNumber === record.workOrderNumber);
      if (dn) loopback.push({ type: 'dn', label: 'Demand Note (Reconciliation)', id: dn.id, docNumber: dn.dnNumber, status: dn.status, portal: 'Site Portal', record: dn });
      const mrhov = data.mrhovs.find(m => m.mrhovNumber === record.destinationMrhov || m.workOrderNumber === record.workOrderNumber);
      if (mrhov) loopback.push({ type: 'mrhov', label: 'MRHOV* (Reconciliation)', id: mrhov.id, docNumber: mrhov.mrhovNumber, status: mrhov.status, portal: 'Site Portal', record: mrhov });
    }
    else if (type === 'po' || record.poNumber) {
      portal = 'Purchase Portal';
      portalColor = 'amber';
      flowStep = 'PO: Purchase Order';
      track = 'purchase';

      const dis = data.dispatchInstructions.filter(d => d.poNumber === record.poNumber);
      dis.forEach(d => downstream.push({ type: 'di', label: 'Dispatch Instruction', id: d.id, docNumber: d.diNumber, status: d.status, portal: 'Purchase Portal', record: d }));
      const pis = data.purchaseInvoices.filter(p => p.poNumber === record.poNumber);
      pis.forEach(p => downstream.push({ type: 'pi', label: 'Purchase Invoice', id: p.id, docNumber: p.invoiceNumber, status: p.status, portal: 'Purchase Portal', record: p }));
      const srs = data.storeReceipts.filter(s => s.poNumber === record.poNumber);
      srs.forEach(s => downstream.push({ type: 'receipt', label: 'Store Receipt', id: s.id, docNumber: s.srNumber, status: s.status, portal: 'Store Manager Portal', record: s }));
    }
    else if (type === 'di' || record.diNumber) {
      portal = 'Purchase Portal';
      portalColor = 'amber';
      flowStep = 'DI: Dispatch Instruction';
      track = 'purchase';

      const po = data.purchaseOrders.find(p => p.poNumber === record.poNumber);
      if (po) upstream.push({ type: 'po', label: 'Purchase Order', id: po.id, docNumber: po.poNumber, status: po.status, portal: 'Purchase Portal', record: po });

      const srs = data.storeReceipts.filter(s => s.diNumber === record.diNumber);
      srs.forEach(s => downstream.push({ type: 'receipt', label: 'Store Receipt', id: s.id, docNumber: s.srNumber, status: s.status, portal: 'Store Manager Portal', record: s }));
    }
    else if (type === 'pi' || record.invoiceNumber) {
      portal = 'Purchase Portal';
      portalColor = 'amber';
      flowStep = 'PI: Purchase Invoice';
      track = 'purchase';

      const po = data.purchaseOrders.find(p => p.poNumber === record.poNumber);
      if (po) upstream.push({ type: 'po', label: 'Purchase Order', id: po.id, docNumber: po.poNumber, status: po.status, portal: 'Purchase Portal', record: po });

      const srs = data.storeReceipts.filter(s => s.invoiceNumber === record.invoiceNumber || s.diNumber === record.diNumber);
      srs.forEach(s => downstream.push({ type: 'receipt', label: 'Store Receipt', id: s.id, docNumber: s.srNumber, status: s.status, portal: 'Store Manager Portal', record: s }));
      const sis = data.storeInwards.filter(si => si.receiptReference === record.grnReference || si.tempCode === record.tempCode);
      sis.forEach(si => downstream.push({ type: 'inward', label: 'Store Inward', id: si.id, docNumber: si.inwardNumber, status: si.status, portal: 'Store Manager Portal', record: si }));
    }
    else if (type === 'receipt' || record.srNumber) {
      portal = 'Store Manager Portal';
      portalColor = 'teal';
      flowStep = 'Store Receipt';
      track = 'purchase';

      const di = data.dispatchInstructions.find(d => d.diNumber === record.diNumber);
      if (di) upstream.push({ type: 'di', label: 'Dispatch Instruction', id: di.id, docNumber: di.diNumber, status: di.status, portal: 'Purchase Portal', record: di });
      const pi = data.purchaseInvoices.find(p => p.invoiceNumber === record.invoiceNumber || p.poNumber === record.poNumber);
      if (pi) upstream.push({ type: 'pi', label: 'Purchase Invoice', id: pi.id, docNumber: pi.invoiceNumber, status: pi.status, portal: 'Purchase Portal', record: pi });

      const sis = data.storeInwards.filter(si => si.receiptReference === record.id || si.receiptReference === record.srNumber);
      sis.forEach(si => downstream.push({ type: 'inward', label: 'Store Inward', id: si.id, docNumber: si.inwardNumber, status: si.status, portal: 'Store Manager Portal', record: si }));
    }
    else if (type === 'inward' || record.inwardNumber) {
      portal = 'Store Manager Portal';
      portalColor = 'teal';
      flowStep = 'Store Inward';
      track = 'purchase';

      const sr = data.storeReceipts.find(s => s.id === record.receiptReference || s.srNumber === record.receiptReference);
      if (sr) upstream.push({ type: 'receipt', label: 'Store Receipt', id: sr.id, docNumber: sr.srNumber, status: sr.status, portal: 'Store Manager Portal', record: sr });

      const crs = data.contractorReturns.filter(cr => cr.inwardReference === record.inwardNumber || cr.tempCode === record.tempCode);
      crs.forEach(cr => downstream.push({ type: 'return', label: 'Contractor Return', id: cr.id, docNumber: cr.crNumber, status: cr.status, portal: 'Store Manager Portal', record: cr }));
      const ors = data.outwardRegisters.filter(o => o.inwardReference === record.inwardNumber || o.tempCode === record.tempCode);
      ors.forEach(o => downstream.push({ type: 'outward', label: 'Outward Register', id: o.id, docNumber: o.gatePassNo, status: o.status, portal: 'Store Manager Portal', record: o }));
      const its = data.interTransfers.filter(it => it.sourceStore === record.storeName && it.tempCode === record.tempCode);
      its.forEach(it => downstream.push({ type: 'transfer', label: 'Inter Transfer', id: it.id, docNumber: it.transferNumber, status: it.status, portal: 'Store Manager Portal', record: it }));
      const mis = data.materialIssues.filter(mi => mi.inwardReference === record.inwardNumber || mi.tempCode === record.tempCode);
      mis.forEach(mi => downstream.push({ type: 'issue', label: 'Material Issue Note', id: mi.id, docNumber: mi.minNumber, status: mi.status, portal: 'Store Manager Portal', record: mi }));
    }
    else if (type === 'outward' || record.gatePassNo) {
      portal = 'Store Manager Portal';
      portalColor = 'teal';
      flowStep = 'Outward Register';
      track = 'purchase';

      const inward = data.storeInwards.find(si => si.inwardNumber === record.inwardReference || si.tempCode === record.tempCode);
      if (inward) upstream.push({ type: 'inward', label: 'Store Inward', id: inward.id, docNumber: inward.inwardNumber, status: inward.status, portal: 'Store Manager Portal', record: inward });
      const mi = data.materialIssues.find(m => m.id === record.documentRef || m.minNumber === record.documentRef);
      if (mi) upstream.push({ type: 'issue', label: 'Material Issue Note', id: mi.id, docNumber: mi.minNumber, status: mi.status, portal: 'Store Manager Portal', record: mi });
    }
    else if (type === 'transfer' || record.transferNumber) {
      portal = 'Store Manager Portal';
      portalColor = 'teal';
      flowStep = 'Inter Transfer';
      track = 'purchase';

      const inward = data.storeInwards.find(si => si.tempCode === record.tempCode);
      if (inward) upstream.push({ type: 'inward', label: 'Store Inward', id: inward.id, docNumber: inward.inwardNumber, status: inward.status, portal: 'Store Manager Portal', record: inward });
    }

    const executionPipeline = [
      { id: 'wo', portal: 'HO Billing Portal', label: 'WO: Work Order Creation' },
      { id: 'site_approval', portal: 'Site Portal', label: 'Approval (Site)' },
      { id: 'dn_mrhov', portal: 'Site Portal', label: 'Demand Note / MRHOV*' },
      { id: 'billing', portal: 'Site Portal', label: 'Billing (Client & Contractor)' },
      { id: 'pm_approval', portal: 'PM Portal: Approval', label: 'PM Portal: Approval' },
      { id: 'pd_approval', portal: 'PD Portal: Approval', label: 'PD Portal: Approval' },
      { id: 'min', portal: 'Store Manager Portal', label: 'Material Issue Note' }
    ];

    const purchasePipeline = [
      { id: 'master', portal: 'Purchase Portal', label: 'Master Database' },
      { id: 'main_item', portal: 'Purchase Portal', label: 'Main Item / Store' },
      { id: 'po', portal: 'Purchase Portal', label: 'PO: Purchase Order' },
      { id: 'di', portal: 'Purchase Portal', label: 'DI: Dispatch Instruction' },
      { id: 'pi', portal: 'Purchase Portal', label: 'PI: Purchase Invoice' },
      { id: 'receipt', portal: 'Store Manager Portal', label: 'Store Receipt' },
      { id: 'inward', portal: 'Store Manager Portal', label: 'Store Inward' },
      { id: 'dispatch_ops', portal: 'Store Manager Portal', label: 'MIN / Return / Outward / Transfer' }
    ];

    return {
      portal,
      portalColor,
      flowStep,
      track,
      pipeline: track === 'execution' ? executionPipeline : purchasePipeline,
      upstream,
      downstream,
      loopback
    };
  };

  // Helper to switch module and tab
  const navigateTo = (mod, tab = null) => {
    setActiveModule(mod);
    if (tab) {
      setModuleTabs(prev => ({ ...prev, [mod]: tab }));
    }
  };

  return (
    <ErpContext.Provider
      value={{
        data,
        setData,
        activeModule,
        setActiveModule,
        moduleTabs,
        setModuleTabs,
        filters,
        setFilters,
        reportingItems,
        matchesGlobalFilters,
        getStockLedger,
        resetDemoData,
        handleApprovalAction,
        drawerRecord,
        drawerType,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addModalConfig,
        openAddModal,
        closeAddModal,
        saveRecord,
        isReportModalOpen,
        setIsReportModalOpen,
        toasts,
        addToast,
        removeToast,
        logActivity,
        navigateTo,
        getWorkflowTrace
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}
