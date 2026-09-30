import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import Modal from '../common/Modal';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function QuickAddModal() {
  const {
    addModalConfig,
    closeAddModal,
    saveRecord,
    data,
    getStockLedger
  } = useErp();

  const { isOpen, entityType, editItem } = addModalConfig;

  // Form state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      // Initialize defaults based on entityType
      const defaults = {
        circle: data.items[0]?.circle || 'Jaipur',
        package: data.items[0]?.package || 'PKG-01',
        status: 'Approved',
        date: new Date().toISOString().slice(0, 10),
        unit: 'Nos'
      };

      if (entityType === 'issue' || entityType === 'return' || entityType === 'outward' || entityType === 'transfer' || entityType === 'receipt' || entityType === 'inward') {
        defaults.storeName = data.stores[0]?.name;
        defaults.tempCode = data.items[0]?.tempCode;
        defaults.itemName = data.items[0]?.itemName;
        defaults.unit = data.items[0]?.unit;
      }

      if (entityType === 'transfer') {
        defaults.sourceStore = data.stores[0]?.name;
        defaults.destinationStore = data.stores[1]?.name || data.stores[0]?.name;
      }

      if (entityType === 'po' || entityType === 'di' || entityType === 'pi' || entityType === 'wo' || entityType === 'dn' || entityType === 'mrhov') {
        defaults.tempCode = data.items[0]?.tempCode;
        defaults.itemName = data.items[0]?.itemName;
        defaults.unit = data.items[0]?.unit;
      }

      setFormData(defaults);
    }
    setErrors({});
  }, [isOpen, entityType, editItem, data]);

  if (!isOpen || !entityType) return null;

  const handleChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };

      // Auto-populate item details if tempCode changed
      if (field === 'tempCode') {
        const item = data.items.find(i => i.tempCode === val);
        if (item) {
          updated.itemName = item.itemName;
          updated.unit = item.unit;
          updated.package = item.package;
          updated.circle = item.circle;
          if (item.unitRate) updated.unitPrice = item.unitRate;
        }
      }

      // Auto-calculate total amount
      if (field === 'orderedQty' || field === 'unitPrice') {
        const q = Number(field === 'orderedQty' ? val : updated.orderedQty) || 0;
        const p = Number(field === 'unitPrice' ? val : updated.unitPrice) || 0;
        updated.totalAmount = q * p;
      }

      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Stock check info for inventory movements
  const activeStock = (entityType === 'issue' || entityType === 'outward') && formData.tempCode ?
    getStockLedger(formData.tempCode, formData.storeName) :
    entityType === 'transfer' && formData.tempCode ?
    getStockLedger(formData.tempCode, formData.sourceStore) : null;

  const validateAndSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (entityType === 'item') {
      if (!formData.tempCode) newErrors.tempCode = "Temp Code is required";
      if (!formData.itemName) newErrors.itemName = "Item Name is required";
      if (!formData.unitRate) newErrors.unitRate = "Unit Rate is required";
    }

    if (entityType === 'po') {
      if (!formData.poNumber) newErrors.poNumber = "PO Number is required";
      if (!formData.vendorName) newErrors.vendorName = "Vendor Name is required";
      if (!formData.orderedQty || Number(formData.orderedQty) <= 0) newErrors.orderedQty = "Valid ordered quantity required";
    }

    if (entityType === 'issue') {
      if (!formData.minNumber) newErrors.minNumber = "MIN Number is required";
      if (!formData.contractorName) newErrors.contractorName = "Contractor name is required";
      const q = Number(formData.issuedQty);
      if (!q || q <= 0) newErrors.issuedQty = "Valid issued quantity required";
      if (activeStock && q > activeStock.available) {
        newErrors.issuedQty = `Cannot exceed available store stock (${activeStock.available} ${formData.unit || ''})`;
      }
    }

    if (entityType === 'outward') {
      if (!formData.gatePassNo) newErrors.gatePassNo = "Gate Pass number is required";
      const q = Number(formData.qty);
      if (!q || q <= 0) newErrors.qty = "Valid outward quantity required";
      if (activeStock && q > activeStock.available) {
        newErrors.qty = `Cannot exceed available stock (${activeStock.available})`;
      }
    }

    if (entityType === 'transfer') {
      if (formData.sourceStore === formData.destinationStore) {
        newErrors.destinationStore = "Destination store must differ from source store";
      }
      const q = Number(formData.transferQty);
      if (!q || q <= 0) newErrors.transferQty = "Valid transfer quantity required";
      if (activeStock && q > activeStock.available) {
        newErrors.transferQty = `Source store only has ${activeStock.available} available`;
      }
    }

    if (entityType === 'wo') {
      if (!formData.woNumber) newErrors.woNumber = "WO Number is required";
      if (!formData.title) newErrors.title = "Work order title is required";
      if (!formData.contractorName) newErrors.contractorName = "Contractor is required";
    }

    if (entityType === 'clientBill' || entityType === 'contractorBill') {
      if (!formData.billNumber) newErrors.billNumber = "Bill number is required";
      if (!formData.claimedAmount && !formData.billedAmount) newErrors.amount = "Bill amount is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save
    const success = saveRecord(entityType, formData, !!editItem);
    if (!success) {
      // Error handled inside saveRecord
    }
  };

  const titles = {
    item: "Item Master Record",
    po: "Purchase Order (PO)",
    di: "Dispatch Instruction (DI)",
    pi: "Purchase Invoice (PI)",
    store: "Store Master Facility",
    receipt: "Store Receipt (SR)",
    inward: "Store Inward (SI / GRN)",
    issue: "Material Issue Note (MIN)",
    return: "Contractor Return Note",
    outward: "Outward Security Register",
    transfer: "Inter Store Transfer Note",
    wo: "Work Order Creation (WO)",
    dn: "Site Demand Note",
    mrhov: "MRHOV Verification Record",
    clientBill: "Client RA Billing",
    contractorBill: "Contractor RA Billing"
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAddModal}
      title={`${editItem ? 'Edit' : 'Create New'} ${titles[entityType] || 'Record'}`}
      subtitle="Complete required reporting parameters and operational fields"
    >
      <form onSubmit={validateAndSubmit} className="space-y-4 text-xs">
        {/* Available Stock Warning Banner */}
        {activeStock && (
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            activeStock.available > 0 ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>
                Current Available Stock in <strong>{formData.storeName || formData.sourceStore}</strong>:
              </span>
            </div>
            <span className="font-extrabold text-sm">
              {activeStock.available} {formData.unit || 'Units'}
            </span>
          </div>
        )}

        {/* 1. Item Master Form */}
        {entityType === 'item' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Temp Code *</label>
              <input
                type="text"
                placeholder="e.g. TC-1025"
                value={formData.tempCode || ''}
                onChange={e => handleChange('tempCode', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.tempCode && <span className="text-rose-600 text-[11px]">{errors.tempCode}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={formData.category || 'Cables & Conductors'}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Cables & Conductors">Cables & Conductors</option>
                <option value="Transformers">Transformers</option>
                <option value="Switchgear">Switchgear</option>
                <option value="Poles & Structures">Poles & Structures</option>
                <option value="Meters & Instrumentation">Meters & Instrumentation</option>
                <option value="Safety & Protection">Safety & Protection</option>
                <option value="Earthing & Civil">Earthing & Civil</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Item Name / Technical Description *</label>
              <input
                type="text"
                placeholder="e.g. 33kV 3-Core XLPE Armoured Power Cable"
                value={formData.itemName || ''}
                onChange={e => handleChange('itemName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.itemName && <span className="text-rose-600 text-[11px]">{errors.itemName}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Package</label>
              <select
                value={formData.package || 'PKG-01'}
                onChange={e => handleChange('package', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="PKG-01">PKG-01</option>
                <option value="PKG-02">PKG-02</option>
                <option value="PKG-03">PKG-03</option>
                <option value="PKG-04">PKG-04</option>
                <option value="PKG-05">PKG-05</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Circle</label>
              <select
                value={formData.circle || 'Jaipur'}
                onChange={e => handleChange('circle', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Jaipur">Jaipur</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Pune">Pune</option>
                <option value="Indore">Indore</option>
                <option value="Patna">Patna</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit</label>
              <input
                type="text"
                placeholder="Km, Nos, Sets, Kg"
                value={formData.unit || ''}
                onChange={e => handleChange('unit', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit Rate (₹) *</label>
              <input
                type="number"
                placeholder="Rate in ₹"
                value={formData.unitRate || ''}
                onChange={e => handleChange('unitRate', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.unitRate && <span className="text-rose-600 text-[11px]">{errors.unitRate}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">LOA Quantity</label>
              <input
                type="number"
                value={formData.loaQty || ''}
                onChange={e => handleChange('loaQty', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">BOM Quantity</label>
              <input
                type="number"
                value={formData.bomQty || ''}
                onChange={e => handleChange('bomQty', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Opening Stock</label>
              <input
                type="number"
                value={formData.openingStock || ''}
                onChange={e => handleChange('openingStock', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Min Safety Stock</label>
              <input
                type="number"
                value={formData.minStockLevel || ''}
                onChange={e => handleChange('minStockLevel', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 2. Purchase Order Form */}
        {entityType === 'po' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">PO Number *</label>
              <input
                type="text"
                placeholder="e.g. PO/RDSS/2026/0120"
                value={formData.poNumber || ''}
                onChange={e => handleChange('poNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.poNumber && <span className="text-rose-600 text-[11px]">{errors.poNumber}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vendor / Manufacturer Name *</label>
              <input
                type="text"
                placeholder="e.g. Havells India Ltd."
                value={formData.vendorName || ''}
                onChange={e => handleChange('vendorName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.vendorName && <span className="text-rose-600 text-[11px]">{errors.vendorName}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Item (Temp Code)</label>
              <select
                value={formData.tempCode || ''}
                onChange={e => handleChange('tempCode', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.items.map(it => (
                  <option key={it.tempCode} value={it.tempCode}>
                    {it.tempCode} - {it.itemName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">PO Date</label>
              <input
                type="date"
                value={formData.poDate || new Date().toISOString().slice(0, 10)}
                onChange={e => handleChange('poDate', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ordered Quantity *</label>
              <input
                type="number"
                placeholder="Quantity"
                value={formData.orderedQty || ''}
                onChange={e => handleChange('orderedQty', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.orderedQty && <span className="text-rose-600 text-[11px]">{errors.orderedQty}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit Rate (₹)</label>
              <input
                type="number"
                placeholder="Rate"
                value={formData.unitPrice || ''}
                onChange={e => handleChange('unitPrice', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Calculated PO Value:</span>
                <span className="text-sm font-black text-indigo-700">
                  ₹{Number(formData.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Dispatch Instruction (DI) */}
        {entityType === 'di' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DI Number *</label>
              <input
                type="text"
                placeholder="e.g. DI/RDSS/2026/009"
                value={formData.diNumber || ''}
                onChange={e => handleChange('diNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Linked PO Number</label>
              <select
                value={formData.poNumber || ''}
                onChange={e => handleChange('poNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.purchaseOrders.map(p => (
                  <option key={p.id} value={p.poNumber}>{p.poNumber} ({p.itemName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dispatch Quantity *</label>
              <input
                type="number"
                placeholder="Quantity"
                value={formData.dispatchQty || ''}
                onChange={e => handleChange('dispatchQty', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Destination Store</label>
              <select
                value={formData.destinationStore || data.stores[0]?.name}
                onChange={e => handleChange('destinationStore', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.stores.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transporter Name</label>
              <input
                type="text"
                placeholder="e.g. VRL Logistics"
                value={formData.transporterName || ''}
                onChange={e => handleChange('transporterName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vehicle No.</label>
              <input
                type="text"
                placeholder="e.g. RJ-14-GC-4122"
                value={formData.vehicleNo || ''}
                onChange={e => handleChange('vehicleNo', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 4. Material Issue Note (MIN) */}
        {entityType === 'issue' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">MIN Number *</label>
              <input
                type="text"
                placeholder="e.g. MIN/2026/045"
                value={formData.minNumber || ''}
                onChange={e => handleChange('minNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.minNumber && <span className="text-rose-600 text-[11px]">{errors.minNumber}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Issuing Store</label>
              <select
                value={formData.storeName || ''}
                onChange={e => handleChange('storeName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.stores.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Item *</label>
              <select
                value={formData.tempCode || ''}
                onChange={e => handleChange('tempCode', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.items.map(it => (
                  <option key={it.tempCode} value={it.tempCode}>
                    {it.tempCode} - {it.itemName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contractor / Agency *</label>
              <input
                type="text"
                placeholder="e.g. Larsen & Toubro"
                value={formData.contractorName || ''}
                onChange={e => handleChange('contractorName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.contractorName && <span className="text-rose-600 text-[11px]">{errors.contractorName}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Issued Quantity *</label>
              <input
                type="number"
                placeholder="Enter Qty"
                value={formData.issuedQty || ''}
                onChange={e => handleChange('issuedQty', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.issuedQty && <span className="text-rose-600 text-[11px] font-bold">{errors.issuedQty}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Order Reference</label>
              <input
                type="text"
                placeholder="e.g. WO/2026/001"
                value={formData.workOrderNumber || ''}
                onChange={e => handleChange('workOrderNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 5. Inter Transfer */}
        {entityType === 'transfer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transfer Number *</label>
              <input
                type="text"
                placeholder="e.g. ITR/2026/020"
                value={formData.transferNumber || ''}
                onChange={e => handleChange('transferNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Item *</label>
              <select
                value={formData.tempCode || ''}
                onChange={e => handleChange('tempCode', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.items.map(it => (
                  <option key={it.tempCode} value={it.tempCode}>
                    {it.tempCode} - {it.itemName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Source Store (From) *</label>
              <select
                value={formData.sourceStore || ''}
                onChange={e => handleChange('sourceStore', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.stores.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Destination Store (To) *</label>
              <select
                value={formData.destinationStore || ''}
                onChange={e => handleChange('destinationStore', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {data.stores.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {errors.destinationStore && <span className="text-rose-600 text-[11px] font-bold">{errors.destinationStore}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transfer Quantity *</label>
              <input
                type="number"
                placeholder="Qty to transfer"
                value={formData.transferQty || ''}
                onChange={e => handleChange('transferQty', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.transferQty && <span className="text-rose-600 text-[11px] font-bold">{errors.transferQty}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transportation Details</label>
              <input
                type="text"
                placeholder="Trailer / Carrier / Dispatch Ref"
                value={formData.transportDetails || ''}
                onChange={e => handleChange('transportDetails', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 6. Work Order Creation */}
        {entityType === 'wo' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Order No. *</label>
              <input
                type="text"
                placeholder="e.g. WO/2026/010"
                value={formData.woNumber || ''}
                onChange={e => handleChange('woNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.woNumber && <span className="text-rose-600 text-[11px]">{errors.woNumber}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contractor Name *</label>
              <input
                type="text"
                placeholder="e.g. Tata Power / Infra"
                value={formData.contractorName || ''}
                onChange={e => handleChange('contractorName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.contractorName && <span className="text-rose-600 text-[11px]">{errors.contractorName}</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Work Order Scope / Title *</label>
              <input
                type="text"
                placeholder="Scope of civil, erection, or commissioning work"
                value={formData.title || ''}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.title && <span className="text-rose-600 text-[11px]">{errors.title}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contract Value (₹)</label>
              <input
                type="number"
                placeholder="Amount in ₹"
                value={formData.contractValue || ''}
                onChange={e => handleChange('contractValue', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Completion Date</label>
              <input
                type="date"
                value={formData.completionDeadline || ''}
                onChange={e => handleChange('completionDeadline', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 7. Billing (Client / Contractor) */}
        {(entityType === 'clientBill' || entityType === 'contractorBill') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">RA Bill Number *</label>
              <input
                type="text"
                placeholder="e.g. CB/RDSS/RA-04"
                value={formData.billNumber || ''}
                onChange={e => handleChange('billNumber', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.billNumber && <span className="text-rose-600 text-[11px]">{errors.billNumber}</span>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bill Category</label>
              <select
                value={formData.billType || 'Supply Bill RA'}
                onChange={e => handleChange('billType', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Supply Bill RA">Supply Bill RA</option>
                <option value="Erection Bill RA">Erection Bill RA</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {entityType === 'clientBill' ? 'Client / DISCOM Name' : 'Contractor Name'}
              </label>
              <input
                type="text"
                placeholder="Name of entity"
                value={(entityType === 'clientBill' ? formData.clientName : formData.contractorName) || ''}
                onChange={e => handleChange(entityType === 'clientBill' ? 'clientName' : 'contractorName', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gross Bill Amount (₹) *</label>
              <input
                type="number"
                placeholder="Claimed amount"
                value={(entityType === 'clientBill' ? formData.claimedAmount : formData.billedAmount) || ''}
                onChange={e => {
                  const val = e.target.value;
                  if (entityType === 'clientBill') {
                    handleChange('claimedAmount', val);
                    handleChange('certifiedAmount', val);
                  } else {
                    handleChange('billedAmount', val);
                    handleChange('verifiedAmount', val);
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              {errors.amount && <span className="text-rose-600 text-[11px]">{errors.amount}</span>}
            </div>
          </div>
        )}

        {/* Generic fallback fields for other types */}
        {!['item', 'po', 'di', 'issue', 'transfer', 'wo', 'clientBill', 'contractorBill'].includes(entityType) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Document / Reference No. *</label>
              <input
                type="text"
                value={formData.id || formData.referenceId || formData.receiptNumber || formData.inwardNumber || formData.dnNumber || formData.mrhovNumber || ''}
                onChange={e => handleChange('id', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Quantity / Count</label>
              <input
                type="number"
                value={formData.receivedQty || formData.acceptedQty || formData.requestedQty || formData.mrhovQty || formData.qty || 1}
                onChange={e => {
                  const val = e.target.value;
                  if (formData.receivedQty !== undefined) handleChange('receivedQty', val);
                  else if (formData.acceptedQty !== undefined) handleChange('acceptedQty', val);
                  else if (formData.requestedQty !== undefined) handleChange('requestedQty', val);
                  else handleChange('qty', val);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeAddModal}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20"
          >
            {editItem ? 'Save Changes' : 'Confirm & Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
