"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthHero from "../../components/login/login-hero";
import { Navigation } from "@/components/landing/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAuthSubmit = (email: string) => {
        if (loading) return;
        setLoading(true);
        console.log("auth submit", email);
        setTimeout(() => {
            setLoading(false);
            router.push("/");
        }, 700);
    };

    return (
        <main className="relative min-h-screen overflow-x-hidden">
            <Navigation hideLinks />
            <AuthHero onSubmit={handleAuthSubmit} loading={loading} />
        </main>
    );
}