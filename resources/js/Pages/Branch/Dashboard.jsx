import Layout from "../Layout";
import { usePage, router } from "@inertiajs/react";
import { Eye } from "lucide-react";
import { useState, useEffect } from "react";

export default function BranchDashboard({ pendingLoans, recentLoans, branchBalance }) {
    const { flash } = usePage().props;

    // Auto-fetch new loans every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Branch Operations</h1>
                    <p className="text-slate mt-2">Manage loan requests and branch liquidity.</p>
                </header>

                {flash?.success && <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">{flash.success}</div>}
                {flash?.error && <div className="p-4 bg-red-50 text-red-700 font-semibold rounded-lg border border-red-200">{flash.error}</div>}

                {/* Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-navy text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Branch Reserve Balance</h2>
                        <div className="text-3xl font-bold break-all">
                            ${Number(branchBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">Master Account · VAULT-MASTER</div>
                    </div>
                    <div className="md:col-span-1 bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate mb-3">Pending Applications</h2>
                        <div className="text-3xl font-bold text-amber-600">{pendingLoans.length}</div>
                    </div>
                    <div className="md:col-span-1 bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate mb-3">Recently Processed</h2>
                        <div className="text-3xl font-bold text-navy">{recentLoans.length}</div>
                    </div>
                </div>

                {/* Pending Loans */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-navy mb-6">Pending Loan Applications</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs text-slate uppercase tracking-widest">
                                    <th className="pb-3 font-semibold">Date</th>
                                    <th className="pb-3 font-semibold">Applicant</th>
                                    <th className="pb-3 font-semibold">Purpose</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                    <th className="pb-3 font-semibold">Term</th>
                                    <th className="pb-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingLoans.map(loan => (
                                    <tr key={loan.id}>
                                        <td className="py-4 text-sm text-slate">{new Date(loan.created_at).toLocaleDateString()}</td>
                                        <td className="py-4">
                                            <div className="font-semibold text-navy">{loan.user.name}</div>
                                            <div className="text-xs text-slate">{loan.contact_email}</div>
                                        </td>
                                        <td className="py-4 text-sm text-slate">{loan.purpose}</td>
                                        <td className="py-4 font-bold text-emerald">${parseFloat(loan.amount).toLocaleString('en-US')}</td>
                                        <td className="py-4 text-sm text-slate">{loan.term_months} mo</td>
                                        <td className="py-4">
                                            <button onClick={() => router.visit(`/branch/loans/${loan.id}`)}
                                                className="flex items-center space-x-1 px-3 py-1.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy/90 transition-colors">
                                                <Eye size={14} /> <span>Review</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingLoans.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-10 text-center text-slate italic">No pending applications. All caught up!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent History */}
                {recentLoans.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-navy mb-6">Recent Decisions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs text-slate uppercase tracking-widest">
                                        <th className="pb-3 font-semibold">Reviewed</th>
                                        <th className="pb-3 font-semibold">Applicant</th>
                                        <th className="pb-3 font-semibold">Amount</th>
                                        <th className="pb-3 font-semibold">Decision</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentLoans.map(loan => (
                                        <tr key={loan.id}>
                                            <td className="py-3 text-sm text-slate">{loan.reviewed_at ? new Date(loan.reviewed_at).toLocaleDateString() : '—'}</td>
                                            <td className="py-3 font-semibold text-navy">{loan.user.name}</td>
                                            <td className="py-3 text-sm text-navy">${parseFloat(loan.amount).toLocaleString('en-US')}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full
                                                    ${loan.status === 'approved' ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-700'}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
