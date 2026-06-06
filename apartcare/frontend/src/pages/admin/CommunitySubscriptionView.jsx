import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import { getSaaSRates } from '../../api/superadmin';

const CommunitySubscriptionView = () => {
    const [rates, setRates] = useState({ monthly_rate: 0, yearly_rate: 0 });
    const [mySub, setMySub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🎯 NEW: Dynamic state handler for beautiful message windows
    const [uiNotification, setUiNotification] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const ratesData = await getSaaSRates();
                setRates(ratesData);

                const subRes = await axiosInstance.get('/webapp/community/my-subscription/');
                setMySub(subRes.data);
            } catch (err) {
                console.error("Error loading billing telemetry:", err);
                setError("Failed to fetch up-to-date billing matrix values.");
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    const handleSubscriptionPayment = async (planType) => {
        setCheckoutLoading(planType);
        setUiNotification({ type: '', text: '' }); // Clear old messages

        try {
            const orderRes = await axiosInstance.post('/webapp/community/create-saas-order/', { plan_type: planType });
            const { order_id, amount, currency } = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Sa7XssoYF3nKSn", 
                amount: order_id.amount,
                currency: currency,
                name: "ApartCare SaaS Systems",
                // 🎯 FIXED: Corrected template string interpolation from [₹{planType}]
                description: `SaaS Premium Licensing Node Upgrade [${planType}]`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axiosInstance.post('/webapp/community/verify-saas-payment/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_type: planType
                        });
                        
                        // 🎯 REPLACED ALERT: Render beautiful success banner
                        setUiNotification({
                            type: 'success',
                            text: verifyRes.data.message || "License activated successfully! Syncing configurations..."
                        });

                        // Automatically refresh window after showing the success state
                        setTimeout(() => {
                            window.location.reload(); 
                        }, 2500);

                    } catch (err) {
                        setUiNotification({
                            type: 'error',
                            text: "Verification signature processing rejected by authorization gateway."
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
            console.error(err);
            // 🎯 REPLACED ALERT: Render beautiful embedded error window
            setUiNotification({
                type: 'error',
                text: "Could not initialize payment transaction with checkout server routing configuration."
            });
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Synchronizing Tenancy Billing Nodes...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 text-slate-200 relative">
            {error && <div className="p-4 mb-6 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">{error}</div>}

            {/* 🎯 NEW: BEAUTIFUL EMBEDDED NOTIFICATION ALERTS STATUS WINDOW */}
            {uiNotification.text && (
                <div className={`p-4 mb-6 text-sm font-semibold border rounded-xl shadow-xl transition-all duration-300 transform animate-fade-in ${
                    uiNotification.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-950/20'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-lg">{uiNotification.type === 'success' ? '✅' : '❌'}</span>
                        <p>{uiNotification.text}</p>
                    </div>
                </div>
            )}

            {/* HEADER CURRENT ACTIVE STATUS TRACK CONTAINER */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-black text-white">Community Workspace Subscription</h2>
                </div>
                <div className="flex flex-col sm:items-end">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Account Strategy Type:</span>
                        {/* 🎯 FIXED: Corrected template string evaluation syntax error from 'border ₹{...}' */}
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            mySub?.plan_type === 'TRIAL' 
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        }`}>
                            {mySub?.plan_type === 'TRIAL' ? '⏳ Free Trial Period' : `👑 Premium ${mySub?.plan_type}`}
                        </span>
                    </div>
                    {/* Live active dynamic text counting metrics */}
                    <p className="text-xs font-mono text-slate-400 mt-2.5">
                        ⏳ Account Time Left: <span className="text-purple-400 font-bold text-sm">{mySub?.days_remaining} days remaining</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">Invoice Review Execution: {mySub?.next_bill}</p>
                </div>
            </div>

            {/* BILLING PRICING TIERS SELECTION ROW GRID CARD GRID */}
            <h3 className="text-lg font-black text-slate-100 mb-6 flex items-center gap-2">🛒 Renew or Upgrade License Tier</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* MONTHLY OPTION CHECKOUT TILE */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div>
                        <h4 className="text-lg font-bold text-purple-400">Monthly Billing Subscription</h4>
                        <h2 className="text-4xl font-black text-white my-8">₹{rates.monthly_rate?.toFixed(2)}<span className="text-xs text-slate-500 font-normal"> / month</span></h2>
                    </div>
                    <button 
                        type="button"
                        disabled={checkoutLoading}
                        onClick={() => handleSubscriptionPayment('MONTHLY')} 
                        className="w-full py-3.5 font-bold text-white transition-all rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                    >
                        {checkoutLoading === 'MONTHLY' ? 'Launching Checkout Box...' : 'Subscribe Monthly Track'}
                    </button>
                </div>

                {/* YEARLY OPTION CHECKOUT TILE */}
                <div className="p-6 bg-slate-900 border rounded-xl flex flex-col justify-between shadow-2xl relative overflow-hidden border-cyan-500/20 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/10">
                    <div className="absolute top-3 right-3 text-[9px] font-black tracking-widest bg-cyan-400 text-slate-950 px-2 py-0.5 rounded uppercase">
                        Save Massive Budget
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-cyan-400">Yearly Billing Subscription</h4>
                        <h2 className="text-4xl font-black text-white my-8">₹{rates.yearly_rate?.toFixed(2)}<span className="text-xs text-slate-500 font-normal"> / year</span></h2>
                    </div>
                    <button 
                        type="button"
                        disabled={checkoutLoading}
                        onClick={() => handleSubscriptionPayment('YEARLY')} 
                        className="w-full py-3.5 font-bold text-slate-950 transition-all rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 shadow-lg shadow-cyan-400/10"
                    >
                        {checkoutLoading === 'YEARLY' ? 'Launching Checkout Box...' : 'Subscribe Annual Track'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CommunitySubscriptionView;