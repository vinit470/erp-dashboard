import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';
import { FileSpreadsheet, Download, SlidersHorizontal, AlertCircle } from 'lucide-react';

export default function DetailedReportModal() {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    reportingItems,
    matchesGlobalFilters
  } = useErp();

  const filteredReportingItems = reportingItems.filter(matchesGlobalFilters);

  // All 20+ reporting columns
  const reportColumns = [
    // Common identifiers
    { key: 'srNo', label: 'Sr. No.', sortable: true, align: 'center', defaultHidden: false },
    { key: 'tempCode', label: 'Temp Code', sortable: true, defaultHidden: false, render: (val) => <span className="font-bold text-indigo-700">{val}</span> },
    { key: 'itemName', label: 'Item Name', sortable: true, defaultHidden: false, render: (val, row) => (
      <div className="max-w-[260px]">
        <div className="font-semibold text-slate-900 truncate">{val}</div>
        <div className="text-[10px] text-slate-400">{row.category} • {row.unit}</div>
      </div>
    )},
    { key: 'package', label: 'Package', sortable: true, defaultHidden: false },
    { key: 'circle', label: 'Circle', sortable: true, defaultHidden: false },

    // Purchase reporting
    { key: 'loaQty', label: 'LOA Quantity', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => val != null ? `${val} ${row.unit}` : 'N/A' },
    { key: 'bomQty', label: 'BOM Quantity', sortable: true, align: 'right', defaultHidden: true, render: (val, row) => val != null ? `${val} ${row.unit}` : 'N/A' },
    { key: 'totalDiDone', label: 'Total DI Done', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => `${val || 0} ${row.unit}` },
    { key: 'balDiAgainstLoa', label: 'Bal for DI against LOA', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => (
      <span className={row.isDiOverTarget ? 'text-rose-600 font-bold' : 'text-slate-800 font-semibold'}>
        {val != null ? (row.isDiOverTarget ? `Over target (+${(row.totalDiDone || 0) - (row.loaQty || 0)})` : `${val} ${row.unit}`) : 'N/A'}
      </span>
    )},
    { key: 'balDispatchAgainstLoa', label: 'Bal for Dispatch against LOA', sortable: true, align: 'right', defaultHidden: true, render: (val, row) => val != null ? `${val} ${row.unit}` : 'N/A' },
    { key: 'totalPiDone', label: 'Total PI Done (IR)', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => `${val || 0} ${row.unit}` },
    { key: 'balForIr', label: 'Bal for IR', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => `${val || 0} ${row.unit}` },

    // Site reporting
    { key: 'totalMrhovDone', label: 'Total MRHOV Done', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => `${val || 0} ${row.unit}` },
    { key: 'balForMrhov', label: 'Bal for MRHOV', sortable: true, align: 'right', defaultHidden: false, render: (val, row) => (
      <span className={row.isMrhovOverTarget ? 'text-rose-600 font-bold' : 'text-slate-800'}>
        {val != null ? (row.isMrhovOverTarget ? 'Over Target' : `${val} ${row.unit}`) : 'N/A'}
      </span>
    )},
    { key: 'totalJmcDone', label: 'Total JMC Done', sortable: true, align: 'right', defaultHidden: true, render: (val, row) => `${val || 0} ${row.unit}` },
    { key: 'balForJmc', label: 'Bal for JMC', sortable: true, align: 'right', defaultHidden: true, render: (val, row) => val != null ? `${val} ${row.unit}` : 'N/A' },

    // Billing reporting
    { key: 'supplyBillRa', label: 'Supply Bill RA', sortable: true, align: 'right', defaultHidden: false, render: (val) => val != null ? `₹${(val / 100000).toFixed(1)} L` : 'N/A' },
    { key: 'balForSupplyBill', label: 'Bal for Supply Bill', sortable: true, align: 'right', defaultHidden: true, render: (val) => val != null ? (typeof val === 'number' ? `₹${(val / 100000).toFixed(1)} L` : val) : 'N/A' },
    { key: 'erectionBillRa', label: 'Erection Bill RA', sortable: true, align: 'right', defaultHidden: false, render: (val) => val != null ? `₹${(val / 100000).toFixed(1)} L` : 'N/A' },
    { key: 'balForErectionBill', label: 'Bal for Erection Bill', sortable: true, align: 'right', defaultHidden: true, render: (val) => val != null ? (typeof val === 'number' ? `₹${(val / 100000).toFixed(1)} L` : val) : 'N/A' },

    // WIP reporting
    { key: 'wipConsumed', label: 'WIP Consumed', sortable: true, align: 'right', defaultHidden: true, render: (val, row) => val != null ? `${val} ${row.unit}` : 'N/A' },
    { key: 'wipRequired', label: 'WIP Required', sortable: true, align: 'right', defaultHidden: true, render: (val, row) => val != null ? `${val} ${row.unit}` : 'N/A' }
  ];

  return (
    <Modal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      title="Comprehensive Project & Material Status Report (22 Demo Items)"
      subtitle="Consolidated LOA, BOM, Dispatch, Site MRHOV, JMC, Billing & WIP Tracking"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-4">
        {/* Compliance Note */}
        <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold block">Reporting Standards & Balances:</span>
            <span>
              All balances computed with <code>max(0, target − completed)</code>. Over-target completions are flagged in red.
              Supply & Erection billings are maintained separately from contractor RA registers. Available physical stock is derived strictly from store inward/outward movements, excluding uninstalled WIP quantities.
            </span>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={reportColumns}
          data={filteredReportingItems}
          recordType="item"
          title="Master Reporting Ledger"
          subtitle={`Showing all ${filteredReportingItems.length} items with dynamic calculations`}
        />
      </div>
    </Modal>
  );
}
