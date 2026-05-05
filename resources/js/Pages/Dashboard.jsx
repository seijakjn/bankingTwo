import Layout from "./Layout";
import { usePage, router } from "@inertiajs/react";
import { TrendingUp, CreditCard, FileText, ArrowDownRight, ArrowUpRight, Landmark, CheckCircle2, XCircle } from "lucide-react";

export default function Dashboard({ account, recentTransactions, activeLoans, interestTier }) {
    const { flash } = usePage().props;

    const tierColors = {
        Platinum: 'bg-purple-100 text-purple-700 border-purple-200',
        Gold: 'bg-amber-100 text-amber-700 border-amber-200',
        Silver: 'bg-slate-100 text-slate-600 border-slate-200',
        Standard: 'bg-gray-100 text-gray-500 border-gray-200',
    };

    const payOff = (loanId) => {
        if (confirm('Pay off this loan in full? The amount will be deducted from your account.')) {
            router.post(`/loans/${loanId}/payoff`);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Flash */}
                {flash?.success && <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-xl border border-emerald/20">{flash.success}</div>}
                {flash?.error && <div className="p-4 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200">{flash.error}</div>}

                {/* Header */}
                <header className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
                        <p className="text-slate mt-1">Your financial overview at a glance.</p>
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${tierColors[interestTier?.label] || tierColors.Standard}`}>
                        {interestTier?.label} · {interestTier?.apy} APY
                    </div>
                </header>

                {/* Balance + Account Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <p className="text-xs font-semibold tracking-widest uppercase text-slate mb-3">Total Balance</p>
                        <div className="text-5xl font-bold text-navy tracking-tight">
                            ${account ? parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </div>
                        <div className="mt-6 flex gap-3">
                            <a href="/transactions" className="px-5 py-2.5 bg-emerald text-white text-sm font-bold rounded-lg hover:bg-emerald/90 transition-colors shadow shadow-emerald/20">
                                Transfer Money
                            </a>
                            <a href="/loans" className="px-5 py-2.5 bg-white text-navy text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                Apply for Loan
                            </a>
                        </div>
                    </div>
                    <div className="bg-navy text-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full" />
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald/10 rounded-full" />
                        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Account No.</p>
                        <div className="text-xl font-mono tracking-widest mb-1 z-10 relative">
                            {account ? account.account_number.replace(/(.{4})/g, '$1 ').trim() : '—'}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Vault Financial Elite Checking</p>
                        <div className="mt-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald" />
                            <span className="text-xs text-emerald font-semibold">{interestTier?.apy} Daily Yield Active</span>
                        </div>
                    </div>
                </div>

                {/* Active Loans */}
                {activeLoans?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                            <Landmark size={20} className="text-emerald" /> Active Loans
                        </h2>
                        <div className="space-y-4">
                            {activeLoans.map(loan => {
                                const r = 0.05 / 12;
                                const n = loan.term_months;
                                const p = parseFloat(loan.amount);
                                const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                                const canPayOff = account && parseFloat(account.balance) >= p;

                                return (
                                    <div key={loan.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald/10 text-emerald flex items-center justify-center">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-navy">{loan.purpose || 'Loan'} — ${parseFloat(loan.amount).toLocaleString('en-US')}</p>
                                                <p className="text-xs text-slate">{loan.term_months} month term · Est. ${monthly.toFixed(2)}/mo</p>
                                            </div>
                                        </div>
                                        <button onClick={() => payOff(loan.id)}
                                            disabled={!canPayOff}
                                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                                                canPayOff
                                                    ? 'bg-navy text-white hover:bg-navy/90'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}>
                                            {canPayOff ? 'Pay Off Loan' : 'Insufficient Balance'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-navy mb-6">Recent Transactions</h2>
                        <div className="space-y-1">
                            {recentTransactions.length > 0 ? recentTransactions.map(tx => {
                                const isIncoming = ['deposit', 'transfer_in'].includes(tx.type);
                                return (
                                    <div key={tx.id} className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isIncoming ? 'bg-emerald/10 text-emerald' : 'bg-red-50 text-red-500'}`}>
                                            {isIncoming ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-navy capitalize truncate">{tx.reference || tx.type.replace('_', ' ')}</p>
                                            <p className="text-xs text-slate">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${isIncoming ? 'text-emerald' : 'text-navy'}`}>
                                            {isIncoming ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            }) : <p className="text-slate italic text-sm">No recent transactions.</p>}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-slate uppercase tracking-widest mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { href: '/transactions', label: 'Transfer', icon: <ArrowUpRight size={18} /> },
                                    { href: '/cards', label: 'Cards', icon: <CreditCard size={18} /> },
                                    { href: '/loans', label: 'Loans', icon: <FileText size={18} /> },
                                    { href: '/profile/addresses', label: 'Profile', icon: <Landmark size={18} /> },
                                ].map(({ href, label, icon }) => (
                                    <a key={href} href={href}
                                        className="flex items-center gap-2 p-4 bg-slate-50 hover:bg-emerald/5 rounded-xl border border-slate-100 hover:border-emerald/20 transition-all text-sm font-semibold text-navy group">
                                        <span className="text-emerald group-hover:scale-110 transition-transform">{icon}</span>
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="bg-navy text-white rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
                            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">Interest Tier</p>
                            <p className="text-3xl font-bold">{interestTier?.apy}</p>
                            <p className="text-sm text-gray-400 mt-1">{interestTier?.label} Annual Yield</p>
                            <p className="text-xs text-gray-500 mt-3">Increase your balance to unlock higher tiers: $1k → 1.5%, $10k → 2.5%, $100k → 3.5%</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
