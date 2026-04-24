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
            
            setPopup({
                isOpen: true,
                status: 'success',
                message: 'Global Rates Updated Successfully!'
            });
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
        } finally {
            setLoadingBills(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear grid units and edit modes if they change the bill type
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

    // Helper to get the active rate based on dropdown selection
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
                const currentRate = getActiveRate();
                // 🎯 Transform UNITS to AMOUNT right before sending to backend
                payload.flat_data = Object.keys(variableUnits).map(flatId => {
                    const units = parseFloat(variableUnits[flatId] || 0);
                    return {
                        flat_id: parseInt(flatId),
                        amount: units * currentRate
                    };
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

            <div className="flex gap-4 mb-8 border-b border-slate-800">
                <button onClick={() => setActiveTab('CREATE')} className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'CREATE' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    Generate Bills
                    {activeTab === 'CREATE' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>}
                </button>
                <button onClick={() => setActiveTab('LIST')} className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'LIST' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    Generated Bills
                    {activeTab === 'LIST' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>}
                </button>
            </div>

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
                                        <option value="ELECTRICITY">Electricity Bill (Metered)</option>
                                        <option value="RENT">Rent </option>
                                    </select>
                                </div>

                                {/* FIXED BILLS (Maintenance or Rent) */}
                                {!isVariable && (
                                    <div className="animate-fade-in">
                                        <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">
                                            {formData.bill_type === 'MAINTENANCE' ? 'Global Maintenance Fee (₹)' : 'Flat Amount (₹)'}
                                        </label>

                                        {formData.bill_type === 'MAINTENANCE' ? (
                                            <div className="flex gap-3">
                                                <input 
                                                    type="number" value={maintenanceFee} onChange={(e) => setMaintenanceFee(e.target.value)} readOnly={!isEditingFee}
                                                    className={`w-full p-3 transition-colors border outline-none rounded-xl font-bold ${isEditingFee ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed'}`} 
                                                />
                                                {isEditingFee ? (
                                                    <button type="button" onClick={saveSettings} className="px-6 font-bold text-slate-900 transition-colors bg-emerald-400 hover:bg-emerald-300 rounded-xl">Save</button>
                                                ) : (
                                                    <button type="button" onClick={() => setIsEditingFee(true)} className="px-6 font-bold transition-colors border text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl">Edit</button>
                                                )}
                                            </div>
                                        ) : (
                                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. 2500" required className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 placeholder-slate-600" />
                                        )}
                                    </div>
                                )}

                                {/* 🎯 VARIABLE BILLS (Rate Setter for Water/EB) */}
                                {isVariable && (
                                    <div className="animate-fade-in">
                                        <label className="block mb-2 text-sm font-bold tracking-wide text-cyan-400 uppercase">
                                            {formData.bill_type === 'WATER' ? 'Global Water Rate (₹ per Litre)' : 'Global Electricity Rate (₹ per kWh)'}
                                        </label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="number" step="0.01"
                                                value={formData.bill_type === 'WATER' ? waterRate : electricityRate} 
                                                onChange={(e) => formData.bill_type === 'WATER' ? setWaterRate(e.target.value) : setElectricityRate(e.target.value)}
                                                readOnly={!isEditingRate}
                                                className={`w-full p-3 transition-colors border outline-none rounded-xl font-bold ${isEditingRate ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-cyan-500/50 cursor-not-allowed'}`} 
                                            />
                                            {isEditingRate ? (
                                                <button type="button" onClick={saveSettings} className="px-6 font-bold text-slate-900 transition-colors bg-emerald-400 hover:bg-emerald-300 rounded-xl">Save</button>
                                            ) : (
                                                <button type="button" onClick={() => setIsEditingRate(true)} className="px-6 font-bold transition-colors border text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl">Edit</button>
                                            )}
                                        </div>
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

                            {/* 🎯 VARIABLE DATA ENTRY GRID (Units & Live Amount) */}
                            {isVariable && (
                                <div className="pt-4 border-t border-slate-800 animate-fade-in">
                                    <label className="block mb-4 text-sm font-bold tracking-wide text-cyan-500 uppercase">
                                        Enter Meter Units for {formData.bill_type}
                                    </label>
                                    {fetchingFlats ? (
                                        <div className="py-10 text-center text-slate-500">Loading flats...</div>
                                    ) : (
                                        <>
                                            <div className="pr-2 space-y-3 overflow-y-auto max-h-96 custom-scrollbar">
                                                {occupiedFlats.map((flat) => {
                                                    // Live calculation logic
                                                    const unitsEntered = parseFloat(variableUnits[flat.id] || 0);
                                                    const calculatedAmount = (unitsEntered * getActiveRate()).toFixed(2);
                                                    
                                                    return (
                                                        <div key={flat.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-800/50 border-slate-700">
                                                            <div className="w-1/3"><p className="font-bold text-slate-200">{flat.block_name} - Flat {flat.name}</p></div>
                                                            
                                                            {/* Unit Input */}
                                                            <div className="w-1/3 px-4">
                                                                <input 
                                                                    type="number" 
                                                                    placeholder={`Units (${formData.bill_type === 'WATER' ? 'L' : 'kWh'})`} 
                                                                    value={variableUnits[flat.id] || ''} 
                                                                    onChange={(e) => handleVariableUnitChange(flat.id, e.target.value)} 
                                                                    className="w-full py-2 px-3 text-center transition-colors border outline-none bg-slate-900 border-slate-600 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" 
                                                                />
                                                            </div>
                                                            
                                                            {/* Live Calculated Amount */}
                                                            <div className="w-1/3 text-right">
                                                                <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Amount: </span>
                                                                <span className="text-xl font-black text-emerald-400">₹{calculatedAmount}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
                                            <td className="p-5 font-bold text-slate-200">{bill.block_name} - Flat {bill.flat_name}</td>
                                            <td className="p-5 text-sm text-slate-300">{bill.user_name || 'Unoccupied'}</td>
                                            <td className="p-5 text-sm text-slate-300">{bill.bill_type}</td>
                                            <td className="p-5 text-sm text-slate-400">{new Date(0, bill.billing_month - 1).toLocaleString('default', { month: 'short' })} {bill.billing_year}</td>
                                            <td className="p-5 text-sm text-slate-400">{bill.due_date}</td>
                                            <td className="p-5"><span className="font-bold text-slate-200">₹{bill.total_amount || bill.amount}</span></td>
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
                        <button type="button" onClick={() => setBillsPage(p => Math.max(1, p - 1))} disabled={billsPage === 1} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30">Previous</button>
                        <span className="text-sm font-medium text-slate-400">Page <span className="text-slate-200">{billsPage}</span> of {billsTotalPages}</span>
                        <button type="button" onClick={() => setBillsPage(p => Math.min(billsTotalPages, p + 1))} disabled={billsPage === billsTotalPages} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30">Next</button>
                    </div>
                )}
                </div>
            )}

            {/* --- 🎯 THE BEAUTIFUL NOTIFICATION POPUP MODAL --- */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 
                        ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}
                    `}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 
                            ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}
                        `}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        <button onClick={() => setPopup({ isOpen: false, status: '', message: '' })} className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5
                                ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}
                            `}>
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGenerateBills;