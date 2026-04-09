

import React, { useState, useEffect } from 'react';
import { generateBills, getOccupiedFlats, getGeneratedBills } from '../../api/admin'; 

const AdminGenerateBills = () => {
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
    const [variableAmounts, setVariableAmounts] = useState({}); 
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

    useEffect(() => {
        if (isVariable && activeTab === 'CREATE') {
            fetchFlats(currentPage);
        }
    }, [isVariable, currentPage, activeTab]);

    useEffect(() => {
        if (activeTab === 'LIST') {
            fetchBillsHistory(billsPage);
        }
    }, [activeTab,billsPage]);

    const fetchFlats = async (page) => {
        setFetchingFlats(true);
        try {
            const response = await getOccupiedFlats(page);
            
            const flatsArray = response.results || response.data || [];
            setOccupiedFlats(flatsArray);
            
            const totalItems = response.count || response.total || 0;
            if (totalItems) {
                setTotalPages(Math.ceil(totalItems / 10));
            }
        } catch (err) {
            console.error("Failed to fetch flats", err);
        } finally {
            setFetchingFlats(false);
        }
    };


    const fetchBillsHistory = async (page) => {
        setLoadingBills(true);
        setBillsError('');
        try {
            const response = await getGeneratedBills(page); 
            
            setBillsList(response.data || []);
            
            if (response.total) {
                setBillsTotalPages(Math.ceil(response.total / response.limit));
            }
        } catch (err) {
            setBillsError("Failed to load billing history.");
        } finally {
            setLoadingBills(false);
        }
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); setResult(null); 
    };

    const handleVariableAmountChange = (flatId, value) => {
        setVariableAmounts(prev => ({ ...prev, [flatId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedMonth = parseInt(formData.billing_month);
        const selectedYear = parseInt(formData.billing_year);
        const now = new Date();
        const currentMonth = now.getMonth() + 1; 
        const currentYear = now.getFullYear();

        if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
            setError("You cannot generate bills for future months.");
            return; 
        }
        const dueDateObj = new Date(formData.due_date);
        const billingPeriodEnd = new Date(selectedYear, selectedMonth, 0); 

        if (dueDateObj <= billingPeriodEnd) {
            setError("Invalid Due Date: The due date must be in the month following the billing period (or later).");
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
                payload.flat_data = Object.keys(variableAmounts).map(flatId => ({
                    flat_id: parseInt(flatId),
                    amount: parseFloat(variableAmounts[flatId] || 0)
                }));
            } else {
                payload.amount = parseFloat(formData.amount);
            }

            const data = await generateBills(payload);
            setResult(data);
            
            if (!isVariable) setFormData(prev => ({ ...prev, amount: '' }));
            else setVariableAmounts({});

        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate bills.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl p-8 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Community Billing
                </h1>
                <p className="mt-2 text-slate-400">Generate new invoices or view previously generated bills.</p>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <div className="flex gap-4 mb-8 border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('CREATE')}
                    className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'CREATE' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Generate Bills
                    {activeTab === 'CREATE' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('LIST')}
                    className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'LIST' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Generated Bills
                    {activeTab === 'LIST' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>}
                </button>
            </div>

            {/* ========================================= */}
            {/* TAB 1: CREATE               */}
            {/* ========================================= */}
            {activeTab === 'CREATE' && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 animate-fade-in">
                    <div className="p-8 border shadow-2xl md:col-span-4 bg-slate-900 border-slate-800 rounded-3xl">
                        <div className="space-y-6">
                            {error && <div className="p-5 border shadow-lg bg-rose-500/10 border-rose-500/20 rounded-2xl"><h3 className="font-bold text-rose-400">Failed</h3><p className="mt-2 text-sm text-rose-300">{error}</p></div>}
                            {result && <div className="p-6 border shadow-lg bg-emerald-500/10 border-emerald-500/20 rounded-2xl"><h3 className="mb-4 font-bold text-emerald-400">Success!</h3><p className="text-sm text-emerald-300">{result.message}</p></div>}
                        </div>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Bill Type</label>
                                    <select name="bill_type" value={formData.bill_type} onChange={handleChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 cursor-pointer">
                                        <option value="MAINTENANCE">Maintenance (Fixed Amount)</option>
                                        <option value="WATER">Water Bill (Metered)</option>
                                        <option value="RENT">Rent </option>
                                        <option value="ELECTRICITY">Electricity Bill (Metered)</option>
                                    </select>
                                </div>

                                {!isVariable && (
                                    <div>
                                        <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Flat Amount (₹)</label>
                                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. 2500" required={!isVariable} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 placeholder-slate-600" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div>
                                    <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Month</label>
                                    <select name="billing_month" value={formData.billing_month} onChange={handleChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 cursor-pointer">
                                        {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Year</label>
                                    <input type="number" name="billing_year" value={formData.billing_year} onChange={handleChange} required className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Due Date</label>
                                    <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 cursor-pointer [color-scheme:dark]" />
                                </div>
                            </div>

                            {/* VARIABLE DATA ENTRY GRID */}
                            {isVariable && (
                                <div className="pt-4 border-t border-slate-800 animate-fade-in">
                                    <label className="block mb-4 text-sm font-bold tracking-wide text-cyan-500 uppercase">Enter Individual Readings/Amounts (₹)</label>
                                    {fetchingFlats ? (
                                        <div className="py-10 text-center text-slate-500">Loading flats...</div>
                                    ) : (
                                        <>
                                            <div className="pr-2 space-y-3 overflow-y-auto max-h-96 custom-scrollbar">
                                                {occupiedFlats.map((flat) => (
                                                    <div key={flat.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-800/50 border-slate-700">
                                                        <div><p className="font-bold text-slate-200">{flat.block_name} - Flat {flat.name}</p></div>
                                                        <div className="relative w-1/3">
                                                            <span className="absolute font-bold -translate-y-1/2 left-3 top-1/2 text-slate-500">₹</span>
                                                            <input type="number" placeholder="0.00" value={variableAmounts[flat.id] || ''} onChange={(e) => handleVariableAmountChange(flat.id, e.target.value)} className="w-full py-2 pl-8 pr-3 font-bold text-right transition-colors border outline-none bg-slate-900 border-slate-600 text-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                                {occupiedFlats.length === 0 && <div className="p-4 text-center border rounded-lg text-amber-400 bg-amber-500/10 border-amber-500/20">No occupied flats found.</div>}
                                            </div>

                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                                                    <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30">Previous</button>
                                                    <span className="text-sm font-medium text-slate-400">Page <span className="text-slate-200">{currentPage}</span> of {totalPages}</span>
                                                    <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30">Next</button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-800">
                                <button type="submit" disabled={loading || fetchingFlats} className="flex items-center justify-center w-full gap-2 py-4 font-black tracking-widest uppercase transition-all duration-300 transform border border-transparent text-slate-900 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                                    {loading ? 'Generating...' : isVariable ? 'Generate Metered Bills' : 'Bulk Generate Invoices'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 2: LIST                */}
            {/* ========================================= */}
            {activeTab === 'LIST' && (
                <div className="overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
                    {billsError && <div className="p-4 m-6 border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{billsError}</div>}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                    <th className="p-5 font-bold">Flat</th>
                                    <th className="p-5 font-bold"> Resident</th>
                                    <th className="p-5 font-bold">Bill Type</th>
                                    <th className="p-5 font-bold">Billing Period</th>
                                    <th className="p-5 font-bold">Due Date</th>
                                    <th className="p-5 font-bold">Amount</th>
                                    <th className="p-5 font-bold text-center">Status</th>
                                </tr>
                            </thead>

                            <tbody className={`divide-y divide-slate-800/50 transition-opacity duration-300 ${loadingBills ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                
                                {billsList.length === 0 && loadingBills ? (
                                    <tr><td colSpan={7} className="p-10 text-center text-slate-500">Loading billing history...</td></tr>
                                
                               ) : billsList.length === 0 && !loadingBills ? (
                                    <tr><td colSpan={7} className="p-10 text-center text-slate-500">No bills have been generated yet.</td></tr>
                                
                                ) : (
                                    billsList.map((bill) => (
                                        <tr key={bill.id} className="transition-colors hover:bg-slate-800/40">
                                            <td className="p-5 font-bold text-slate-200">
                                                {bill.block_name} - Flat {bill.flat_name}
                                            </td>
                                            <td className="p-5 text-sm text-slate-300">
                                                {bill.user_name || 'Unoccupied'}
                                            </td>
                                            <td className="p-5 text-sm text-slate-300">{bill.bill_type}</td>
                                            <td className="p-5 text-sm text-slate-400">
                                                {new Date(0, bill.billing_month - 1).toLocaleString('default', { month: 'short' })} {bill.billing_year}
                                            </td>
                                            <td className="p-5 text-sm text-slate-400">{bill.due_date}</td>
                                            <td className="p-5">
                                                <span className="font-bold text-slate-200">₹{bill.total_amount || bill.amount}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
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
                    <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-900/50">
                        <button 
                            type="button" 
                            onClick={() => setBillsPage(p => Math.max(1, p - 1))} 
                            disabled={billsPage === 1} 
                            className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-slate-400">
                            Page <span className="text-slate-200">{billsPage}</span> of {billsTotalPages}
                        </span>
                        <button 
                            type="button" 
                            onClick={() => setBillsPage(p => Math.min(billsTotalPages, p + 1))} 
                            disabled={billsPage === billsTotalPages} 
                            className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                )}
                </div>
            )}
        </div>
    );
};

export default AdminGenerateBills;