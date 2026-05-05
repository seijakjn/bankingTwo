import Layout from "./Layout";
import { useForm, usePage, router } from "@inertiajs/react";
import { CreditCard, Snowflake, XCircle } from "lucide-react";
import { useState } from "react";

export default function Cards({ card }) {
    const { flash } = usePage().props;
    const form = useForm({
        type: 'Debit'
    });

    const applyForCard = (e) => {
        e.preventDefault();
        form.post('/cards/apply');
    };

    const toggleFreeze = () => {
        router.post('/cards/freeze');
    };

    const cancelCard = () => {
        if(confirm("Are you sure you want to cancel this card? You will need to apply for a new one.")) {
            router.post('/cards/cancel');
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Card Management</h1>
                    <p className="text-slate mt-2">Manage your Vault Financial debit or credit card.</p>
                </header>

                {flash?.success && (
                    <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">
                        {flash.success}
                    </div>
                )}
                {form.errors?.error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {form.errors.error}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                {!card ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mb-6">
                            <CreditCard size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-navy mb-4">No Card Issued</h2>
                        <p className="text-slate mb-8 max-w-md">You currently don't have an active card. Apply now to get instant access to your funds worldwide.</p>
                        <form onSubmit={applyForCard} className="w-full max-w-sm flex flex-col items-center space-y-4">
                            <div className="w-full text-left">
                                <label className="block text-sm font-semibold text-navy mb-2">Select Card Type</label>
                                <select 
                                    value={form.data.type} 
                                    onChange={e => form.setData('type', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald transition-colors bg-white">
                                    <option value="Debit">Debit Card (Standard)</option>
                                    <option value="Credit">Credit Card (Premium Benefits)</option>
                                </select>
                            </div>
                            {form.data.type === 'Credit' && (
                                <div className="text-xs text-left w-full text-emerald font-semibold bg-emerald/10 p-3 rounded-lg">
                                    Includes: Cash back rewards, travel insurance, and elite concierge service.
                                </div>
                            )}
                            <button type="submit" disabled={form.processing}
                                className="w-full py-3 bg-emerald text-white font-bold rounded-lg shadow hover:bg-emerald/90 transition-colors disabled:opacity-50">
                                {form.processing ? 'Applying...' : 'Apply for a Card'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-navy text-white rounded-2xl shadow-xl p-8 h-56 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                            {card.status === 'frozen' && (
                                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                    <div className="flex flex-col items-center opacity-80">
                                        <Snowflake size={48} />
                                        <span className="font-bold tracking-widest mt-2">FROZEN</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center z-10">
                                <span className="font-bold tracking-widest text-lg">VAULT <span className="text-emerald text-sm uppercase tracking-widest ml-2">{card.type}</span></span>
                                <CreditCard size={32} className="opacity-80" />
                            </div>
                            <div className="z-10">
                                <div className="font-mono text-2xl tracking-[0.2em] mb-2 shadow-sm">{card.card_number}</div>
                                <div className="flex space-x-6 text-sm font-mono opacity-80 uppercase tracking-widest">
                                    <span>Exp {card.expiry}</span>
                                    <span>CVV ***</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-navy mb-6">Card Settings</h3>
                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="font-semibold text-navy">Card Status</div>
                                        <div className="text-sm text-slate">
                                            {card.status === 'active' ? 'Ready to use' : 'Temporarily locked'}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-widest ${card.status === 'active' ? 'bg-emerald/10 text-emerald' : 'bg-blue-100 text-blue-700'}`}>
                                        {card.status}
                                    </div>
                                </div>
                                <p className="text-sm text-slate italic">Note: As a Vault Elite member, you are limited to one active or frozen card.</p>
                            </div>
                            <div className="mt-6 flex space-x-4 border-t border-gray-100 pt-6">
                                <button onClick={toggleFreeze} className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                                    <Snowflake size={18} />
                                    <span>{card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}</span>
                                </button>
                                <button onClick={cancelCard} className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors">
                                    <XCircle size={18} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
