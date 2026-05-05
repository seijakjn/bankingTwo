import Layout from "../Layout";
import { usePage, router, useForm } from "@inertiajs/react";
import { ShieldAlert, ShieldCheck, Database, Terminal, AlertCircle, CheckCircle2, Landmark, TrendingUp, History, Save, Edit3, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboard({ users, branches, stats, queryResult, queryError, lastQuery }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('management');
    const [editingRow, setEditingRow] = useState(null);
    const [editData, setEditData] = useState({});
    const [targetTable, setTargetTable] = useState('');

    const sqlForm = useForm({
        query: lastQuery || '',
    });

    const toggleFreeze = (id) => {
        if(confirm('Toggle freeze status for this user?')) {
            router.post(`/admin/users/${id}/freeze`);
        }
    };

    const runQuery = (e) => {
        e.preventDefault();
        sqlForm.post('/admin/query', {
            preserveScroll: true,
        });
    };

    const startEditing = (index, row) => {
        setEditingRow(index);
        setEditData({...row});
    };

    const cancelEditing = () => {
        setEditingRow(null);
        setEditData({});
    };

    const saveChanges = (row) => {
        if (!targetTable) {
            alert('Please specify the target table name to perform updates.');
            return;
        }

        // Detect ID column (usually 'id' or 'accrual_id' or 'user_id' etc)
        const idColumn = Object.keys(row).find(key => key.toLowerCase().includes('id')) || 'id';
        
        router.post('/admin/update-record', {
            table: targetTable,
            id: row[idColumn],
            id_column: idColumn,
            data: editData
        }, {
            onSuccess: () => {
                setEditingRow(null);
                setEditData({});
            }
        });
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Admin Center</h1>
                        <p className="text-slate mt-2">System overview, management, and diagnostics. Freezing a user disables all transfers, deposits, withdrawals, and loan applications.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('management')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'management' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'}`}
                        >
                            Management
                        </button>
                        <button 
                            onClick={() => setActiveTab('console')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'console' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'}`}
                        >
                            SQL Console
                        </button>
                    </div>
                </header>

                {(flash?.success || flash?.error) && (
                    <div className={`p-4 rounded-lg border flex items-center gap-2 font-semibold ${flash?.success ? 'bg-emerald/10 text-emerald-700 border-emerald/20' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {flash?.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                            <Landmark size={80} />
                        </div>
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate mb-2">User Deposits</h2>
                        <div className="text-2xl font-bold text-navy">${parseFloat(stats.totalUserDeposits).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <p className="text-[10px] text-slate mt-2 italic">Total liabilities</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp size={80} className="text-emerald" />
                        </div>
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate mb-2">Branch Reserves</h2>
                        <div className="text-2xl font-bold text-emerald">${parseFloat(stats.totalBranchReserves).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <p className="text-[10px] text-slate mt-2 italic">Liquidity pool</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity text-navy">
                            <History size={80} />
                        </div>
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate mb-2">Pending Loans</h2>
                        <div className="text-2xl font-bold text-navy">{stats.totalPendingLoansCount}</div>
                        <p className="text-[10px] text-slate mt-2 italic">Awaiting review</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden group text-navy">
                        <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                            <Database size={80} />
                        </div>
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate mb-2">Interest Paid</h2>
                        <div className="text-2xl font-bold">${parseFloat(stats.totalInterestAccrued).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <p className="text-[10px] text-slate mt-2 italic">Total distributions</p>
                    </div>
                </div>

                {activeTab === 'management' ? (
                    <div className="space-y-8">
                        {/* User Management */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-navy mb-6">User Management</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-sm text-slate">
                                            <th className="pb-3 font-semibold">User</th>
                                            <th className="pb-3 font-semibold">Account Number</th>
                                            <th className="pb-3 font-semibold">Total Balance</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                            <th className="pb-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map(user => {
                                            const balance = user.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
                                            const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : user.name;
                                            const accountNumber = user.accounts[0]?.account_number || 'No Account';
                                            
                                            return (
                                                <tr key={user.id} className={user.is_frozen ? 'bg-red-50/30' : 'hover:bg-slate-50/50 transition-colors'}>
                                                    <td className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-navy">{fullName}</span>
                                                            <span className="text-xs text-slate">{user.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-mono text-sm text-navy">{accountNumber}</td>
                                                    <td className="py-4 font-bold text-navy">${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                                    <td className="py-4">
                                                        {user.is_frozen ? (
                                                            <span className="px-2 py-1 text-[10px] font-black uppercase rounded bg-red-100 text-red-700">Frozen</span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-[10px] font-black uppercase rounded bg-emerald/10 text-emerald">Active</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        <button onClick={() => toggleFreeze(user.id)} 
                                                            className={`px-3 py-1.5 font-bold rounded flex items-center space-x-1 transition-all text-xs active:scale-95
                                                            ${user.is_frozen ? 'bg-emerald text-white hover:bg-emerald/90' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                                            {user.is_frozen ? <><ShieldCheck size={14} /><span>Unfreeze</span></> : <><ShieldAlert size={14} /><span>Freeze User</span></>}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Branch Management */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-navy mb-6">Branch Management</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-sm text-slate">
                                            <th className="pb-3 font-semibold">Branch Name</th>
                                            <th className="pb-3 font-semibold">Reserve Account</th>
                                            <th className="pb-3 font-semibold">Current Reserves</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {branches.map(branch => {
                                            const balance = branch.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
                                            return (
                                                <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-navy">{branch.name}</span>
                                                            <span className="text-xs text-slate">{branch.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-mono text-sm text-navy">{branch.accounts[0]?.account_number || 'No Account'}</td>
                                                    <td className="py-4 font-bold text-emerald">${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                                    <td className="py-4">
                                                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded bg-navy/10 text-navy">System Operational</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-navy rounded-2xl shadow-xl border border-slate-800 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-lg text-emerald">
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-none">Diagnostic Console</h2>
                                    <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">Direct SQL Engine</p>
                                </div>
                            </div>

                            <form onSubmit={runQuery} className="space-y-4">
                                <textarea 
                                    value={sqlForm.data.query}
                                    onChange={e => sqlForm.setData('query', e.target.value)}
                                    className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl p-4 font-mono text-emerald text-sm focus:ring-2 focus:ring-emerald/50 focus:border-emerald outline-none transition-all placeholder:text-slate-700"
                                    placeholder="SELECT * FROM accounts LIMIT 10;"
                                ></textarea>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Target Table (for editing):</label>
                                        <input 
                                            type="text" 
                                            value={targetTable}
                                            onChange={e => setTargetTable(e.target.value)}
                                            placeholder="e.g. accounts"
                                            className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-xs text-white outline-none focus:border-emerald"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={sqlForm.processing}
                                        className="bg-emerald text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald/90 transition-all flex items-center gap-2 shadow-lg shadow-emerald/20 active:scale-95"
                                    >
                                        {sqlForm.processing ? 'Executing...' : <><Database size={18} /> Execute Query</>}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {queryError && (
                            <div className="p-6 bg-red-900/20 border border-red-900/30 rounded-2xl flex gap-4 items-start">
                                <div className="p-2 bg-red-900/50 rounded-lg text-red-400">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-red-400 font-bold text-sm">Engine Error</h3>
                                    <p className="text-red-300/80 text-xs font-mono mt-2">{queryError}</p>
                                </div>
                            </div>
                        )}

                        {queryResult && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-navy flex items-center gap-2">
                                        <Database size={18} className="text-emerald" /> Results <span className="text-xs font-normal text-slate">({queryResult.length} rows)</span>
                                    </h3>
                                    <p className="text-[10px] text-slate-400 italic">Editing mode active if Target Table is set and query includes ID.</p>
                                </div>
                                <div className="overflow-x-auto max-h-[600px]">
                                    <table className="w-full text-left text-[11px] font-mono">
                                        <thead className="sticky top-0 bg-white border-b border-gray-200">
                                            <tr>
                                                <th className="p-4 w-10"></th>
                                                {Object.keys(queryResult[0] || {}).map(key => (
                                                    <th key={key} className="p-4 font-bold text-slate uppercase">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {queryResult.map((row, i) => {
                                                const isEditing = editingRow === i;
                                                return (
                                                    <tr key={i} className={`transition-colors ${isEditing ? 'bg-emerald/5' : 'hover:bg-slate-50'}`}>
                                                        <td className="p-4">
                                                            {isEditing ? (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => saveChanges(row)} className="text-emerald hover:text-emerald-700"><Save size={14} /></button>
                                                                    <button onClick={cancelEditing} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => startEditing(i, row)} className="text-slate-400 hover:text-navy transition-colors"><Edit3 size={14} /></button>
                                                            )}
                                                        </td>
                                                        {Object.keys(row).map((key, j) => (
                                                            <td key={j} className="p-4 text-navy whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={editData[key] === null ? '' : editData[key]}
                                                                        onChange={e => setEditData({...editData, [key]: e.target.value})}
                                                                        className="bg-white border border-emerald/30 rounded px-2 py-1 w-full outline-none focus:border-emerald"
                                                                    />
                                                                ) : (
                                                                    row[key] === null ? <span className="text-slate-300 italic">null</span> : String(row[key])
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
