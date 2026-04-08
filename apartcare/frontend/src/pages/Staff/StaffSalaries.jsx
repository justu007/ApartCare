import React, { useEffect, useState } from 'react';
import { getStaffSalaries } from '../../api/user'; 

const StaffSalaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSalaries = async () => {
            try {
                const data = await getStaffSalaries();
                setSalaries(Array.isArray(data) ? data : (data.results || []));
            } catch (err) {
                setError("Failed to load your salary history.");
            } finally {
                setLoading(false);
            }
        };
        fetchSalaries();
    }, []);

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">My Payslips</h1>
                <p className="mt-2 text-slate-400">View your verified salary disbursements and transaction history.</p>
            </div>

            {error && <div className="p-4 mb-6 border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

            <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-5 font-bold">Month / Year</th>
                                <th className="p-5 font-bold">Amount</th>
                                <th className="p-5 font-bold">Transaction Ref</th>
                                <th className="p-5 font-bold">Paid On</th>
                                <th className="p-5 font-bold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-500">Loading your payslips...</td></tr>
                            ) : salaries.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-500">No salaries recorded yet.</td></tr>
                            ) : (
                                salaries.map((salary) => (
                                    <tr key={salary.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-5 font-bold text-slate-200">
                                            {new Date(0, salary.month - 1).toLocaleString('default', { month: 'long' })} {salary.year}
                                        </td>
                                        <td className="p-5">
                                            <span className="text-lg font-black text-emerald-400">₹{salary.amount}</span>
                                        </td>
                                        <td className="p-5 text-sm text-slate-400">
                                            {salary.transaction_id || 'N/A'}
                                        </td>
                                        <td className="p-5 text-sm text-slate-400">
                                            {salary.paid_at ? new Date(salary.paid_at).toLocaleDateString() : 'Pending'}
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className={`px-3 py-1.5 text-xs font-bold tracking-wider rounded border 
                                                ${salary.status === 'RECEIVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                {salary.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffSalaries;