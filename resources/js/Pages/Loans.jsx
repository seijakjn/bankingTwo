import Layout from "./Layout";
import { useForm, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, FileText, MapPin, Phone, Upload, DollarSign } from "lucide-react";

const PURPOSES = ['Personal', 'Home Improvement', 'Auto', 'Education', 'Business', 'Medical', 'Debt Consolidation'];
const TERMS = [12, 24, 36, 48, 60];
const ANNUAL_RATE = 0.05;

function calcMonthly(amount, termMonths) {
    if (!amount || !termMonths) return 0;
    const r = ANNUAL_RATE / 12;
    const n = termMonths;
    const p = parseFloat(amount);
    if (r === 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function Loans({ loans, addresses, userContact, branches }) {
    const { flash } = usePage().props;
    const [step, setStep] = useState(1);

    const form = useForm({
        purpose: 'Personal',
        amount: '',
        term_months: '24',
        address_id: addresses[0]?.id || '',
        contact_phone: userContact?.phone || '',
        contact_email: userContact?.email || '',
        notes: '',
        proof_of_income: null,
        branch_id: branches[0]?.id || '',
    });

    const monthly = calcMonthly(form.data.amount, parseInt(form.data.term_months));

    const next = () => setStep(s => Math.min(s + 1, 4));
    const back = () => setStep(s => Math.max(s - 1, 1));

    const submit = (e) => {
        e.preventDefault();
        form.post('/loans/apply', {
            forceFormData: true,
            onSuccess: () => { form.reset(); setStep(1); }
        });
    };

    const statusColor = (status) => {
        if (status === 'approved') return 'bg-emerald/10 text-emerald';
        if (status === 'rejected') return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-700';
    };

    const steps = [
        { label: 'Loan Details', icon: DollarSign },
        { label: 'Personal Info', icon: MapPin },
        { label: 'Documents', icon: Upload },
        { label: 'Review', icon: FileText },
    ];

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Loan Center</h1>
                    <p className="text-slate mt-2">Apply for premium capital with Vault Financial.</p>
                </header>

                {flash?.success && <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">{flash.success}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Application Form */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between mb-8">
                            {steps.map((s, i) => {
                                const num = i + 1;
                                const Icon = s.icon;
                                const active = step === num;
                                const done = step > num;
                                return (
                                    <div key={num} className="flex items-center flex-1">
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all shrink-0
                                            ${done ? 'bg-emerald border-emerald text-white' : active ? 'border-navy bg-navy text-white' : 'border-gray-200 text-slate'}`}>
                                            {done ? '✓' : <Icon size={16} />}
                                        </div>
                                        <div className={`hidden sm:block ml-2 text-xs font-semibold ${active ? 'text-navy' : 'text-slate'}`}>{s.label}</div>
                                        {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${done ? 'bg-emerald' : 'bg-gray-200'}`} />}
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={submit}>
                            {form.hasErrors && (
                                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm space-y-1">
                                    {Object.values(form.errors).map((err, i) => <div key={i}>{err}</div>)}
                                </div>
                            )}

                            {/* Step 1: Loan Details */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold text-navy mb-4">Loan Details</h2>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Loan Purpose</label>
                                        <select value={form.data.purpose} onChange={e => form.setData('purpose', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald bg-white">
                                            {PURPOSES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Servicing Branch</label>
                                        <select value={form.data.branch_id} onChange={e => form.setData('branch_id', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald bg-white">
                                            <option value="" disabled>— Select a Branch —</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Loan Amount ($)</label>
                                        <input type="number" step="0.01" min="100" max="1000000"
                                            value={form.data.amount} onChange={e => form.setData('amount', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald"
                                            placeholder="Min $100 — Max $1,000,000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Repayment Term</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {TERMS.map(t => (
                                                <button type="button" key={t}
                                                    onClick={() => form.setData('term_months', String(t))}
                                                    className={`py-2 rounded-lg border-2 text-sm font-bold transition-all
                                                        ${String(t) === form.data.term_months ? 'bg-navy border-navy text-white' : 'border-gray-200 text-slate hover:border-navy'}`}>
                                                    {t}mo
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {form.data.amount && (
                                        <div className="p-4 bg-emerald/5 rounded-lg border border-emerald/20">
                                            <p className="text-xs text-slate uppercase font-semibold tracking-widest mb-1">Estimated Monthly Payment</p>
                                            <p className="text-2xl font-bold text-emerald">${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            <p className="text-xs text-slate mt-1">Based on 5% annual interest rate over {form.data.term_months} months</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Personal Info */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold text-navy mb-4">Personal Information</h2>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Billing / Home Address</label>
                                        {addresses.length > 0 ? (
                                            <select value={form.data.address_id} onChange={e => form.setData('address_id', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald bg-white">
                                                <option value="">— Select a saved address —</option>
                                                {addresses.map(a => (
                                                    <option key={a.id} value={a.id}>{a.city}, {a.state} {a.postal_code} ({a.type})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-sm text-slate italic p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                No saved addresses found. <a href="/profile/addresses" className="text-navy font-bold underline">Add one in your Profile</a> to autofill here.
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Contact Phone</label>
                                        <input type="tel" value={form.data.contact_phone} onChange={e => form.setData('contact_phone', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald"
                                            placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Contact Email</label>
                                        <input type="email" value={form.data.contact_email} onChange={e => form.setData('contact_email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald" />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Documents */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold text-navy mb-4">Supporting Documents</h2>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Proof of Income <span className="text-red-500">*</span></label>
                                        <p className="text-xs text-slate mb-3">Upload your most recent tax form or payslip. Accepted: JPG, PNG, PDF (Max 5MB)</p>
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald hover:bg-emerald/5 transition-colors">
                                            <div className="flex flex-col items-center">
                                                <Upload size={32} className="text-slate mb-2" />
                                                {form.data.proof_of_income
                                                    ? <span className="text-sm font-semibold text-navy">{form.data.proof_of_income.name}</span>
                                                    : <span className="text-sm text-slate">Click to upload or drag & drop</span>}
                                            </div>
                                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={e => form.setData('proof_of_income', e.target.files[0])} />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy mb-2">Additional Notes (Optional)</label>
                                        <textarea rows="4" value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald resize-none"
                                            placeholder="Any additional context for your loan application..." />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <div className="space-y-5">
                                    <h2 className="text-xl font-bold text-navy mb-4">Review Your Application</h2>
                                    <div className="space-y-3">
                                        {[
                                            ['Purpose', form.data.purpose],
                                            ['Amount', `$${parseFloat(form.data.amount || 0).toLocaleString('en-US')}`],
                                            ['Term', `${form.data.term_months} Months`],
                                            ['Est. Monthly', `$${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                                            ['Phone', form.data.contact_phone],
                                            ['Email', form.data.contact_email],
                                            ['Document', form.data.proof_of_income?.name || 'None'],
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-slate font-semibold">{label}</span>
                                                <span className="text-sm text-navy font-bold">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {form.data.notes && (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-slate font-semibold uppercase mb-1">Notes</p>
                                            <p className="text-sm text-navy">{form.data.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                {step > 1 ? (
                                    <button type="button" onClick={back} className="flex items-center space-x-2 px-5 py-3 text-slate font-semibold hover:text-navy transition-colors">
                                        <ChevronLeft size={18} /> <span>Back</span>
                                    </button>
                                ) : <div />}
                                {step < 4 ? (
                                    <button type="button" onClick={next}
                                        className="flex items-center space-x-2 px-6 py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-colors">
                                        <span>Next</span> <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={form.processing}
                                        className="px-8 py-3 bg-emerald text-white font-bold rounded-lg hover:bg-emerald/90 transition-colors disabled:opacity-50">
                                        {form.processing ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Loan History */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
                        <h2 className="text-xl font-bold text-navy mb-6">Your Loans</h2>
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {loans.map(loan => (
                                <div key={loan.id} className="p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-navy">${parseFloat(loan.amount).toLocaleString('en-US')}</div>
                                            <div className="text-xs text-slate">{loan.purpose} · {loan.term_months}mo</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${statusColor(loan.status)}`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                    {loan.rejection_reason && (
                                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                                            <span className="font-semibold">Reason: </span>{loan.rejection_reason}
                                        </div>
                                    )}
                                    <div className="text-xs text-slate mt-2">Applied {new Date(loan.created_at).toLocaleDateString()}</div>
                                </div>
                            ))}
                            {loans.length === 0 && <p className="text-slate italic text-center mt-10">No loan applications yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
