


import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import { getSaaSRates } from '../../api/superadmin';
import { useSelector } from 'react-redux';
const CommunitySubscriptionView = () => {

    const { user } = useSelector((state) => state.auth);
    const [rates, setRates] = useState({ monthly_rate: 0, yearly_rate: 0 });
    const [mySub, setMySub] = useState(null);
    // const [userRole, setUserRole] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState(null);
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const [uiNotification, setUiNotification] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadPageData = async () => {
            try {
                if (user?.role === 'ADMIN' || user?.role === 'COMMUNITY_ADMIN') {
                    try {
                        const ratesData = await getSaaSRates();
                        setRates(ratesData);
                    } catch (rateErr) {
                        console.warn("Could not load SaaS rates (non-admin or rate endpoint unavailable):", rateErr);
                    }
                }
                const subRes = await axiosInstance.get('/webapp/community/my-subscription/');
                setMySub(subRes.data);
                 
            } catch (err) {
                console.error("Error loading subscription data:", err);
                setError("Failed to fetch up-to-date subscription matrix values.");
                setPopup({
                    isOpen: true,
                    status: 'error',
                    message: err.response?.data?.error || err.response?.data?.detail || "Error loading billing information."
                });
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    
    const handleSubscriptionPayment = async (planType) => {
        const isCurrentlyActive = (mySub?.days_remaining > 0) && (mySub?.status === 'ACTIVE');

        if (isCurrentlyActive) {
            if (mySub?.plan_type === planType) {
                setUiNotification({
                    type: 'error',
                    text: `Your ${planType.toLowerCase()} subscription is still active (${mySub.days_remaining} days left). You can renew once it expires.`
                });
                return;
            }

            if (mySub?.plan_type === 'YEARLY' && planType === 'MONTHLY') {
                setUiNotification({
                    type: 'error',
                    text: 'You already have an active Yearly license.'
                });
                return;
            }
        }

        setCheckoutLoading(planType);
        setUiNotification({ type: '', text: '' });

        try {
            const orderRes = await axiosInstance.post('/webapp/community/create-saas-order/', { 
                plan_type: planType 
            });

            const { order_id, amount, currency } = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SzUCexP731jTut",
                amount: amount,
                currency: currency,
                name: "ApartCare SaaS Systems",
                description: `SaaS License Renewal/Upgrade [${planType}]`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axiosInstance.post('/webapp/community/verify-saas-payment/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_type: planType
                        });

                        setUiNotification({
                            type: 'success',
                            text: verifyRes.data.message || "Subscription activated successfully! Refreshing..."
                        });

                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);

                    } catch (err) {
                        setUiNotification({
                            type: 'error',
                            text: "Payment verification failed. Please contact support."
                        });
                    }
                },
                prefill: {
                    email: mySub?.admin_email || "",
                },
                theme: { color: "#8B5CF6" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Razorpay setup initialization crash trace:", err);
            setUiNotification({
                type: 'error',
                text: err.response?.data?.error || "Could not initialize checkout. Please check server logs."
            });
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-xl font-bold font-mono text-cyan-400 animate-pulse">
                    Synchronizing Community Subscription Details...
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMUNITY_ADMIN';

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 text-slate-200 relative">
            {error && (
                <div className="p-4 mb-6 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                    {error}
                </div>
            )}

            {uiNotification.text && (
                <div className={`p-4 mb-6 text-sm font-semibold border rounded-xl shadow-xl transition-all duration-300 animate-fade-in ${
                    uiNotification.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-950/20'
                }`}>
                    <div className="flex items-center gap-3">
                        <span>{uiNotification.type === 'success' ? '✅' : '❌'}</span>
                        <p>{uiNotification.text}</p>
                    </div>
                </div>
            )}

            {/* --- PLAN STATUS CARD --- */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white">{mySub?.community_name || 'Community'} Workspace</h2>
                    <p className="text-xs text-slate-400 mt-1">Platform Subscription & Resource Management</p>
                </div>
                <div className="flex flex-col sm:items-end">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Current Plan:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            mySub?.plan_type === 'TRIAL' 
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        }`}>
                            {mySub?.plan_type === 'TRIAL' ? '⏳ Free Trial Period' : `👑 ${mySub?.plan_type_display || mySub?.plan_type}`}
                        </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-2.5">
                        ⏳ Validity: <span className="text-purple-400 font-bold text-sm">{mySub?.days_remaining ?? 0} days remaining</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">Next Renewal Date: {mySub?.next_bill || 'N/A'}</p>
                </div>
            </div>

            {/* --- BILLING TIERS / RENEWAL (Admins Only) --- */}
            {isAdmin &&  (
                <div className="mb-12">
                    <h3 className="text-lg font-black text-slate-100 mb-6 flex items-center gap-2">
                        🛒 Renew or Upgrade License Tier
                    </h3>
                    
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* MONTHLY TILE */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between shadow-lg">
                            <div>
                                <h4 className="text-lg font-bold text-purple-400">Monthly Subscription</h4>
                                <h2 className="text-4xl font-black text-white my-6">
                                    ₹{rates.monthly_rate?.toFixed(2) || '0.00'}
                                    <span className="text-xs text-slate-500 font-normal"> / month</span>
                                </h2>
                            </div>
                            <button 
                                type="button"
                                disabled={checkoutLoading}
                                onClick={() => handleSubscriptionPayment('MONTHLY')} 
                                className="w-full py-3.5 font-bold text-white transition-all rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                            >
                                {checkoutLoading === 'MONTHLY' ? 'Launching Checkout...' : 'Subscribe Monthly'}
                            </button>
                        </div>

                        {/* YEARLY TILE */}
                        <div className="p-6 bg-slate-900 border rounded-xl flex flex-col justify-between shadow-2xl relative overflow-hidden border-cyan-500/20 bg-gradient-to-b from-slate-900 to-cyan-950/10">
                            <div className="absolute top-3 right-3 text-[9px] font-black tracking-widest bg-cyan-400 text-slate-950 px-2 py-0.5 rounded uppercase">
                                Best Value
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-cyan-400">Yearly Subscription</h4>
                                <h2 className="text-4xl font-black text-white my-6">
                                    ₹{rates.yearly_rate?.toFixed(2) || '0.00'}
                                    <span className="text-xs text-slate-500 font-normal"> / year</span>
                                </h2>
                            </div>
                            <button 
                                type="button"
                                disabled={checkoutLoading}
                                onClick={() => handleSubscriptionPayment('YEARLY')} 
                                className="w-full py-3.5 font-bold text-slate-950 transition-all rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 shadow-lg shadow-cyan-400/10"
                            >
                                {checkoutLoading === 'YEARLY' ? 'Launching Checkout...' : 'Subscribe Yearly'}
                            </button>
                        </div>
                    </div>
                                  
                </div>
            )}

            {/* --- INVOICE HISTORY TABLE --- */}
            <div className="mt-8">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            📄 Subscription Invoices & Receipts
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Official billing statements and transaction records for this community workspace.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 px-3 py-1 bg-slate-800 rounded-lg">
                        Total Records: {mySub?.invoices?.length || 0}
                    </span>
                </div>

                {(!mySub?.invoices || mySub.invoices.length === 0) ? (
                    <div className="p-8 text-center bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                        <p className="text-sm text-slate-400 font-medium">No past invoice receipts generated yet.</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Payment invoices will appear here once a billing cycle or subscription upgrade is completed.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 text-xs uppercase font-mono tracking-wider">
                                    <th className="py-4 px-6">Invoice #</th>
                                    <th className="py-4 px-6">Date</th>
                                    <th className="py-4 px-6">Amount</th>
                                    <th className="py-4 px-6">Transaction ID</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                                {mySub.invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-6 font-bold text-cyan-400">
                                            {inv.invoice_number}
                                        </td>
                                        <td className="py-4 px-6 text-slate-300">
                                            {new Date(inv.payment_date).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-white">
                                            ₹{parseFloat(inv.amount_paid).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-slate-400 truncate max-w-[160px]" title={inv.transaction_id}>
                                            {inv.transaction_id}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                                                inv.status === 'SUCCESS'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedInvoice(inv)}
                                                className="px-3.5 py-1.5 font-sans text-xs font-bold rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all duration-200"
                                            >
                                                View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- INVOICE PRINTABLE MODAL --- */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-8 overflow-hidden text-slate-200">
                        <div className="flex justify-between items-start pb-6 border-b border-slate-800">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    ApartCare <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-normal">SaaS Receipt</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1 font-mono">ApartCare Cloud Property Management</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs uppercase font-mono text-slate-400">Invoice Identifier</span>
                                <p className="text-base font-black text-cyan-400 font-mono">{selectedInvoice.invoice_number}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 my-6 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium mb-1">Billed To (Community):</span>
                                <p className="text-sm font-bold text-white">{mySub?.community_name || 'ApartCare Community'}</p>
                                <p className="text-slate-400 mt-0.5">{mySub?.admin_email || 'Workspace Admin'}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-400 block font-medium mb-1">Payment Confirmation:</span>
                                <p className="font-mono text-slate-300">
                                    Date: {new Date(selectedInvoice.payment_date).toLocaleString('en-IN', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </p>
                                <p className="font-mono text-slate-400 mt-0.5 truncate" title={selectedInvoice.transaction_id}>
                                    Txn Ref: {selectedInvoice.transaction_id}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 overflow-hidden mb-6">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-slate-800/60 text-slate-400 uppercase">
                                    <tr>
                                        <th className="p-3">Description</th>
                                        <th className="p-3 text-center">Plan Tier</th>
                                        <th className="p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    <tr>
                                        <td className="p-3">
                                            <span className="font-bold text-white block">Community Workspace Subscription</span>
                                            <span className="text-[11px] text-slate-400 font-sans">Full portal access & tenant management</span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded font-bold">
                                                {mySub?.plan_type_display || mySub?.plan_type || 'Active Tier'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-white">
                                            ₹{parseFloat(selectedInvoice.amount_paid).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-800 mb-6">
                            <div>
                                <span className="text-[11px] font-mono uppercase text-slate-400 block">Payment Status</span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                    ✓ {selectedInvoice.status} (Settled)
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Paid</span>
                                <span className="text-2xl font-black text-white font-mono">
                                    ₹{parseFloat(selectedInvoice.amount_paid).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/10 flex items-center gap-1.5"
                            >
                                <span>🖨️ Print / Save PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NOTIFICATION POPUP MODAL --- */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${
                        popup.status === 'success' ? 'border-emerald-500/30' : 'border-rose-500/30'
                    }`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${
                            popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'
                        }`}>
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
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 rounded-xl ${
                                popup.status === 'success' 
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900' 
                                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'
                            }`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunitySubscriptionView;