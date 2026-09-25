

import React, { useState, useEffect } from 'react';
import { getTransactionLedger, payStaffSalary, getStaff } from '../../api/admin'; 

const AdminFinanceHub = () => {
    const [activeTab, setActiveTab] = useState('PAY_SALARY'); 

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);

    const [formData, setFormData] = useState({
        staff_id: '',
        month: currentMonth,
        year: currentYear,
        transaction_id: ''
    });

    const [payLoading, setPayLoading] = useState(false);
    const [payResult, setPayResult] = useState(null);
    const [payError, setPayError] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await getStaff(1, 100); 
                const staffArray = response.results || response.data || response || []; 
                setStaffList(staffArray);
            } catch (err) {
                console.error("Failed to load staff", err);
                setPayError("Failed to load staff directory.");
                setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || err.response?.data?.detail || 'Failed to load your assigned tasks.'
            });
            } finally {
                setLoadingStaff(false);
            }
        };
        fetchStaff();
    }, []);

    const handlePayChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setPayError(''); 
        setPayResult(null);
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setPayLoading(true); 
        setPayError(''); 
        setPayResult(null);

        try {
            const payload = {
                staff_id: parseInt(formData.staff_id),
                month: parseInt(formData.month),
                year: parseInt(formData.year),
                transaction_id: formData.transaction_id || 'MANUAL_CASH/UPI'
            };

            const data = await payStaffSalary(payload);
            setPayResult(data);
            setFormData({ ...formData, staff_id: '', transaction_id: '' }); 
        } catch (err) {
            setPayError(err.response?.data?.error || "Failed to process salary.");
        } finally {
            setPayLoading(false);
        }
    };

    const [transactions, setTransactions] = useState([]);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [ledgerError, setLedgerError] = useState('');
    const [ledgerPage, setLedgerPage] = useState(1);
    const [ledgerTotalPages, setLedgerTotalPages] = useState(1);

    useEffect(() => {
        if (activeTab === 'LEDGER') {
            fetchLedger(ledgerPage);
        }
    }, [activeTab, ledgerPage]);

    const fetchLedger = async (page) => {
        setLoadingLedger(true);
        setLedgerError('');
        try {
            const response = await getTransactionLedger(page);
            const txnsArray = response.results || response.data || [];
            setTransactions(txnsArray);
            
            const totalItems = response.count || response.total || 0;
            setLedgerTotalPages(totalItems ? Math.ceil(totalItems / 10) : 1);
        } catch (err) {
            console.error("Ledger fetch error", err);
            setLedgerError("Failed to load transaction ledger.");
        } finally {
            setLoadingLedger(false);
        }
    };
    
    const calculateTotalBalance = () => {
        return transactions.reduce((total, txn) => {
            const amount = parseFloat(txn.amount);
            if (['BILL_PAYMENT', 'HALL_BOOKING', 'MAINTENANCE'].includes(txn.purpose)) {
                return total + amount;
            } 
            else if (txn.purpose === 'SALARY_PAYMENT') {
                return total - amount;
            }
            return total;
        }, 0);
    };  

    return (
        /* 🎯 ULTRA-WIDE HORIZONTAL CANVASES WRAPPER WITH EDGE GAPS */
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            
            {/* Main Header Descriptor Row */}
            <div className="border-b border-slate-800 pb-5">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 tracking-tight">
                    Community Financial Hub
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">Disburse verified staff payroll transactions and evaluate master account ledgers.</p>
            </div>

            {/* --- TABS NAVIGATION DESIGN OVERHAUL --- */}
            <div className="flex gap-4 border-b border-slate-800 bg-slate-950/20 p-1 rounded-t-xl">
                <button 
                    onClick={() => { setActiveTab('PAY_SALARY'); setLedgerPage(1); }}
                    className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'PAY_SALARY' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    💵 Payroll Disbursement
                    {activeTab === 'PAY_SALARY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>}
                </button>
                <button 
                    onClick={() => { setActiveTab('LEDGER'); setLedgerPage(1); }}
                    className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'LEDGER' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    🛡️ Master Transaction Ledger
                    {activeTab === 'LEDGER' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>}
                </button>
            </div>

            {/* ========================================= */}
            {/* TAB 1: PAY SALARIES GRID MODULE           */}
            {/* ========================================= */}
            {activeTab === 'PAY_SALARY' && (
                <div className="p-6 border border-slate-800/90 bg-slate-900/40 shadow-2xl rounded-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-500">Log Salary Disbursement</h2>
                    
                    <form onSubmit={handlePaySubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Staff Selector */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Destination Staff Personnel Profile</label>
                                <select 
                                    name="staff_id" 
                                    value={formData.staff_id} 
                                    onChange={handlePayChange}
                                    required
                                    disabled={loadingStaff}
                                    className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40 focus:border-emerald-500 transition-all"
                                >
                                    <option value="" disabled>
                                        {loadingStaff ? "Syncing database registry entries..." : "-- Select Recipient Staff Profile Token --"}
                                    </option>
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id} className="bg-slate-900 text-slate-200">
                                            {staff.name} — {staff.designation || 'General Staff'} 
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Select */}
                            <div>
                                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Target Period Month</label>
                                <select name="month" value={formData.month} onChange={handlePayChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 text-xs font-bold rounded-xl cursor-pointer focus:border-emerald-500 transition-all">
                                    {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1} className="bg-slate-900">{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
                                </select>
                            </div>

                            {/* Year Select */}
                            <div>
                                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Target Year Cycle</label>
                                <input type="number" name="year" value={formData.year} onChange={handlePayChange} required className="w-full p-3 text-xs font-mono font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-emerald-500 transition-all" />
                            </div>

                            {/* Reference Transaction Field */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Transaction Voucher Reference / Ref ID</label>
                                <input 
                                    type="text" 
                                    name="transaction_id" 
                                    value={formData.transaction_id} 
                                    onChange={handlePayChange}
                                    placeholder="e.g. UPI_IMPS_REFMETRIC_902 or CASH_DISBURSEMENT"
                                    className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl text-xs font-mono placeholder-slate-700 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Inline Warnings Window Blocks */}
                        {payError && <div className="p-3.5 border text-xs font-mono font-bold rounded-xl text-rose-400 bg-rose-500/5 border-rose-500/20 transform animate-fade-in">❌ CRITICAL RUNTIME REJECTION: {payError}</div>}
                        {payResult && <div className="p-3.5 border text-xs font-mono font-bold rounded-xl text-emerald-400 bg-emerald-500/5 border-emerald-500/20 transform animate-fade-in">✅ LEDGER BALANCED: {payResult.message}</div>}

                        <div className="pt-4 border-t border-slate-800/80">
                            <button type="submit" disabled={payLoading || !formData.staff_id} className="w-full py-4 text-xs font-black tracking-widest text-slate-950 uppercase rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-95 shadow-lg shadow-emerald-950/40 transition-all transform active:scale-[0.99] disabled:opacity-30">
                                {payLoading ? 'Authorizing Liquidity Transfer...' : 'Commit Financial Disbursement'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 2: MASTER LEDGER DATA TABLE SHEET     */}
            {/* ========================================= */}
            {activeTab === 'LEDGER' && (
                <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                    {ledgerError && <div className="p-4 m-4 text-xs font-mono border rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400">{ledgerError}</div>}
                    
                    {/* Floating Balance Status Top Strip */}
                    <div className="p-5 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Accumulated Complex Cash Flow</span>
                        <h2 className="text-2xl font-black font-mono text-emerald-400">₹{calculateTotalBalance().toLocaleString('en-IN')}</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
                                    <th className="p-4">Voucher ID</th>
                                    <th className="p-4">Clearing Date & Time</th>
                                    <th className="p-4">Transaction Strategy Type</th>
                                    <th className="p-4">Origin Payer</th>
                                    <th className="p-4">Destination Payee</th>
                                    <th className="p-4 text-right">Net Value</th>
                                    <th className="p-4 text-center">Settlement Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-slate-800/40 font-medium ${loadingLedger ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                {transactions.length === 0 && !loadingLedger ? (
                                    <tr><td colSpan="7" className="p-12 text-center text-slate-500 font-mono italic">No transaction entries processed inside current community ledger boundaries.</td></tr>
                                ) : (
                                    transactions.map((txn) => {
                                        const isIncome = ['BILL_PAYMENT', 'MAINTENANCE', 'HALL_BOOKING'].includes(txn.purpose);
                                        return (
                                            <tr key={txn.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="p-4 font-mono text-xs text-slate-500">#{txn.id}</td>
                                                <td className="p-4 text-xs font-mono text-slate-400">
                                                    {new Date(txn.created_at).toLocaleDateString()} <br/>
                                                    <span className="text-[10px] text-slate-500 mt-0.5 block">{new Date(txn.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded border inline-block
                                                        ${isIncome ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 'text-rose-400 bg-rose-500/5 border-rose-500/20'}`}>
                                                        {txn.purpose?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-300 font-bold">{txn.payer_name || 'Ecosystem System'}</td>
                                                <td className="p-4 text-slate-300 font-bold">{txn.payee_name || 'Ecosystem System'}</td>
                                                <td className="p-4 text-right font-black font-mono">
                                                    <span className={isIncome ? 'text-emerald-400' : 'text-rose-500'}>
                                                        {isIncome ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                        ${txn.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                          txn.status === 'FAILED' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                          'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Master Ledger Pagination Controls Layout */}
                    {ledgerTotalPages > 1 && (
                        <div className="flex justify-between items-center p-5 border-t border-slate-800 bg-slate-950/40">
                            <button 
                                type="button" 
                                onClick={() => setLedgerPage(p => Math.max(1, p - 1))} 
                                disabled={ledgerPage === 1} 
                                className="px-4 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg transition-all"
                            >
                                ← Previous Run
                            </button>
                            <span className="text-xs font-mono text-slate-500">
                                Ledger Page <span className="text-slate-300 font-bold">{ledgerPage}</span> of {ledgerTotalPages}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setLedgerPage(p => Math.min(ledgerTotalPages, p + 1))} 
                                disabled={ledgerPage === ledgerTotalPages} 
                                className="px-4 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg transition-all"
                            >
                                Next Run →
                            </button>
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

export default AdminFinanceHub;