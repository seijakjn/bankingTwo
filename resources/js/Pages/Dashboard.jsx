import Layout from "./Layout";

export default function Dashboard({ account, recentTransactions }) {
    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-navy">Welcome Back</h1>
                    <p className="text-slate mt-2">Here is a summary of your elite account.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-sm font-semibold tracking-widest uppercase text-slate mb-4">Total Balance</h2>
                        <div className="text-5xl font-bold text-navy">
                            ${account ? parseFloat(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
                        </div>
                        <div className="mt-8 flex space-x-4">
                            <a href="/transactions" className="px-6 py-3 bg-emerald text-white font-semibold rounded-lg shadow-md hover:bg-emerald/90 transition-colors">Transfer Money</a>
                        </div>
                    </div>
                    <div className="bg-navy text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
                        <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">Account Number</h2>
                        <div className="text-2xl font-mono tracking-widest mb-8">
                            {account ? account.account_number.replace(/(.{4})/g, '$1 ').trim() : 'XXXX XXXX'}
                        </div>
                        <div className="text-sm text-gray-400">Vault Financial Elite Checking</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-navy mb-6">Recent Transactions</h2>
                    {recentTransactions.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {recentTransactions.map(tx => (
                                <div key={tx.id} className="py-4 flex justify-between items-center hover:bg-gray-50 transition-colors px-2 rounded-lg -mx-2">
                                    <div>
                                        <p className="font-semibold text-navy capitalize">{tx.type.replace('_', ' ')}</p>
                                        <p className="text-sm text-slate">{new Date(tx.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`font-bold text-lg ${['deposit', 'transfer_in'].includes(tx.type) ? 'text-emerald' : 'text-navy'}`}>
                                        {['deposit', 'transfer_in'].includes(tx.type) ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate italic">No recent transactions.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
