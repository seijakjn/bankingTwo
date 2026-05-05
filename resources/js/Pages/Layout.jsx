import { useAuth, UserButton } from "@clerk/clerk-react";
import { Link, usePage, router } from "@inertiajs/react";
import { Home, CreditCard, ArrowLeftRight, Landmark, LogOut } from "lucide-react";

export default function Layout({ children }) {
    const { url } = usePage();
    const { signOut } = useAuth();
    
    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
        { name: "Cards", href: "/cards", icon: CreditCard },
        { name: "Loans", href: "/loans", icon: Landmark },
    ];

    const handleSignOut = () => {
        signOut().then(() => {
            router.post('/auth/logout');
        });
    };

    return (
        <div className="flex min-h-screen bg-bg-light font-sans text-navy">
            {/* Sidebar */}
            <aside className="w-[280px] bg-navy text-white flex flex-col shadow-xl z-10">
                <div className="p-8 mb-4 border-b border-white/10">
                    <h1 className="text-2xl font-bold tracking-tight">Vault Financial</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map(item => {
                        const active = url.startsWith(item.href);
                        return (
                            <Link key={item.name} href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-white/10 text-emerald' : 'hover:bg-white/5 text-gray-300'}`}>
                                <item.icon size={20} />
                                <span className="font-semibold">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <button onClick={handleSignOut} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white w-full transition-colors">
                        <LogOut size={20} />
                        <span className="font-semibold">Sign Out</span>
                    </button>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-gray-200 bg-white flex items-center justify-end px-10 shadow-sm z-0 relative">
                    <UserButton afterSignOutUrl="/" />
                </header>
                {/* Content */}
                <div className="p-10 flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
