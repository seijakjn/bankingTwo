import Layout from "../Layout";
import { useForm, usePage, router } from "@inertiajs/react";
import { MapPin, Trash2, Phone, Mail, User } from "lucide-react";

export default function Address({ addresses, user }) {
    const { flash } = usePage().props;

    const nameForm = useForm({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
    });

    const addressForm = useForm({
        type: 'home',
        city: '',
        state: '',
        postal_code: '',
        country: ''
    });

    const contactForm = useForm({
        phone: user?.phone || '',
        secondary_email: user?.secondary_email || '',
    });

    const submitName = (e) => {
        e.preventDefault();
        nameForm.put('/profile/name');
    };

    const submitAddress = (e) => {
        e.preventDefault();
        addressForm.post('/profile/addresses', { onSuccess: () => addressForm.reset() });
    };

    const submitContact = (e) => {
        e.preventDefault();
        contactForm.put('/profile/contact');
    };

    const deleteAddress = (id) => {
        if (confirm('Delete this address?')) router.delete(`/profile/addresses/${id}`);
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Profile Settings</h1>
                    <p className="text-slate mt-2">Manage your contact information and addresses.</p>
                </header>

                {flash?.success && (
                    <div className="p-4 bg-emerald/10 text-emerald-700 font-semibold rounded-lg border border-emerald/20">{flash.success}</div>
                )}

                {/* Name */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-navy mb-6 flex items-center space-x-2">
                        <User size={20} className="text-emerald" /> <span>Your Name</span>
                    </h2>
                    <form onSubmit={submitName} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-2">First Name</label>
                            <input type="text" value={nameForm.data.first_name} onChange={e => nameForm.setData('first_name', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald"
                                placeholder="John" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-2">Last Name</label>
                            <input type="text" value={nameForm.data.last_name} onChange={e => nameForm.setData('last_name', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald"
                                placeholder="Doe" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" disabled={nameForm.processing}
                                className="px-6 py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50">
                                {nameForm.processing ? 'Saving...' : 'Save Name'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-navy mb-6 flex items-center space-x-2">
                        <Phone size={20} className="text-emerald" /> <span>Contact Information</span>
                    </h2>
                    <form onSubmit={submitContact} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-2">Phone Number</label>
                            <input type="tel" value={contactForm.data.phone} onChange={e => contactForm.setData('phone', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald"
                                placeholder="+1 (555) 000-0000" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-2">Secondary Email</label>
                            <input type="email" value={contactForm.data.secondary_email} onChange={e => contactForm.setData('secondary_email', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald"
                                placeholder="secondary@example.com" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" disabled={contactForm.processing}
                                className="px-6 py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50">
                                {contactForm.processing ? 'Saving...' : 'Save Contact Info'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add Address Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
                        <h2 className="text-xl font-bold text-navy mb-6 flex items-center space-x-2">
                            <MapPin size={20} className="text-emerald" /> <span>Add New Address</span>
                        </h2>
                        <form onSubmit={submitAddress} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-navy mb-2">Address Type</label>
                                <select value={addressForm.data.type} onChange={e => addressForm.setData('type', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald bg-white">
                                    <option value="home">Home</option>
                                    <option value="billing">Billing</option>
                                    <option value="shipping">Shipping</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-navy mb-2">City</label>
                                    <input type="text" value={addressForm.data.city} onChange={e => addressForm.setData('city', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy mb-2">State/Province</label>
                                    <input type="text" value={addressForm.data.state} onChange={e => addressForm.setData('state', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-navy mb-2">Postal Code</label>
                                    <input type="text" value={addressForm.data.postal_code} onChange={e => addressForm.setData('postal_code', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy mb-2">Country</label>
                                    <input type="text" value={addressForm.data.country} onChange={e => addressForm.setData('country', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald" required />
                                </div>
                            </div>
                            <button type="submit" disabled={addressForm.processing}
                                className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-colors mt-2">
                                {addressForm.processing ? 'Saving...' : 'Save Address'}
                            </button>
                        </form>
                    </div>

                    {/* Saved Addresses */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-navy mb-6">Saved Addresses</h2>
                        <div className="space-y-4">
                            {addresses.map(addr => (
                                <div key={addr.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-start hover:border-gray-300 transition-colors">
                                    <div className="flex space-x-3">
                                        <MapPin className="text-emerald mt-0.5 shrink-0" size={18} />
                                        <div>
                                            <div className="font-bold text-navy capitalize mb-0.5">{addr.type} Address</div>
                                            <div className="text-sm text-slate">{addr.city}, {addr.state} {addr.postal_code}</div>
                                            <div className="text-sm text-slate">{addr.country}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteAddress(addr.id)} className="text-red-400 hover:text-red-600 transition-colors ml-2 shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {addresses.length === 0 && <p className="text-slate italic text-sm">No addresses saved yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
