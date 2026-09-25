"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

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
                    <label className="block space-y-2 text-sm font-medium">Current password<input className={inputClass} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
                    <label className="block space-y-2 text-sm font-medium">New password<input className={inputClass} type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><span className="block text-xs font-normal text-gray-500">Use at least 8 characters.</span></label>
                    <label className="block space-y-2 text-sm font-medium">Confirm new password<input className={inputClass} type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
                    <button type="submit" disabled={loading} className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating�" : "Update password"}</button>
                </form>
            </section>
        </main>
    );
}

