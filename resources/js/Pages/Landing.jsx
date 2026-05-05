import { SignInButton, useUser, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { router } from "@inertiajs/react";

export default function Landing() {
    const { isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            getToken().then(token => {
                fetch('/auth/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.ok) {
                        router.visit('/dashboard');
                    }
                });
            });
        }
    }, [isLoaded, isSignedIn]);

    if (isSignedIn) {
        return (
            <div className="min-h-screen bg-bg-light flex flex-col justify-center items-center font-sans text-navy">
                <div className="text-xl font-bold animate-pulse text-emerald">Authenticating securely...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-light font-sans text-navy flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald/5 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-navy/5 blur-[120px]"></div>

            <header className="px-10 py-6 flex justify-between items-center z-10">
                <div className="text-2xl font-bold tracking-tight text-navy">Vault Financial</div>
                <SignInButton mode="modal">
                    <button className="px-6 py-2 bg-navy text-white font-semibold rounded-lg hover:bg-navy/90 transition-colors">
                        Sign In
                    </button>
                </SignInButton>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center text-center px-4 z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-navy mb-6 max-w-4xl tracking-tight leading-tight">
                    Experience <span className="text-emerald">Elite Digital Banking</span> Like Never Before.
                </h1>
                <p className="text-lg md:text-xl text-slate mb-10 max-w-2xl">
                    Secure, transparent, and seamless financial management. Join Vault Financial to take control of your wealth with our premium tools and services.
                </p>
                <SignInButton mode="modal">
                    <button className="px-8 py-4 bg-emerald text-white text-lg font-bold rounded-xl shadow-lg hover:bg-emerald/90 transition-colors hover:scale-105 transform duration-200">
                        Get Started Today
                    </button>
                </SignInButton>
            </main>
        </div>
    );
}
