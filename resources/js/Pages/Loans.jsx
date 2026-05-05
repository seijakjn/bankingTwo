import Layout from "./Layout";
import { useForm, usePage } from "@inertiajs/react";

export default function Loans({ loans }) {
    const { flash } = usePage().props;
    const form = useForm({
        amount: '',
        term_months: '12'
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/loans/apply', {
            onSuccess: () => form.reset()
        });
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Loan Center</h1>
                    <p className="text-slate mt-2">Access premium capital with Vault Financial.</p>
                </header>

                {flash?.success && (
                    <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Application Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
                        <h2 className="text-xl font-bold text-navy mb-6">Apply for a Loan</h2>
                        <form onSubmit={submit} className="space-y-6">
                            {form.hasErrors && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm space-y-1">
                                    {Object.values(form.errors).map((err, i) => <div key={i}>{err}</div>)}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-semibold text-navy mb-2">Loan Amount ($)</label>
                                <input type="number" step="0.01" value={form.data.amount} onChange={e => form.setData('amount', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald transition-colors"
                                    placeholder="Min $100, Max $100,000" required />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-navy mb-2">Term Duration (Months)</label>
                                <select value={form.data.term_months} onChange={e => form.setData('term_months', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald transition-colors bg-white">
                                    <option value="12">12 Months</option>
                                    <option value="24">24 Months</option>
                                    <option value="36">36 Months</option>
                                    <option value="48">48 Months</option>
                                    <option value="60">60 Months</option>
                                </select>
                            </div>

                            <button type="submit" disabled={form.processing}
                                className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50">
                                {form.processing ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>

                    {/* Active Loans */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold text-navy mb-6">Your Loans</h2>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                            {loans.map(loan => (
                                <div key={loan.id} className="p-5 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-bold text-lg text-navy">${parseFloat(loan.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                            <div className="text-sm text-slate">{loan.term_months} Months Term</div>
                                        </div>
                                        <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-widest ${loan.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald/10 text-emerald'}`}>
                                            {loan.status}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate border-t border-gray-100 pt-3">
                                        Applied on {new Date(loan.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {loans.length === 0 && <p className="text-slate italic text-center mt-10">No active loans.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
