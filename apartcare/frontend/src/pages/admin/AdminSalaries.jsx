import React, { useState, useEffect } from 'react';
import { getTransactionLedger, payStaffSalary, getStaff } from '../../api/admin'; 

const AdminFinanceHub = () => {
    // --- TAB STATE ---
    const [activeTab, setActiveTab] = useState('PAY_SALARY'); 

    // ==========================================
    // TAB 1 STATES & LOGIC (PAY SALARY)
    // ==========================================
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

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
                // Bulletproof extraction just in case global pagination hits this too
                const staffArray = response.results || response.data || response || []; 
                setStaffList(staffArray);
            } catch (err) {
                console.error("Failed to load staff", err);
                setPayError("Failed to load staff directory.");
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
            
            // Wipe the form fields for the next transaction
            setFormData({ ...formData, staff_id: '', transaction_id: '' }); 

        } catch (err) {
            setPayError(err.response?.data?.error || "Failed to process salary.");
        } finally {
            setPayLoading(false);
        }
    };

    // ==========================================
    // TAB 2 STATES & LOGIC (LEDGER)
    // ==========================================
    const [transactions, setTransactions] = useState([]);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [ledgerError, setLedgerError] = useState('');
    const [ledgerPage, setLedgerPage] = useState(1);
    const [ledgerTotalPages, setLedgerTotalPages] = useState(1);

    // Fetch Ledger when switching to LIST tab OR changing pages
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
            if (totalItems) {
                setLedgerTotalPages(Math.ceil(totalItems / 10));
            } else {
                setLedgerTotalPages(1);
            }
        } catch (err) {
            console.error("Ledger fetch error", err);
            setLedgerError("Failed to load transaction ledger.");
        } finally {
            setLoadingLedger(false);
        }
    };

    // ==========================================
    // RENDER UI
    // ==========================================
    return (
        <div className="max-w-7xl p-8 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                    Community Financials
                </h1>
                <p className="mt-2 text-slate-400">Disburse staff salaries and monitor the master transaction ledger.</p>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <div className="flex gap-4 mb-8 border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('PAY_SALARY')}
                    className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'PAY_SALARY' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Pay Staff Salaries
                    {activeTab === 'PAY_SALARY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('LEDGER')}
                    className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'LEDGER' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Master Ledger
                    {activeTab === 'LEDGER' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>}
                </button>
            </div>

            {/* ========================================= */}
            {/* TAB 1: PAY SALARIES                       */}
            {/* ========================================= */}
            {activeTab === 'PAY_SALARY' && (
                <div className="p-8 border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
                    <h2 className="mb-6 text-xl font-bold text-slate-200">Issue Salary Payments</h2>
                    
                    <form onSubmit={handlePaySubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* --- STAFF SELECTION DROPDOWN --- */}
                            <div className="sm:col-span-2">
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Select Staff Member</label>
                                <select 
                                    name="staff_id" 
                                    value={formData.staff_id} 
                                    onChange={handlePayChange}
                                    required
                                    disabled={loadingStaff}
                                    className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                                >
                                    <option value="" disabled>
                                        {loadingStaff ? "Loading staff directory..." : "-- Select Staff --"}
                                    </option>
                                    
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.name} — {staff.designation || 'Staff'} 
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* --- MONTH & YEAR --- */}
                            <div>
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Month</label>
                                <select name="month" value={formData.month} onChange={handlePayChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                                    {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Year</label>
                                <input type="number" name="year" value={formData.year} onChange={handlePayChange} required className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>

                            {/* --- TRANSACTION ID --- */}
                            <div className="sm:col-span-2">
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Transaction ID / Ref (Optional)</label>
                                <input 
                                    type="text" 
                                    name="transaction_id" 
                                    value={formData.transaction_id} 
                                    onChange={handlePayChange}
                                    placeholder="e.g. UPI_987654321 or CASH_HANDOVER"
                                    className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 placeholder-slate-600"
                                />
                            </div>
                        </div>

                        {/* --- FEEDBACK MESSAGES --- */}
                        {payError && <div className="p-4 border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{payError}</div>}
                        {payResult && <div className="p-4 border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{payResult.message}</div>}

                        {/* --- SUBMIT BUTTON --- */}
                        <div className="pt-6 border-t border-slate-800">
                            <button type="submit" disabled={payLoading || !formData.staff_id} className="w-full py-4 font-black tracking-widest text-slate-900 uppercase transition-all duration-300 transform rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                                {payLoading ? 'Processing...' : 'Log Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 2: MASTER LEDGER                      */}
            {/* ========================================= */}
            {activeTab === 'LEDGER' && (
                <div className="overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
                    {ledgerError && <div className="p-4 m-6 border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{ledgerError}</div>}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                    <th className="p-5 font-bold">Txn ID</th>
                                    <th className="p-5 font-bold">Date & Time</th>
                                    <th className="p-5 font-bold">Type</th>
                                    <th className="p-5 font-bold">Payer</th>
                                    <th className="p-5 font-bold">Payee</th>
                                    <th className="p-5 font-bold text-right">Amount</th>
                                    <th className="p-5 font-bold text-center">Status</th>
                                </tr>
                            </thead>
                            
                            <tbody className={`divide-y divide-slate-800/50 transition-opacity duration-300 ${loadingLedger ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                {transactions.length === 0 && loadingLedger ? (
                                    <tr><td colSpan={7} className="p-10 text-center text-slate-500">Loading ledger data...</td></tr>
                                ) : transactions.length === 0 && !loadingLedger ? (
                                    <tr><td colSpan={7} className="p-10 text-center text-slate-500">No transactions recorded in the community yet.</td></tr>
                                ) : (
                                    transactions.map((txn) => {
                                        const isMoneyIn = txn.purpose === 'BILL_PAYMENT' || txn.purpose === 'MAINTENANCE';
                                        
                                        return (
                                            <tr key={txn.id} className="transition-colors hover:bg-slate-800/40">
                                                <td className="p-5 text-sm text-slate-500">#{txn.id}</td>
                                                <td className="p-5 text-sm text-slate-400">
                                                    {new Date(txn.created_at).toLocaleDateString()} <br/>
                                                    <span className="text-xs text-slate-500">{new Date(txn.created_at).toLocaleTimeString()}</span>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-2 py-1 text-[10px] font-bold tracking-wider uppercase rounded border
                                                        ${isMoneyIn ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                        {txn.purpose.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-sm font-medium text-slate-300">{txn.payer_name || 'System'}</td>
                                                <td className="p-5 text-sm font-medium text-slate-300">{txn.payee_name || 'System'}</td>
                                                <td className="p-5 text-right">
                                                    <span className={`font-black text-lg ${isMoneyIn ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {isMoneyIn ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
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

                    {ledgerTotalPages > 1 && (
                        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-900/50">
                            <button 
                                onClick={() => setLedgerPage(p => Math.max(1, p - 1))} 
                                disabled={ledgerPage === 1} 
                                className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30"
                            >
                                Previous
                            </button>
                            <span className="text-sm font-medium text-slate-400">
                                Page <span className="text-slate-200">{ledgerPage}</span> of {ledgerTotalPages}
                            </span>
                            <button 
                                onClick={() => setLedgerPage(p => Math.min(ledgerTotalPages, p + 1))} 
                                disabled={ledgerPage === ledgerTotalPages} 
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

export default AdminFinanceHub;