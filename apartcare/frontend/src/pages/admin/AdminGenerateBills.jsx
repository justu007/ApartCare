

import React, { useState, useEffect } from 'react';
import { generateBills, getOccupiedFlats, getGeneratedBills } from '../../api/admin'; 
import axiosInstance from '../../api/axios'; 

const AdminGenerateBills = () => {
    const [maintenanceFee, setMaintenanceFee] = useState(0);
    const [waterRate, setWaterRate] = useState(0);
    const [electricityRate, setElectricityRate] = useState(0);
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [isEditingRate, setIsEditingRate] = useState(false);
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const [activeTab, setActiveTab] = useState('CREATE'); 

    const [formData, setFormData] = useState({
        bill_type: 'MAINTENANCE',
        amount: '',
        due_date: '',
        billing_month: currentMonth,
        billing_year: currentYear
    });

    const [occupiedFlats, setOccupiedFlats] = useState([]); 
    const [variableUnits, setVariableUnits] = useState({}); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [fetchingFlats, setFetchingFlats] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const isVariable = formData.bill_type === 'WATER' || formData.bill_type === 'ELECTRICITY';

    const [billsList, setBillsList] = useState([]);
    const [loadingBills, setLoadingBills] = useState(false);
    const [billsError, setBillsError] = useState('');
    const [billsPage, setBillsPage] = useState(1);
    const [billsTotalPages, setBillsTotalPages] = useState(1);

    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    useEffect(() => {
        if (activeTab === 'CREATE') {
            fetchFlats(currentPage);
            fetchSettings();
        }
    }, [currentPage, activeTab]);

    useEffect(() => {
        if (activeTab === 'LIST') {
            fetchBillsHistory(billsPage);
        }
    }, [activeTab, billsPage]);

    const fetchSettings = async () => {
        try {
            const res = await axiosInstance.get('/apartment/change-maintenance-fee/'); 
            setMaintenanceFee(res.data.maintenance_fee);
            setWaterRate(res.data.water_rate || 0);
            setElectricityRate(res.data.electricity_rate || 0);
        } catch (err) {
            console.error("Could not fetch settings", err);
            setPopup({ 
                isOpen: true, 
                status: 'error', 
                message: err.response?.data?.error || err.response?.data?.detail || "Could not fetch settings." 
            });
        }
    };

    const saveSettings = async () => {
        try {
            await axiosInstance.put('/apartment/change-maintenance-fee/', { 
                maintenance_fee: maintenanceFee,
                water_rate: waterRate,
                electricity_rate: electricityRate
            });
            setIsEditingFee(false);
            setIsEditingRate(false);
            setPopup({ isOpen: true, status: 'success', message: 'Global Rates Updated Successfully!' });
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 4000);
        } catch (err) {
            setPopup({ isOpen: true, status: 'error', message: 'Failed to update rates.' });
        }
    };

    const fetchFlats = async (page) => {
        setFetchingFlats(true);
        try {
            const response = await getOccupiedFlats(page);
            setOccupiedFlats(response.results || response.data || []);
            const totalItems = response.count || response.total || 0;
            if (totalItems) setTotalPages(Math.ceil(totalItems / 10));
        } catch (err) {
            console.error("Failed to fetch flats", err);
            setPopup({ 
                isOpen: true, 
                status: 'error', 
                message: err.response?.data?.error || err.response?.data?.detail || "Failed to fetch flats."
            });
        } finally {
            setFetchingFlats(false);
        }
    };

    const fetchBillsHistory = async (page) => {
        setLoadingBills(true); setBillsError('');
        try {
            const response = await getGeneratedBills(page); 
            setBillsList(response.data || []);
            if (response.total) setBillsTotalPages(Math.ceil(response.total / response.limit));
        } catch (err) {
            setBillsError("Failed to load billing history.");
            setPopup({ 
                isOpen: true, 
                status: 'error', 
                message: err.response?.data?.error || err.response?.data?.detail || "Failed to load billing history."
            });
        } finally {
            setBillsHistoryLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'bill_type') {
            setVariableUnits({});
            setIsEditingFee(false);
            setIsEditingRate(false);
        }
        setError(''); setResult(null); 
    };

    const handleVariableUnitChange = (flatId, value) => {
        setVariableUnits(prev => ({ ...prev, [flatId]: value }));
    };

    const getActiveRate = () => formData.bill_type === 'WATER' ? waterRate : electricityRate;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedMonth = parseInt(formData.billing_month);
        const selectedYear = parseInt(formData.billing_year);
        const now = new Date();

        if (selectedYear > now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth > now.getMonth() + 1)) {
            setError("You cannot generate bills for future months.");
            return; 
        }
        if (new Date(formData.due_date) <= new Date(selectedYear, selectedMonth, 0)) {
            setError("Invalid Due Date: Must be in the month following the billing period.");
            return;
        }
        
        setLoading(true); setError(''); setResult(null);

        try {
            let payload = {
                ...formData,
                billing_month: parseInt(formData.billing_month),
                billing_year: parseInt(formData.billing_year),
                is_variable: isVariable
            };

            if (isVariable) {
                const currentRate = getActiveRate();
                payload.flat_data = Object.keys(variableUnits).map(flatId => {
                    const units = parseFloat(variableUnits[flatId] || 0);
                    return { flat_id: parseInt(flatId), amount: units * currentRate };
                });
            } else {
                payload.amount = parseFloat(formData.amount || 0);
            }

            const data = await generateBills(payload);
            setResult(data);
            if (!isVariable) setFormData(prev => ({ ...prev, amount: '' }));
            else setVariableUnits({});
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate bills.");
            setPopup({ 
                isOpen: true, 
                status: 'error', 
                message: err.response?.data?.error || err.response?.data?.detail || "Failed to generate bills."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">
                    Bills
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">Generate localized bulk invoices and audit historical records.</p>
            </div>

            {/* TAB ENGINE DEPLOYMENT NAVBAR */}
            <div className="flex gap-6 border-b border-slate-800 bg-slate-950/20 p-1 rounded-t-xl">
                <button onClick={() => setActiveTab('CREATE')} className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'CREATE' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    ⚙️ Bill Generation
                    {activeTab === 'CREATE' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></span>}
                </button>
                <button onClick={() => setActiveTab('LIST')} className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'LIST' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    📋 Bills Logs
                    {activeTab === 'LIST' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></span>}
                </button>
            </div>

            {activeTab === 'CREATE' && (
                <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 border-b border-slate-800/60 pb-5">
                            {error && <div className="p-4 rounded-xl border font-mono text-xs font-bold bg-rose-500/10 border-rose-500/20 text-rose-400">CRITICAL VERIFICATION EXCEPTION: {error}</div>}
                            {result && <div className="p-4 rounded-xl border font-mono text-xs font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">LEDGER SUCCESS: {result.message}</div>}
                        </div>

                        {/* CONFIG SELECTS ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Billing Category </label>
                                <select name="bill_type" value={formData.bill_type} onChange={handleChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 text-xs rounded-xl font-bold tracking-wide cursor-pointer focus:border-cyan-500">
                                    <option value="MAINTENANCE">Maintenance Fee</option>
                                    <option value="WATER">Metered Water Consumption Fee</option>
                                    <option value="ELECTRICITY">Metered Energy/Electricity Fee</option>
                                    <option value="RENT"> Rent Rate</option>
                                </select>
                            </div>

                            {/* CONDITIONAL RENDER PARAMETERS METRIC FIELDS */}
                            <div className="bg-slate-950/30 p-4 border border-slate-800 rounded-xl">
                                {!isVariable ? (
                                    <div>
                                        <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                            {formData.bill_type === 'MAINTENANCE' ? 'Base Maintenance Ledger Rate (₹)' : 'Fixed  Amount (₹)'}
                                        </label>
                                        {formData.bill_type === 'MAINTENANCE' ? (
                                            <div className="flex gap-3">
                                                <input type="number" value={maintenanceFee} onChange={(e) => setMaintenanceFee(e.target.value)} readOnly={!isEditingFee} className={`w-full p-2 text-sm font-black font-mono border outline-none rounded-xl ${isEditingFee ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'}`} />
                                                <button type="button" onClick={isEditingFee ? saveSettings : () => setIsEditingFee(true)} className={`px-4 text-xs font-black tracking-wider uppercase rounded-xl transition-all ${isEditingFee ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 hover:bg-slate-800 text-slate-300'}`}>{isEditingFee ? 'Commit' : 'Edit'}</button>
                                            </div>
                                        ) : (
                                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. 4500" required className="w-full p-2.5 text-sm font-mono border outline-none bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500" />
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block mb-2 text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                                            {formData.bill_type === 'WATER' ? 'Water unit  rate(₹/Litre)' : 'Energy consumption rate (₹/kWh)'}
                                        </label>
                                        <div className="flex gap-3">
                                            <input type="number" step="0.01" value={formData.bill_type === 'WATER' ? waterRate : electricityRate} onChange={(e) => formData.bill_type === 'WATER' ? setWaterRate(e.target.value) : setElectricityRate(e.target.value)} readOnly={!isEditingRate} className={`w-full p-2 text-sm font-black font-mono border outline-none rounded-xl ${isEditingRate ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500/50 cursor-not-allowed'}`} />
                                            <button type="button" onClick={isEditingRate ? saveSettings : () => setIsEditingRate(true)} className={`px-4 text-xs font-black tracking-wider uppercase rounded-xl transition-all ${isEditingRate ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 hover:bg-slate-800 text-slate-300'}`}>{isEditingRate ? 'Commit' : 'Edit'}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TIMELINE METADATA RUN SELECTS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/20 p-4 border border-slate-800/60 rounded-xl">
                            <div>
                                <label className="block mb-1.5 text-[10px] font-black tracking-widest text-slate-500 uppercase"> Month</label>
                                <select name="billing_month" value={formData.billing_month} onChange={handleChange} className="w-full p-2.5 border outline-none bg-slate-900 border-slate-800 text-slate-200 text-xs font-bold rounded-xl cursor-pointer">
                                    {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1.5 text-[10px] font-black tracking-widest text-slate-500 uppercase"> Year </label>
                                <input type="number" name="billing_year" value={formData.billing_year} onChange={handleChange} required className="w-full p-2 text-sm font-mono border outline-none bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-[10px] font-black tracking-widest text-slate-500 uppercase">Due Date</label>
                                <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required className="w-full p-2 text-xs font-mono font-bold border outline-none bg-slate-900 border-slate-800 text-slate-200 rounded-xl cursor-pointer [color-scheme:dark] focus:border-cyan-500" />
                            </div>
                        </div>

                        {/* HIGH CANVAS VARIABLE METER GRID MATRIX VIEWROW */}
                        {isVariable && (
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                                <label className="block text-xs font-black tracking-widest text-cyan-400 uppercase">Consumption Ledger Log Matrix</label>
                                {fetchingFlats ? (
                                    <div className="text-center py-6 text-slate-500 font-mono text-xs animate-pulse">Querying complex units map registries...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {occupiedFlats.map((flat) => {
                                            const units = parseFloat(variableUnits[flat.id] || 0);
                                            const cost = (units * getActiveRate()).toFixed(2);
                                            return (
                                                <div key={flat.id} className="p-3 bg-slate-950/30 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs font-black text-slate-200 block truncate">{flat.block_name} - Unit {flat.name}</span>
                                                    </div>
                                                    <input type="number" placeholder="Units" value={variableUnits[flat.id] || ''} onChange={(e) => handleVariableUnitChange(flat.id, e.target.value)} className="w-24 p-1.5 text-center text-xs font-mono border outline-none bg-slate-900 border-slate-700 text-slate-200 rounded-lg focus:border-cyan-500" />
                                                    <div className="text-right shrink-0">
                                                        <span className="text-sm font-black font-mono text-emerald-400">₹{cost}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-800/80">
                            <button type="submit" disabled={loading || fetchingFlats} className="w-full py-4 text-xs font-black tracking-widest text-slate-950 uppercase rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:opacity-95 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-30">
                                {loading ? 'Compiling Run Matrix...' : isVariable ? 'Execute Metered Allocation' : 'Execute Fixed Bulk Allocation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'LIST' && (
                <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                    {billsError && <div className="p-4 m-4 text-xs font-mono border rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400">{billsError}</div>}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-950/40 font-black">
                                    <th className="p-4">Flat </th>
                                    <th className="p-4">Resident</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Period Cycle</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Net Valuation</th>
                                    <th className="p-4 text-center">Lifecycle Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-slate-800/40 font-medium ${loadingBills ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                {billsList.length === 0 ? (
                                    <tr><td colSpan="7" className="p-12 text-center text-slate-500 italic font-mono">No historical ledger balances processed inside current parameter definitions.</td></tr>
                                ) : (
                                    billsList.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4 font-bold text-slate-200">{bill.block_name} — Flat {bill.flat_name}</td>
                                            <td className="p-4 text-slate-300">{bill.user_name || 'Registry Vacant'}</td>
                                            <td className="p-4 font-mono text-xs text-slate-400">{bill.bill_type}</td>
                                            <td className="p-4 text-slate-400 font-mono text-xs">{new Date(0, bill.billing_month - 1).toLocaleString('default', { month: 'short' })} {bill.billing_year}</td>
                                            <td className="p-4 text-slate-500 font-mono text-xs">{bill.due_date}</td>
                                            <td className="p-4 font-black font-mono text-slate-200">₹{bill.total_amount || bill.amount}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                    ${bill.status === 'PAID' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                      bill.status === 'OVERDUE' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                      'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {billsTotalPages > 1 && (
                        <div className="flex justify-between items-center p-5 border-t border-slate-800 bg-slate-950/40">
                            <button type="button" onClick={() => setBillsPage(p => Math.max(1, p - 1))} disabled={billsPage === 1} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">← Previous</button>
                            <span className="text-xs font-mono text-slate-500">Page {billsPage} of {billsTotalPages}</span>
                            <button type="button" onClick={() => setBillsPage(p => Math.min(billsTotalPages, p + 1))} disabled={billsPage === billsTotalPages} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">Next →</button>
                        </div>
                    )}
                </div>
            )}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        <button 
                            onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGenerateBills;