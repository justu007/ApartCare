

import React, { useState, useEffect } from 'react';
import { getPaymentReports } from '../../api/admin';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminPaymentReports = () => {
    const [reportData, setReportData] = useState({ summary: {}, transactions: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await getPaymentReports(startDate, endDate, statusFilter);
            setReportData(data);
            setCurrentPage(1); 
        } catch (err) {
            setError("Failed to load payment reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const transactions = reportData.transactions || [];
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Community Payment Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Date", "Resident", "Flat", "Type", "Amount", "Status"];
        const tableRows = [];
        reportData.transactions.forEach(tx => {
            tableRows.push([tx.date, tx.resident_name, tx.flat_number, tx.bill_type, `Rs ${tx.amount}`, tx.status]);
        });

        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: 28, styles: { fontSize: 8 }, headStyles: { fillColor: [6, 182, 212] } 
        });
        doc.save("Payment_Report.pdf");
    };

    const exportToExcel = () => {
        const excelData = reportData.transactions.map(tx => ({
            "Date": tx.date, "Resident Name": tx.resident_name, "Flat Number": tx.flat_number, "Bill Type": tx.bill_type, "Amount (INR)": tx.amount, "Status": tx.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "Payment_Report.xlsx");
    };

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-5">
                <div>
                    <Link to="/admin/dashboard" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono block mb-2">← Back to Console</Link>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">Financial Ledger Audit Reports</h1>
                    <p className="mt-1 text-xs text-slate-400 font-sans">Apply advanced timeline parameters to audit community financial transactions.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button onClick={exportToExcel} disabled={!transactions.length} className="px-4 py-2 bg-slate-900 border border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-400 text-xs font-black tracking-wider uppercase rounded-xl transition-all disabled:opacity-25">📊 Export to Excel</button>
                    <button onClick={exportToPDF} disabled={!transactions.length} className="px-4 py-2 bg-slate-900 border border-rose-500/20 hover:bg-rose-500/5 text-rose-400 text-xs font-black tracking-wider uppercase rounded-xl transition-all disabled:opacity-25">📄 Export PDF Log</button>
                </div>
            </div>

            {/* FILTER PANEL ROW CONTAINER CONTAINER BOX */}
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1.5">Start Date Parameter</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:border-cyan-500 outline-none [color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1.5">End Date Parameter</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:border-cyan-500 outline-none [color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1.5">Lifecycle State Filter</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-xs font-bold uppercase tracking-wide focus:border-cyan-500 outline-none cursor-pointer">
                            <option value="ALL">All Ledger Statuses</option><option value="PAID">Paid Only</option><option value="PENDING">Pending Only</option><option value="OVERDUE">Overdue Only</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchReports} className="flex-1 py-2.5 bg-cyan-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl hover:bg-cyan-400 transition-all shadow-md">Apply Run</button>
                        <button onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('ALL'); fetchReports(); }} className="px-4 py-2.5 bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all border border-slate-700">Clear</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs animate-pulse">Running data validation cross-checks...</div>
            ) : error ? (
                <div className="text-center py-10 text-rose-400 font-mono text-xs font-bold">{error}</div>
            ) : (
                <>
                    {/* METRIC SUMMARY BOARDS HIGHLIGHT TILES */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="p-5 bg-slate-900/40 border border-slate-800 border-t-4 border-t-blue-500 rounded-2xl shadow-lg">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aggregated Query Range Volume</h4>
                            <p className="mt-1 text-2xl font-black text-slate-200 font-mono">{formatCurrency(reportData.summary.total_queried)}</p>
                            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Compiled from {reportData.summary.transaction_count} ledger rows</span>
                        </div>
                        <div className="p-5 bg-slate-900/40 border border-slate-800 border-t-4 border-t-emerald-500 rounded-2xl shadow-lg">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cleared Cash Liquidity</h4>
                            <p className="mt-1 text-2xl font-black text-emerald-400 font-mono">{formatCurrency(reportData.summary.total_paid)}</p>
                        </div>
                        <div className="p-5 bg-slate-900/40 border border-slate-800 border-t-4 border-t-amber-500 rounded-2xl shadow-lg">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unsettled Outstanding Dues</h4>
                            <p className="mt-1 text-2xl font-black text-amber-400 font-mono">{formatCurrency(reportData.summary.total_pending)}</p>
                        </div>
                    </div>

                    {/* REGISTRY LEDGER TRANSACTIONS TABLE */}
                    <div className="border border-slate-800 shadow-2xl bg-slate-900/30 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
                                        <th className="p-4">Clearing Date</th>
                                        <th className="p-4">Resident Account / Unit Flat</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4 text-right">Net Value</th>
                                        <th className="p-4 text-center">Transfer State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 font-medium">
                                    {paginatedTransactions.length > 0 ? paginatedTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4 text-slate-400 font-mono text-xs">{tx.date}</td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-200 text-sm">{tx.resident_name}</p>
                                                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{tx.flat_number}</span>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-slate-400">{tx.bill_type}</td>
                                            <td className="p-4 text-right font-black font-mono text-slate-200">{formatCurrency(tx.amount)}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                    ${tx.status === 'PAID' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                                      tx.status === 'OVERDUE' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                                                      'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-mono italic">No transaction rows captured in this filter criteria layer.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center p-4 border-t border-slate-800 bg-slate-950/40">
                                <span className="text-xs text-slate-500 font-mono">Row Index {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} of {transactions.length} entries</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">← Prev</button>
                                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">Next →</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPaymentReports;