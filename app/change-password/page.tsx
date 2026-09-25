"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState({ current: false, new: false, confirm: false });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (newPassword !== confirmPassword) {
            setError("The new passwords do not match.");
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setSuccess(response.data.message || "Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Could not change password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 font-sans text-gray-900">
            <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
                <button type="button" onClick={() => router.push("/chat")} className="mb-7 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="h-4 w-4" /> Back to chat
                </button>
                <div className="mb-7 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><LockKeyhole className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-semibold">Change password</h1><p className="mt-1 text-sm text-gray-500">Choose a new password for your account.</p></div>
                </div>
                {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{Array.isArray(error) ? error.join(" ") : error}</p>}
                {success && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} visible={visiblePasswords.current} onToggle={() => setVisiblePasswords((state) => ({ ...state, current: !state.current }))} autoComplete="current-password" />
                    <PasswordField label="New password" value={newPassword} onChange={setNewPassword} visible={visiblePasswords.new} onToggle={() => setVisiblePasswords((state) => ({ ...state, new: !state.new }))} autoComplete="new-password" />
                    <p className="-mt-2 text-xs text-gray-500">Use at least 8 characters.</p>
                    <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} visible={visiblePasswords.confirm} onToggle={() => setVisiblePasswords((state) => ({ ...state, confirm: !state.confirm }))} autoComplete="new-password" />
                    <button type="submit" disabled={loading} className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating…" : "Update password"}</button>
                </form>
            </section>
        </main>
    );
}


function PasswordField({ label, value, onChange, visible, onToggle, autoComplete }: { label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void; autoComplete: string }) {
    return (
        <label className="block space-y-2 text-sm font-medium">
            {label}
            <span className="relative block">
                <input className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={label === "Current password" ? undefined : 8} value={value} onChange={(event) => onChange(event.target.value)} required />
                <button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800">
                    {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </span>
        </label>
    );
}