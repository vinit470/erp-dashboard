import React from 'react';
import Header from './components/layout/Header';
import FilterBar from './components/common/FilterBar';
import Toast from './components/common/Toast';
import DetailDrawer from './components/common/DetailDrawer';
import QuickAddModal from './components/layout/QuickAddModal';
import DetailedReportModal from './components/overview/DetailedReportModal';

// Overview components
import OverviewCards from './components/overview/OverviewCards';

// Single Page 5 Boxes Hub with sub-points and live table
import FiveBoxesHub from './components/singlepage/FiveBoxesHub';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sticky Full-Width Header */}
      <Header />

      {/* Main Single Page Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Global Telemetry Filter Ribbon */}
        <FilterBar />

        {/* Top Summary Operational KPI Cards */}
        <OverviewCards />

        {/* 5 BOXES SINGLE PAGE CORE HUB (WITH SUB-POINTS INSIDE & LIVE ACTIVE WORKSPACE) */}
        <section id="five-boxes-section">
          <FiveBoxesHub />
        </section>
      </main>

      {/* Global Footer */}
      <footer className="py-4 px-6 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Enterprise Discom ERP System</span>
          <span>•</span>
          <span>Core Operations Hub Single-Page Architecture</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Real-time Shared Ledger • Local Storage Encrypted Cache • Version 3.1.0
        </div>
      </footer>

      {/* Slide-in Detail Drawer */}
      <DetailDrawer />

      {/* Contextual Quick Add / Edit Modal */}
      <QuickAddModal />

      {/* Comprehensive Detailed Report Modal */}
      <DetailedReportModal />

      {/* Floating System Alerts & Toasts */}
      <Toast />
    </div>
  );
}
