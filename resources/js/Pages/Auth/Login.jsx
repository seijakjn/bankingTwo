import { SignIn, useUser, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { router } from "@inertiajs/react";

export default function Login() {
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

    return (
        <div className="min-h-screen bg-bg-light flex flex-col justify-center items-center">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-navy mb-2">Vault Financial</h1>
                <p className="text-slate">Elite Digital Banking</p>
            </div>
            {!isSignedIn && <SignIn />}
            {isSignedIn && <div className="text-lg text-emerald animate-pulse font-semibold">Authenticating securely...</div>}
        </div>
    );
}
