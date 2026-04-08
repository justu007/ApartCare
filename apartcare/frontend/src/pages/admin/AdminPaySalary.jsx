import React, { useState, useEffect } from 'react';
import { payStaffSalary, getStaff } from '../../api/admin'; 
const AdminPaySalary = () => {
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

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await getStaff(1, 100); 
                
                const staffArray = response.data || []; 
                
                setStaffList(staffArray);
            } catch (err) {
                console.error("Failed to load staff", err);
                setError("Failed to load staff directory.");
            } finally {
                setLoadingStaff(false);
            }
        };
        fetchStaff();
    }, []);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); 
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setError(''); 
        setResult(null);

        try {
            const payload = {
                staff_id: parseInt(formData.staff_id),
                month: parseInt(formData.month),
                year: parseInt(formData.year),
                transaction_id: formData.transaction_id || 'MANUAL_CASH/UPI'
            };

            const data = await payStaffSalary(payload);
            setResult(data);
            
            setFormData({ ...formData, staff_id: '', transaction_id: '' }); 

        } catch (err) {
            setError(err.response?.data?.error || "Failed to process salary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Log Staff Salary
                </h1>
                <p className="mt-2 text-slate-400">Record external salary payouts to automatically generate staff payslips.</p>
            </div>

            <div className="p-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* --- STAFF SELECTION DROPDOWN --- */}
                        <div className="sm:col-span-2">
                            <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Select Staff Member</label>
                            <select 
                                name="staff_id" 
                                value={formData.staff_id} 
                                onChange={handleChange}
                                required
                                disabled={loadingStaff}
                                className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
                            >
                                <option value="" disabled>
                                    {loadingStaff ? "Loading staff directory..." : "-- Select Staff --"}
                                </option>
                                
                                {/* Now we map the unfiltered array and show their designation! */}
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
                            <select name="month" value={formData.month} onChange={handleChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 cursor-pointer">
                                {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Year</label>
                            <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
                        </div>

                        {/* --- TRANSACTION ID --- */}
                        <div className="sm:col-span-2">
                            <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Transaction ID / Ref (Optional)</label>
                            <input 
                                type="text" 
                                name="transaction_id" 
                                value={formData.transaction_id} 
                                onChange={handleChange}
                                placeholder="e.g. UPI_987654321 or CASH_HANDOVER"
                                className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 placeholder-slate-600"
                            />
                        </div>
                    </div>

                    {/* --- FEEDBACK MESSAGES --- */}
                    {error && <div className="p-4 border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}
                    {result && <div className="p-4 border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{result.message}</div>}

                    {/* --- SUBMIT BUTTON --- */}
                    <div className="pt-6 border-t border-slate-800">
                        <button type="submit" disabled={loading || !formData.staff_id} className="w-full py-4 font-black tracking-widest text-white uppercase transition-all duration-300 transform rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                            {loading ? 'Processing...' : 'Log Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPaySalary;