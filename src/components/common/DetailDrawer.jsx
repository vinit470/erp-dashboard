import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import Badge from './Badge';
import {
  X,
  FileText,
  Clock,
  Building2,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Send,
  Layers,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRightLeft,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Link2
} from 'lucide-react';

export default function DetailDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    drawerRecord,
    drawerType,
    data,
    getStockLedger,
    handleApprovalAction,
    addToast,
    openAddModal,
    openDrawer,
    getWorkflowTrace
  } = useErp();

  const [approvalComment, setApprovalComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  if (!isDrawerOpen || !drawerRecord) return null;

  // Linked items finder
  const itemTempCode = drawerRecord.tempCode;
  const linkedItem = itemTempCode ? data.items.find(i => i.tempCode === itemTempCode) : null;
  const stockInfo = itemTempCode ? getStockLedger(itemTempCode) : null;

  // Linked transactions
  const linkedPOs = itemTempCode ? data.purchaseOrders.filter(p => p.tempCode === itemTempCode) : [];
  const linkedDIs = itemTempCode ? data.dispatchInstructions.filter(d => d.tempCode === itemTempCode) : [];
  const linkedIssues = itemTempCode ? data.materialIssues.filter(m => m.tempCode === itemTempCode) : [];
  const linkedWOs = itemTempCode ? data.workOrders.filter(w => w.tempCode === itemTempCode) : [];
  const linkedApprovals = drawerRecord.id ? data.approvals.filter(a => a.referenceId === drawerRecord.id || a.id === drawerRecord.id) : [];

  // Internal workflow flow trace based on the user's process diagram
  const workflowTrace = getWorkflowTrace ? getWorkflowTrace(drawerRecord, drawerType) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drawerRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${drawerRecord.id || drawerRecord.tempCode || 'record'}-details.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Record details exported successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right border-l border-slate-200">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
                {drawerType ? drawerType.slice(0, 2).toUpperCase() : 'ER'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                    {drawerType ? drawerType.replace('-', ' ') : 'Record Details'}
                  </span>
                  <Badge status={drawerRecord.status || 'Active'} />
                </div>
                <h2 className="text-lg font-bold text-white truncate max-w-md mt-0.5">
                  {drawerRecord.itemName || drawerRecord.title || drawerRecord.poNumber || drawerRecord.billNumber || drawerRecord.transferNumber || drawerRecord.id}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={closeDrawer}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="border-b border-slate-200 px-6 bg-slate-50 flex gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Overview & Specs
            </button>
            <button
              onClick={() => setActiveTab('linked')}
              className={`py-3 border-b-2 transition ${activeTab === 'linked' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Process Flow & Links ({workflowTrace ? (workflowTrace.upstream.length + workflowTrace.downstream.length + workflowTrace.loopback.length) : (linkedPOs.length + linkedDIs.length + linkedIssues.length + linkedWOs.length)})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 border-b-2 transition ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Approval & Audit Trail
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Identification Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Record ID</span>
                    <span className="text-slate-900 font-semibold text-sm">{drawerRecord.id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Temp Code</span>
                    <span className="text-indigo-600 font-bold text-sm">{drawerRecord.tempCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Package</span>
                    <span className="text-slate-800 font-semibold text-sm">{drawerRecord.package || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Circle</span>
                    <span className="text-slate-800 font-semibold text-sm">{drawerRecord.circle || 'N/A'}</span>
                  </div>
                </div>

                {/* Stock Ledger card if item */}
                {stockInfo && (
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900">Current Stock Health</h4>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        Min Level: {linkedItem?.minStockLevel || 0} {linkedItem?.unit}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100/80 shadow-xs">
                        <div className="text-slate-500 font-medium">Opening</div>
                        <div className="text-base font-bold text-slate-800">{stockInfo.opening}</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100/80 shadow-xs">
                        <div className="text-slate-500 font-medium">Inward (+)</div>
                        <div className="text-base font-bold text-emerald-600">+{stockInfo.inward}</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100/80 shadow-xs">
                        <div className="text-slate-500 font-medium">Issued (-)</div>
                        <div className="text-base font-bold text-rose-600">-{stockInfo.issued}</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100/80 shadow-xs">
                        <div className="text-slate-500 font-medium">Returns (+)</div>
                        <div className="text-base font-bold text-amber-600">+{stockInfo.returned}</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border-2 border-indigo-400 shadow-sm col-span-3 sm:col-span-1">
                        <div className="text-indigo-700 font-semibold">Available</div>
                        <div className="text-lg font-black text-indigo-700">{stockInfo.available} {linkedItem?.unit}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Properties Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Attributes & Parameters</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(drawerRecord)
                      .filter(([k]) => !['history', 'specifications', 'remarks', 'justification'].includes(k))
                      .map(([key, value]) => {
                        if (typeof value === 'object' && value !== null) return null;
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase());
                        return (
                          <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-slate-50/70 border border-slate-100 text-xs">
                            <span className="text-slate-500 font-medium">{label}:</span>
                            <span className="text-slate-900 font-semibold text-right max-w-[60%] truncate">
                              {value != null && value !== '' ? (
                                key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('target') && !key.toLowerCase().includes('qty') ?
                                  `₹${Number(value).toLocaleString('en-IN')}` :
                                  value.toString()
                              ) : 'N/A'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Technical Specifications / Remarks / Justifications */}
                {(drawerRecord.specifications || drawerRecord.remarks || drawerRecord.justification || drawerRecord.comments) && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Notes, Specifications & Verification Statements
                    </h4>
                    {drawerRecord.specifications && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">Technical Specs:</span>
                        <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                          {drawerRecord.specifications}
                        </p>
                      </div>
                    )}
                    {drawerRecord.remarks && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">Remarks:</span>
                        <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                          {drawerRecord.remarks}
                        </p>
                      </div>
                    )}
                    {drawerRecord.justification && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">Justification:</span>
                        <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                          {drawerRecord.justification}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mock Documents / Attachments */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      Compliance & Supporting Documents
                    </h4>
                    <span className="text-[11px] text-slate-400">3 attachments verified</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs hover:border-indigo-300 transition">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">Inspection_Clearance_Certificate.pdf</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0">1.4 MB • Certified</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs hover:border-indigo-300 transition">
                      <div className="flex items-center gap-2 truncate">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">Routine_Factory_Test_Report_FAT.pdf</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0">3.2 MB • NABL Pass</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs hover:border-indigo-300 transition">
                      <div className="flex items-center gap-2 truncate">
                        <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">LR_E-WayBill_Consignment_Note.pdf</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0">890 KB • GPS Logged</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'linked' && (
              <div className="space-y-5">
                {/* 1. INTERNAL PROCESS FLOW BANNER ACCORDING TO USER FLOW DIAGRAM */}
                {workflowTrace && (
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                          <GitBranch className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                            {workflowTrace.portal}
                          </div>
                          <div className="text-sm font-extrabold text-white">
                            Current Stage: {workflowTrace.flowStep}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
                        {workflowTrace.track === 'execution' ? 'Site & Execution Track' : 'Purchase & Store Track'}
                      </span>
                    </div>

                    {/* Step-by-step pipeline bar */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                      {workflowTrace.pipeline.map((step, sIdx) => {
                        const isCurrent = step.label.toLowerCase().includes(workflowTrace.flowStep.toLowerCase()) ||
                          workflowTrace.flowStep.toLowerCase().includes(step.label.toLowerCase());

                        return (
                          <React.Fragment key={step.id}>
                            <div
                              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 shadow-xs'
                                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                              }`}
                              title={`${step.portal}: ${step.label}`}
                            >
                              <div className="text-[9px] uppercase tracking-wider opacity-75 font-mono">{step.portal}</div>
                              <div className="truncate max-w-[130px]">{step.label}</div>
                            </div>
                            {sIdx < workflowTrace.pipeline.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. UPSTREAM PRECEDING DOCUMENTS IN WORKFLOW */}
                {workflowTrace && workflowTrace.upstream && workflowTrace.upstream.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                      Preceding Documents in Flow ({workflowTrace.upstream.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {workflowTrace.upstream.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50/50 hover:bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs flex justify-between items-center transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.docNumber || item.id}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {item.portal} • {item.label}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] truncate max-w-sm">
                              {item.record?.title || item.record?.itemName || item.record?.comments || 'Linked upstream document'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.status && <Badge status={item.status} />}
                            <button
                              onClick={() => openDrawer(item.record, item.type)}
                              className="px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition shadow-2xs"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DOWNSTREAM NEXT-STAGE DOCUMENTS IN WORKFLOW */}
                {workflowTrace && workflowTrace.downstream && workflowTrace.downstream.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      Succeeding Documents in Flow ({workflowTrace.downstream.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {workflowTrace.downstream.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs flex justify-between items-center transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.docNumber || item.id}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {item.portal} • {item.label}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] truncate max-w-sm">
                              {item.record?.title || item.record?.itemName || item.record?.comments || 'Linked downstream document'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.status && <Badge status={item.status} />}
                            <button
                              onClick={() => openDrawer(item.record, item.type)}
                              className="px-2 py-1 rounded-md bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition shadow-2xs"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. LOOPBACK TO SITE PORTAL (CONTRACTOR RETURN RECONCILIATION) */}
                {workflowTrace && workflowTrace.loopback && workflowTrace.loopback.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-amber-600" />
                      Return-to-Site Portal Loopback ({workflowTrace.loopback.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {workflowTrace.loopback.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-amber-50/50 hover:bg-amber-50/80 rounded-xl border border-amber-200 text-xs flex justify-between items-center transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.docNumber || item.id}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {item.label} (Reconciliation)
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] truncate max-w-sm">
                              {item.record?.reason || item.record?.itemName || 'Reconciliation against Demand Note / MRHOV*'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.status && <Badge status={item.status} />}
                            <button
                              onClick={() => openDrawer(item.record, item.type)}
                              className="px-2 py-1 rounded-md bg-white border border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] transition shadow-2xs"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. ITEM MASTER ASSOCIATED TRANSACTIONS */}
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Associated Ledger History for {drawerRecord.tempCode || drawerRecord.id}
                  </h4>

                  {/* Purchase Orders */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-600" />
                      Purchase Orders ({linkedPOs.length})
                    </span>
                    {linkedPOs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg">No direct PO records linked</p>
                    ) : (
                      linkedPOs.map(po => (
                        <div key={po.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{po.poNumber} • {po.vendorName}</div>
                            <div className="text-slate-500 mt-0.5">Qty: {po.orderedQty} {po.unit} • ₹{(po.totalAmount).toLocaleString('en-IN')}</div>
                          </div>
                          <Badge status={po.status} />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dispatch Instructions */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      Dispatch Instructions ({linkedDIs.length})
                    </span>
                    {linkedDIs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg">No dispatch instructions linked</p>
                    ) : (
                      linkedDIs.map(di => (
                        <div key={di.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{di.diNumber} • {di.transporterName}</div>
                            <div className="text-slate-500 mt-0.5">Qty: {di.dispatchQty} {di.unit} • Vehicle: {di.vehicleNo}</div>
                          </div>
                          <Badge status={di.status} />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Material Issues */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      Material Issues to Contractors ({linkedIssues.length})
                    </span>
                    {linkedIssues.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg">No material issue notes found</p>
                    ) : (
                      linkedIssues.map(mi => (
                        <div key={mi.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{mi.minNumber} • {mi.contractorName}</div>
                            <div className="text-slate-500 mt-0.5">Issued: {mi.issuedQty} {mi.unit} • Store: {mi.storeName}</div>
                          </div>
                          <Badge status={mi.status} />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Work Orders */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Work Orders ({linkedWOs.length})
                    </span>
                    {linkedWOs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg">No direct work orders linked</p>
                    ) : (
                      linkedWOs.map(wo => (
                        <div key={wo.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{wo.woNumber} • {wo.contractorName}</div>
                            <div className="text-slate-500 mt-0.5">{wo.title}</div>
                          </div>
                          <Badge status={wo.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Approval Action Form (if approval item or pending item) */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Executive Approval Action Desk
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Take decisive action on this record</p>
                    </div>
                    <Badge status={drawerRecord.status || 'Pending'} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Action Comments / Justification Remarks:
                    </label>
                    <textarea
                      rows={2}
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      placeholder="Enter verification notes, technical clearance codes, or modification requirements..."
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const targetId = drawerRecord.id;
                        handleApprovalAction(targetId, 'Approve', approvalComment);
                        setApprovalComment('');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const targetId = drawerRecord.id;
                        handleApprovalAction(targetId, 'Request Changes', approvalComment);
                        setApprovalComment('');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Changes
                    </button>
                    <button
                      onClick={() => {
                        const targetId = drawerRecord.id;
                        handleApprovalAction(targetId, 'Reject', approvalComment);
                        setApprovalComment('');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* History Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Timestamped Audit & Approval Trail
                  </h4>

                  {drawerRecord.history && drawerRecord.history.length > 0 ? (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {drawerRecord.history.map((step, idx) => (
                        <div key={idx} className="relative group">
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{step.action} by {step.by}</span>
                              <span className="text-[11px] text-slate-400">{step.timestamp}</span>
                            </div>
                            <p className="text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1">
                              {step.comment || 'Action recorded successfully.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>System generation timestamp: <strong>2026-02-15 09:30 AM</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Created by: <strong>Executive ERP Administrator</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>No historical status reversals detected.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition"
              >
                Print Voucher
              </button>
              <button
                onClick={handleExportJson}
                className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition"
              >
                Export JSON
              </button>
            </div>
            <button
              onClick={closeDrawer}
              className="py-2 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
