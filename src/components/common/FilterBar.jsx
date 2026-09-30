import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Filter, X, RotateCcw, Calendar, MapPin, Package, Hash, CheckCircle2 } from 'lucide-react';

export default function FilterBar() {
  const { filters, setFilters, data } = useErp();

  // Extract unique filter options from data
  const circles = ['All', ...new Set(data.items.map(i => i.circle).filter(Boolean))];
  const packages = ['All', ...new Set(data.items.map(i => i.package).filter(Boolean))];
  const tempCodes = ['All', ...new Set(data.items.map(i => i.tempCode).filter(Boolean))];
  const statuses = ['All', 'Approved', 'Pending', 'In Progress', 'Rejected'];
  const dateRanges = ['All', 'Today', 'Last 7 Days', 'Last 30 Days', 'Q1 2026', 'Q2 2026'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      circle: 'All',
      package: 'All',
      itemName: '',
      tempCode: 'All',
      dateRange: 'All',
      status: 'All',
      searchQuery: ''
    });
  };

  const removeFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'itemName' || key === 'searchQuery' ? '' : 'All'
    }));
  };

  // Determine active filter chips
  const activeFilters = [];
  if (filters.circle !== 'All') activeFilters.push({ key: 'circle', label: `Circle: ${filters.circle}` });
  if (filters.package !== 'All') activeFilters.push({ key: 'package', label: `Package: ${filters.package}` });
  if (filters.tempCode !== 'All') activeFilters.push({ key: 'tempCode', label: `Temp Code: ${filters.tempCode}` });
  if (filters.status !== 'All') activeFilters.push({ key: 'status', label: `Status: ${filters.status}` });
  if (filters.dateRange !== 'All') activeFilters.push({ key: 'dateRange', label: `Period: ${filters.dateRange}` });
  if (filters.itemName) activeFilters.push({ key: 'itemName', label: `Item: "${filters.itemName}"` });
  if (filters.searchQuery) activeFilters.push({ key: 'searchQuery', label: `Query: "${filters.searchQuery}"` });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Global Telemetry Filters</span>
        </div>

        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Filters ({activeFilters.length})
          </button>
        )}
      </div>

      {/* Filter Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        {/* Circle */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Circle
          </label>
          <select
            value={filters.circle}
            onChange={(e) => handleFilterChange('circle', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {circles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Package */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Package className="w-3 h-3 text-slate-400" />
            Package
          </label>
          <select
            value={filters.package}
            onChange={(e) => handleFilterChange('package', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {packages.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Temp Code */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-400" />
            Temp Code
          </label>
          <select
            value={filters.tempCode}
            onChange={(e) => handleFilterChange('tempCode', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {tempCodes.map(tc => (
              <option key={tc} value={tc}>{tc}</option>
            ))}
          </select>
        </div>

        {/* Item Name Search */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Item Name
          </label>
          <input
            type="text"
            placeholder="Search item name..."
            value={filters.itemName}
            onChange={(e) => handleFilterChange('itemName', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {dateRanges.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-slate-400" />
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">Active filters:</span>
          {activeFilters.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium"
            >
              {chip.label}
              <button
                onClick={() => removeFilter(chip.key)}
                className="hover:text-indigo-900 transition ml-0.5 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
