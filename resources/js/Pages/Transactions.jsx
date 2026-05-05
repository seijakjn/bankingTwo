import Layout from "./Layout";
import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Transactions({ account, transactions }) {
    const [activeTab, setActiveTab] = useState('deposit');
    const { flash } = usePage().props;

    const form = useForm({
        amount: '',
        target_account_number: ''
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(`/transactions/${activeTab}`, {
            onSuccess: () => form.reset()
        });
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Transactions</h1>
                    <p className="text-slate mt-2">Manage your money transfers and deposits.</p>
                </header>

                {flash?.success && (
                    <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Action Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
                        <div className="flex space-x-2 mb-8 border-b border-gray-100 pb-4">
                            {['deposit', 'withdraw', 'transfer'].map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); form.clearErrors(); }}
                                    className={`px-4 py-2 font-semibold capitalize rounded-lg transition-colors ${activeTab === tab ? 'bg-navy text-white' : 'text-slate hover:bg-gray-50'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {form.hasErrors && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm space-y-1">
                                    {Object.values(form.errors).map((err, i) => <div key={i}>{err}</div>)}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-semibold text-navy mb-2">Amount ($)</label>
                                <input type="number" step="0.01" value={form.data.amount} onChange={e => form.setData('amount', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald transition-colors"
                                    placeholder="0.00" required />
                            </div>

                            {activeTab === 'transfer' && (
                                <div>
                                    <label className="block text-sm font-semibold text-navy mb-2">Target Account Number</label>
                                    <input type="text" value={form.data.target_account_number} onChange={e => form.setData('target_account_number', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald transition-colors"
                                        placeholder="ACC12345678" required />
                                </div>
                            )}

                            <button type="submit" disabled={form.processing}
                                className="w-full py-3 bg-emerald text-white font-bold rounded-lg hover:bg-emerald/90 transition-colors disabled:opacity-50">
                                {form.processing ? 'Processing...' : `Execute ${activeTab}`}
                            </button>
                        </form>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold text-navy mb-6">History</h2>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                            {transactions.map(tx => (
                                <div key={tx.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center hover:border-gray-300 transition-colors">
                                    <div>
                                        <p className="font-semibold text-navy capitalize">{tx.type.replace('_', ' ')}</p>
                                        <p className="text-xs text-slate">{new Date(tx.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className={`font-bold ${['deposit', 'transfer_in'].includes(tx.type) ? 'text-emerald' : 'text-navy'}`}>
                                        {['deposit', 'transfer_in'].includes(tx.type) ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && <p className="text-slate italic text-center mt-10">No transactions found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
