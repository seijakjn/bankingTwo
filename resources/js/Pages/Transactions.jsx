import Layout from "./Layout";
import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, UserPlus, Send, TrendingDown, TrendingUp, Filter } from "lucide-react";

const TABS = ['Transfer', 'Deposit', 'Withdraw'];

export default function Transactions({ account, transactions, recentContacts }) {
    const [activeTab, setActiveTab] = useState('Transfer');
    const { flash } = usePage().props;

    const form = useForm({
        amount: '',
        target_account_number: '',
        reference: '',
    });

    const submit = (e) => {
        e.preventDefault();
        const routes = { Transfer: 'transfer', Deposit: 'deposit', Withdraw: 'withdraw' };
        form.post(`/transactions/${routes[activeTab]}`, { onSuccess: () => form.reset() });
    };

    const fillContact = (accountNumber) => {
        form.setData('target_account_number', accountNumber);
    };

    const txIcon = (type) => {
        const map = {
            deposit: { icon: <ArrowDownRight size={16} />, bg: 'bg-emerald/10 text-emerald' },
            transfer_in: { icon: <ArrowDownRight size={16} />, bg: 'bg-emerald/10 text-emerald' },
            withdraw: { icon: <ArrowUpRight size={16} />, bg: 'bg-red-50 text-red-500' },
            transfer_out: { icon: <ArrowUpRight size={16} />, bg: 'bg-red-50 text-red-500' },
        };
        return map[type] || { icon: <ArrowLeftRight size={16} />, bg: 'bg-slate-100 text-slate-500' };
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Transactions & Payments</h1>
                        <p className="text-slate mt-1">Move money securely across accounts.</p>
                    </div>
                    {account && (
                        <div className="bg-emerald/10 text-emerald px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-emerald/20">
                            <TrendingUp size={16} />
                            ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                </div>

                {/* Flash */}
                {flash?.success && <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-xl border border-emerald/20">{flash.success}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Action Panel */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Tabbed Form Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-100">
                                {TABS.map(tab => (
                                    <button key={tab} onClick={() => { setActiveTab(tab); form.clearErrors(); }}
                                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                                            activeTab === tab
                                                ? 'text-emerald border-b-2 border-emerald bg-slate-50/50'
                                                : 'text-slate hover:text-navy hover:bg-slate-50'
                                        }`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8">
                                {form.hasErrors && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm space-y-1 border border-red-100">
                                        {Object.values(form.errors).map((err, i) => <div key={i}>{err}</div>)}
                                    </div>
                                )}
                                <form onSubmit={submit} className="space-y-6">
                                    {activeTab === 'Transfer' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-widest text-slate">Recipient Account Number</label>
                                            <input
                                                type="text"
                                                value={form.data.target_account_number}
                                                onChange={e => form.setData('target_account_number', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all"
                                                placeholder="e.g. ACC12345678"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-widest text-slate">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate">$</span>
                                            <input
                                                type="number" step="0.01"
                                                value={form.data.amount}
                                                onChange={e => form.setData('amount', e.target.value)}
                                                className="w-full pl-9 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-2xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all"
                                                placeholder="0.00" required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-widest text-slate">Reference / Note (Optional)</label>
                                        <input
                                            type="text"
                                            value={form.data.reference}
                                            onChange={e => form.setData('reference', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all"
                                            placeholder="e.g. Monthly rent"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={form.processing}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald text-white font-bold rounded-xl hover:bg-emerald/90 transition-all shadow shadow-emerald/20 disabled:opacity-50 active:scale-[0.99]">
                                            <Send size={18} />
                                            {form.processing ? 'Processing...' : `Execute ${activeTab}`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Recent Contacts Bento */}
                        {activeTab === 'Transfer' && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate mb-3">Recent Contacts</p>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl flex flex-col items-center text-center gap-2 hover:shadow-md hover:border-emerald/20 transition-all cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald/10 flex items-center justify-center transition-colors">
                                            <UserPlus size={20} className="text-slate-400 group-hover:text-emerald" />
                                        </div>
                                        <span className="text-xs font-bold text-navy">New</span>
                                    </div>
                                    {recentContacts.map(contact => (
                                        <button key={contact.account_number}
                                            onClick={() => fillContact(contact.account_number)}
                                            className="p-4 bg-white border border-gray-100 rounded-2xl flex flex-col items-center text-center gap-2 hover:shadow-md hover:border-emerald/20 transition-all group">
                                            <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-lg group-hover:bg-navy group-hover:text-white transition-all">
                                                {(contact.name?.[0] || '?').toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-navy truncate w-full">{contact.name || 'Unknown'}</span>
                                        </button>
                                    ))}
                                    {recentContacts.length === 0 && (
                                        <div className="col-span-3 py-4 text-xs text-slate italic">No recent transfers yet.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: History */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-navy">Recent Activity</h3>
                                <span className="text-xs text-slate font-semibold uppercase tracking-widest">{transactions.length} records</span>
                            </div>
                            <div className="flex-1 divide-y divide-slate-50 overflow-y-auto max-h-[560px]">
                                {transactions.length > 0 ? transactions.map(tx => {
                                    const { icon, bg } = txIcon(tx.type);
                                    const isIncoming = ['deposit', 'transfer_in'].includes(tx.type);
                                    return (
                                        <div key={tx.id} className="p-5 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                                                {icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-navy capitalize truncate">{tx.reference || tx.type.replace('_', ' ')}</p>
                                                <p className="text-xs text-slate">{new Date(tx.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-bold ${isIncoming ? 'text-emerald' : 'text-navy'}`}>
                                                    {isIncoming ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-10 text-center text-slate italic text-sm">No transactions yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
