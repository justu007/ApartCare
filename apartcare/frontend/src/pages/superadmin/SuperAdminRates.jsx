import React, { useEffect, useState } from 'react';
import { getSaaSRates, updateSaaSRates } from '../../api/superadmin';

const SuperAdminRates = () => {
    const [rates, setRates] = useState({ monthly_rate: '', yearly_rate: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        getSaaSRates().then(data => {
            setRates(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateSaaSRates(rates);
            setMessage(res.message);
        } catch (err) {
            setMessage("Failed to sync structural changes.");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Querying pricing tiers...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 border bg-slate-900 border-slate-800 rounded-2xl text-slate-200">
            <h2 className="text-2xl font-black text-white mb-2">Configure Global Subscription Rates</h2>
            <p className="text-xs text-slate-400 mb-6">Updates pricing information visible to all platform tenants.</p>

            {message && <div className="p-3 mb-5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">Monthly Tier Rate (₹)</label>
                        <input type="number" value={rates.monthly_rate} onChange={e => setRates({...rates, monthly_rate: e.target.value})} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">Yearly Tier Rate (₹)</label>
                        <input type="number" value={rates.yearly_rate} onChange={e => setRates({...rates, yearly_rate: e.target.value})} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold" />
                    </div>
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 font-bold rounded-xl text-white hover:opacity-90">{saving ? "Updating..." : "Deploy Rates Globally"}</button>
            </form>
        </div>
    );
};

export default SuperAdminRates;