import React, { useState, useMemo, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import Badge from './Badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  recordType = 'item',
  title = '',
  subtitle = '',
  actions = null,
  onRowClick = null,
  defaultSortField = '',
  defaultSortOrder = 'asc'
}) {
  const { openDrawer, addToast } = useErp();

  // Internal search query within table
  const [tableSearch, setTableSearch] = useState('');

  // Column visibility state (default all true unless specified defaultHidden)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const map = {};
    columns.forEach(c => {
      map[c.key] = !c.defaultHidden;
    });
    return map;
  });

  // Re-sync visibility whenever columns configuration changes (e.g. topic changes)
  useEffect(() => {
    const map = {};
    columns.forEach(c => {
      map[c.key] = visibleColumns[c.key] !== undefined ? visibleColumns[c.key] : !c.defaultHidden;
    });
    setVisibleColumns(map);
  }, [columns]);
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState(defaultSortField || (columns[0]?.key || ''));
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered & sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Local search across visible values
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      result = result.filter(item => {
        return Object.entries(item).some(([k, v]) => {
          if (v == null) return false;
          return v.toString().toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const strA = valA.toString().toLowerCase();
        const strB = valB.toString().toLowerCase();

        if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, tableSearch, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (key) => {
    if (sortField === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortOrder('asc');
    }
  };

  // Toggle column visibility
  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!processedData.length) {
      addToast('No records available to export.', 'warning');
      return;
    }

    const visibleCols = columns.filter(c => visibleColumns[c.key]);
    const headers = visibleCols.map(c => `"${c.label}"`).join(',');
    const rows = processedData.map(row => {
      return visibleCols.map(c => {
        let val = row[c.key];
        if (val == null) val = '';
        if (typeof val === 'string') {
          val = val.replace(/"/g, '""');
        }
        return `"${val}"`;
      }).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${recordType}-records-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast(`Exported ${processedData.length} records to CSV successfully!`, 'success');
  };

  const handleRowSelect = (row) => {
    if (onRowClick) {
      onRowClick(row);
    } else {
      openDrawer(row, recordType);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/40">
        <div>
          {title && <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>}
          {subtitle ? (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">Showing {processedData.length} records</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick search input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in table..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Columns
            </button>

            {isColMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-30 p-2 text-xs space-y-1 animate-fade-in max-h-64 overflow-y-auto">
                <div className="px-2 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Toggle Columns
                </div>
                {columns.map(col => (
                  <label
                    key={col.key}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none text-slate-700"
                  >
                    <span>{col.label}</span>
                    <input
                      type="checkbox"
                      checked={!!visibleColumns[col.key]}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>

          {/* Contextual Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
              {columns
                .filter(col => visibleColumns[col.key])
                .map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`px-4 py-3 select-none whitespace-nowrap ${
                      col.isStatic ? 'bg-slate-100/70 border-r border-slate-200/60 font-bold text-slate-800' : ''
                    } ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-slate-200/80 hover:text-slate-900 transition' : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end w-full' : col.align === 'center' ? 'justify-center w-full' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        sortField === col.key ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.filter(col => visibleColumns[col.key]).length + 1} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No records found matching criteria</p>
                    <p className="text-xs text-slate-400 max-w-sm">Try adjusting your search queries or clearing active filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || row.tempCode || index}
                  onClick={() => handleRowSelect(row)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                >
                  {columns
                    .filter(col => visibleColumns[col.key])
                    .map(col => {
                      const val = row[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-slate-700 font-medium whitespace-nowrap ${
                            col.isStatic ? 'bg-slate-50/40 border-r border-slate-200/50' : ''
                          } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                        >
                          {col.render ? (
                            col.render(val, row)
                          ) : col.isStatus ? (
                            <Badge status={val} />
                          ) : col.isCurrency ? (
                            <span className="font-semibold text-slate-900">
                              {val != null ? `₹${Number(val).toLocaleString('en-IN')}` : 'N/A'}
                            </span>
                          ) : (
                            <span className="truncate max-w-[260px] inline-block align-middle">
                              {val != null && val !== '' ? val.toString() : '—'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowSelect(row);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({processedData.length} total)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
