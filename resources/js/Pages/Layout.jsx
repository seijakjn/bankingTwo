import { useAuth, UserButton } from "@clerk/clerk-react";
import { Link, usePage, router } from "@inertiajs/react";
import { Home, CreditCard, ArrowLeftRight, Landmark, LogOut } from "lucide-react";

export default function Layout({ children }) {
    const { url, props } = usePage();
    const { signOut } = useAuth();
    const userRole = props.auth?.user?.role || 'user';
    
    let navItems = [];
    if (userRole === 'user') {
        navItems = [
            { name: "Dashboard", href: "/dashboard", icon: Home },
            { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
            { name: "Cards", href: "/cards", icon: CreditCard },
            { name: "Loans", href: "/loans", icon: Landmark },
            { name: "Profile", href: "/profile/addresses", icon: Home }, // Add Profile
        ];
    } else if (userRole === 'admin') {
        navItems = [
            { name: "Admin Dashboard", href: "/admin/dashboard", icon: Home },
        ];
    } else if (userRole === 'branch') {
        navItems = [
            { name: "Branch Dashboard", href: "/branch/dashboard", icon: Home },
        ];
    }

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
                <header className="h-20 border-b border-gray-200 bg-white flex flex-col justify-center px-10 shadow-sm z-0 relative">
                    {props.auth?.user?.is_frozen && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse"></div>
                    )}
                    <div className="flex items-center justify-between">
                        {props.auth?.user?.is_frozen && (
                            <div className="flex items-center space-x-2 text-red-600 font-black text-[10px] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span>Account Frozen by Administration</span>
                            </div>
                        )}
                        <div className="flex-1"></div>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>
                {/* Content */}
                <div className="p-10 flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
