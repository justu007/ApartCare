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

    useEffect(() => {
        fetchReports();
    }, []);

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
            const rowData = [
                tx.date, 
                tx.resident_name, 
                tx.flat_number, 
                tx.bill_type, 
                `Rs ${tx.amount}`, 
                tx.status
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [6, 182, 212] } 
        });

        doc.save("Payment_Report.pdf");
    };

    const exportToExcel = () => {
        const excelData = reportData.transactions.map(tx => ({
            "Date": tx.date,
            "Resident Name": tx.resident_name,
            "Flat Number": tx.flat_number,
            "Bill Type": tx.bill_type,
            "Amount (INR)": tx.amount,
            "Status": tx.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "Payment_Report.xlsx");
    };


    return (
        <div className="max-w-7xl p-6 mx-auto mt-8">
            {/* Header */}
            <div className="mb-8">
                <Link to="/admin/dashboard" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 mb-2 inline-block">← Back to Dashboard</Link>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Payment Reports</h1>
                <p className="mt-2 text-slate-400">Filter and analyze community financial transactions.</p>
            </div>

            {/* --- FILTERS SECTION --- */}
            <div className="p-6 mb-8 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">Start Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">End Date</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">Status</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PAID">Paid</option>
                            <option value="PENDING">Pending</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={fetchReports}
                            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors"
                        >
                            Apply Filters
                        </button>
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('ALL'); fetchReports(); }}
                            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-400">Loading reports...</div>
            ) : error ? (
                <div className="text-center py-10 text-rose-400">{error}</div>
            ) : (
                <>  <div className="flex justify-end gap-3 mb-4">
                        <button 
                            onClick={exportToExcel}
                            disabled={!reportData.transactions.length}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            📊 Export to Excel
                        </button>
                        <button 
                            onClick={exportToPDF}
                            disabled={!reportData.transactions.length}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            📄 Export to PDF
                        </button>
                    </div>


                    {/* --- SUMMARY CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-blue-500 rounded-xl">
                            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Total Filtered Amount</h3>
                            <p className="mt-2 text-3xl font-black text-slate-200">{formatCurrency(reportData.summary.total_queried)}</p>
                            <p className="mt-1 text-xs text-slate-500">Across {reportData.summary.transaction_count} transactions</p>
                        </div>
                        <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-emerald-500 rounded-xl">
                            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Total Paid</h3>
                            <p className="mt-2 text-3xl font-black text-emerald-400">{formatCurrency(reportData.summary.total_paid)}</p>
                        </div>
                        <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-amber-500 rounded-xl">
                            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Total Pending/Overdue</h3>
                            <p className="mt-2 text-3xl font-black text-amber-400">{formatCurrency(reportData.summary.total_pending)}</p>
                        </div>
                    </div>

                    {/* --- TRANSACTIONS TABLE --- */}
                    <div className="border shadow-lg bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-xs tracking-wider uppercase text-slate-500 bg-slate-900/50">
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold">Resident & Flat</th>
                                        <th className="p-4 font-semibold">Type</th>
                                        <th className="p-4 text-right font-semibold">Amount</th>
                                        <th className="p-4 text-center font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTransactions.length > 0 ? (
                                        paginatedTransactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                                                <td className="p-4 text-slate-300 text-sm">{tx.date}</td>
                                                <td className="p-4">
                                                    <p className="font-medium text-slate-200">{tx.resident_name}</p>
                                                    <p className="text-xs text-slate-500">{tx.flat_number}</p>
                                                </td>
                                                <td className="p-4 text-slate-300 text-sm">{tx.bill_type}</td>
                                                <td className="p-4 text-right font-semibold text-slate-200">{formatCurrency(tx.amount)}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                                                        tx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        tx.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400' :
                                                        'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500 italic">No transactions found for these filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center p-4 border-t border-slate-800 bg-slate-900/50">
                                <span className="text-xs text-slate-500">
                                    Showing <span className="font-semibold text-slate-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-slate-300">{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}</span> of <span className="font-semibold text-slate-300">{transactions.length}</span> entries
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                                    >
                                        ← Prev
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                                    >
                                        Next →
                                    </button>
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