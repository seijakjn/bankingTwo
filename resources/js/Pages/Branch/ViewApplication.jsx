import Layout from "../Layout";
import { usePage, useForm, router } from "@inertiajs/react";
import { ArrowLeft, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";

export default function ViewApplication({ loan }) {
    const { flash } = usePage().props;
    const rejectForm = useForm({ rejection_reason: '' });

    const approve = () => {
        if (confirm('Approve this loan and disburse $' + parseFloat(loan.amount).toLocaleString('en-US') + ' to applicant?')) {
            router.post(`/branch/loans/${loan.id}/approve`);
        }
    };

    const reject = (e) => {
        e.preventDefault();
        rejectForm.post(`/branch/loans/${loan.id}/reject`);
    };

    const monthly = (() => {
        const r = 0.05 / 12;
        const n = loan.term_months;
        const p = parseFloat(loan.amount);
        return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    })();

    const docUrl = loan.proof_of_income_path
        ? `/storage/${loan.proof_of_income_path}`
        : null;

    const isPdf = docUrl?.endsWith('.pdf');

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.visit('/branch/dashboard')}
                        className="flex items-center space-x-2 text-slate hover:text-navy transition-colors">
                        <ArrowLeft size={20} /> <span className="font-semibold">Back to Dashboard</span>
                    </button>
                </div>

                <header>
                    <h1 className="text-3xl font-bold text-navy">Loan Application Review</h1>
                    <p className="text-slate mt-2">Application #{loan.id} — submitted {new Date(loan.created_at).toLocaleDateString()}</p>
                </header>

                {flash?.success && <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">{flash.success}</div>}
                {flash?.error && <div className="p-4 bg-red-50 text-red-700 font-semibold rounded-lg border border-red-200">{flash.error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Applicant Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <h2 className="text-xl font-bold text-navy border-b border-gray-100 pb-4">Applicant Information</h2>
                        <div className="space-y-3">
                            {[
                                ['Name', loan.user.name],
                                ['Email', loan.contact_email],
                                ['Phone', loan.contact_phone || '—'],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-slate">{label}</span>
                                    <span className="text-sm font-bold text-navy">{val}</span>
                                </div>
                            ))}
                        </div>

                        {loan.address && (
                            <div>
                                <p className="text-sm font-semibold text-slate mb-2">Address</p>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-navy">
                                    <div className="capitalize font-semibold">{loan.address.type} Address</div>
                                    <div>{loan.address.city}, {loan.address.state} {loan.address.postal_code}</div>
                                    <div>{loan.address.country}</div>
                                </div>
                            </div>
                        )}

                        {loan.notes && (
                            <div>
                                <p className="text-sm font-semibold text-slate mb-2">Applicant Notes</p>
                                <div className="p-3 bg-amber-50 rounded-lg text-sm text-navy border border-amber-100">{loan.notes}</div>
                            </div>
                        )}
                    </div>

                    {/* Loan Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <h2 className="text-xl font-bold text-navy border-b border-gray-100 pb-4">Loan Details</h2>
                        <div className="space-y-3">
                            {[
                                ['Purpose', loan.purpose],
                                ['Amount Requested', `$${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
                                ['Term', `${loan.term_months} Months`],
                                ['Est. Monthly Payment', `$${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                                ['Status', loan.status.toUpperCase()],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-slate">{label}</span>
                                    <span className={`text-sm font-bold ${label === 'Status' && loan.status === 'pending' ? 'text-amber-600' : 'text-navy'}`}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Proof of Income */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-navy mb-4">Proof of Income Document</h2>
                    {docUrl ? (
                        <div>
                            {isPdf ? (
                                <a href={docUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 px-5 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy/90 transition-colors">
                                    <FileText size={18} /> <span>Open PDF Document</span> <ExternalLink size={14} />
                                </a>
                            ) : (
                                <div>
                                    <img src={docUrl} alt="Proof of Income" className="max-w-full max-h-[500px] rounded-lg border border-gray-200 object-contain" />
                                    <a href={docUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 mt-4 text-sm text-navy font-semibold hover:underline">
                                        <ExternalLink size={14} /> <span>Open Full Image</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate italic">No document uploaded.</p>
                    )}
                </div>

                {/* Actions — only show if pending */}
                {loan.status === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-8">
                            <h3 className="text-lg font-bold text-navy mb-3">Approve Application</h3>
                            <p className="text-sm text-slate mb-6">Approving will immediately transfer <span className="font-bold text-emerald">${parseFloat(loan.amount).toLocaleString('en-US')}</span> from the branch reserve to the applicant's account.</p>
                            <button onClick={approve}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald text-white font-bold rounded-lg hover:bg-emerald/90 transition-colors">
                                <CheckCircle size={20} /> <span>Approve & Disburse Funds</span>
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-8">
                            <h3 className="text-lg font-bold text-navy mb-3">Reject Application</h3>
                            <form onSubmit={reject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-navy mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                                    <textarea rows="3" value={rejectForm.data.rejection_reason}
                                        onChange={e => rejectForm.setData('rejection_reason', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-red-200 focus:outline-none focus:border-red-400 resize-none text-sm"
                                        placeholder="Explain why this application is being rejected..." required />
                                    {rejectForm.errors.rejection_reason && <p className="text-xs text-red-600 mt-1">{rejectForm.errors.rejection_reason}</p>}
                                </div>
                                <button type="submit" disabled={rejectForm.processing}
                                    className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                                    <XCircle size={20} /> <span>Reject Application</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {loan.status !== 'pending' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                        <p className="text-slate">This application was <span className="font-bold text-navy">{loan.status}</span>
                        {loan.reviewed_at ? ` on ${new Date(loan.reviewed_at).toLocaleDateString()}` : ''}.</p>
                        {loan.rejection_reason && <p className="mt-2 text-sm text-red-700"><span className="font-semibold">Reason: </span>{loan.rejection_reason}</p>}
                    </div>
                )}
            </div>
        </Layout>
    );
}
