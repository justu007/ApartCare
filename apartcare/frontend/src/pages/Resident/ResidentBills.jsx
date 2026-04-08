import React, { useEffect, useState } from 'react';
import { getResidentBills, createRazorpayOrder, verifyRazorpayPayment } from '../../api/user';

const ResidentBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); 
    const [error, setError] = useState('');

    useEffect(() => { 
        fetchBills(); 
        loadRazorpayScript();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const data = await getResidentBills();
            setBills(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            setError("Failed to load your bills.");
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (bill) => {
        setProcessingId(bill.id);
        setError('');
        
        try {
            const orderData = await createRazorpayOrder(bill.id);

            const options = {
                key: orderData.key, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ApartCare Community",
                description: `Payment for ${bill.bill_type} - Month ${bill.billing_month}`,
                order_id: orderData.razorpay_order_id,
                
                handler: async function (response) {
                    try {
                        await verifyRazorpayPayment({
                            bill_id: bill.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        
                        alert(`Successfully paid ₹${bill.total_amount}!`);
                        fetchBills(); 
                        
                    } catch (verifyErr) {
                        alert("Payment verification failed. Please contact admin.");
                    }
                },
                prefill: {
                    name: orderData.name,
                    email: orderData.email,
                },
                theme: {
                    color: "#06b6d4" 
                }
            };

           
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function (response) {
                alert("Payment failed: " + response.error.description);
            });
            
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.error || "Failed to initiate payment gateway.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">My Financials</h1>
                <p className="mt-2 text-slate-400">View and pay your community maintenance and utility bills securely via Razorpay.</p>
            </div>

            {error && <div className="p-4 mb-6 border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

            <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-5 font-bold">Billing Month</th>
                                <th className="p-5 font-bold">Type</th>
                                <th className="p-5 font-bold">Due Date</th>
                                <th className="p-5 font-bold">Amount</th>
                                <th className="p-5 font-bold text-center">Status</th>
                                <th className="p-5 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">Loading your bills...</td></tr>
                            ) : bills.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">No bills generated for your flat yet.</td></tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-5 font-bold text-slate-200">
                                            Month {bill.billing_month}, {bill.billing_year}
                                        </td>
                                        <td className="p-5 text-sm font-medium text-slate-300">{bill.bill_type}</td>
                                        <td className="p-5 text-sm text-slate-400">{bill.due_date}</td>
                                        <td className="p-5">
                                            <span className="font-bold text-slate-200">₹{bill.total_amount}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
                                                ${bill.status === 'PAID' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                  bill.status === 'OVERDUE' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                  'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            {bill.status !== 'PAID' ? (
                                                <button 
                                                    onClick={() => handlePayment(bill)}
                                                    disabled={processingId === bill.id}
                                                    className="px-5 py-2 text-xs font-bold text-white transition-all duration-300 transform rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                                >
                                                    {processingId === bill.id ? 'Connecting...' : 'Pay via Razorpay'}
                                                </button>
                                            ) : (
                                                <span className="px-4 py-2 text-xs font-bold text-slate-500">Settled</span>
                                            )}
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

export default ResidentBills;