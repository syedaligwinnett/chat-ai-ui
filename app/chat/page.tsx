"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
    SquarePen,
    Search,
    Image as ImageIcon,
    LayoutGrid,
    Microscope,
    Heart,
    Settings,
    HelpCircle,
    Plus,
    ChevronDown,
    Aperture,
    PanelLeftClose,
    Sparkles,
    Send
} from "lucide-react";

export default function ChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const sendMessage = async () => {
        if (!input) return;

        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        const formData = new FormData();
        formData.append("prompt", input);
        if (files.length > 0) {
            files.forEach((f) => {
                formData.append("files", f);
            });
        }

        const token = localStorage.getItem("token");
        const res = await axios.post("http://localhost:3001/chat/send", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const botMessage = { role: "bot", text: res.data.reply };

        setMessages((prev) => [...prev, botMessage]);
        setInput("");
        setFiles([]);
    };

    return (
        <div className="flex h-screen bg-white text-[#0f0f0f] font-sans antialiased">
            {/* Sidebar */}
            <div className="flex flex-col w-[260px] bg-[#f9f9f9] border-r border-[#ececec] h-full justify-between flex-shrink-0">

                {/* Top section */}
                <div className="flex flex-col">
                    {/* Top corner logos */}
                    <div className="flex items-center justify-between p-3 h-14">
                        <button className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-700 transition-colors">
                            <Aperture className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-700 transition-colors">
                            <PanelLeftClose className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Top menu items */}
                    <div className="flex flex-col gap-1 px-3">
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <SquarePen className="w-[18px] h-[18px] text-gray-700" />
                            New chat
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <Search className="w-[18px] h-[18px] text-gray-700" />
                            Search chats
                        </button>

                        <div className="my-[6px]" />

                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <ImageIcon className="w-[18px] h-[18px] text-gray-700" />
                            Images
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <LayoutGrid className="w-[18px] h-[18px] text-gray-700" />
                            Apps
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <Microscope className="w-[18px] h-[18px] text-gray-700" />
                            Deep research
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <Heart className="w-[18px] h-[18px] text-gray-700" />
                            Health
                        </button>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="flex flex-col">
                    <div className="flex flex-col gap-1 px-3 pb-3 border-b border-[#ececec]">
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <Sparkles className="w-[18px] h-[18px] text-gray-700" />
                            See plans and pricing
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <Settings className="w-[18px] h-[18px] text-gray-700" />
                            Settings
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <HelpCircle className="w-[18px] h-[18px] text-gray-700" />
                            Help
                        </button>
                    </div>

                    {/* Sign up banner on the left bottom */}
                    <div className="p-4 flex flex-col gap-3">
                        <div className="text-[14px] font-semibold text-gray-800">Get responses tailored to you</div>
                        <div className="text-[13px] text-gray-500 leading-snug">Log in to get answers based on saved chats, plus create images and upload files.</div>
                        <button className="w-full py-2 bg-white border border-[#e5e5e5] rounded-full font-medium text-[14px] text-gray-800 hover:bg-gray-50 transition-colors mt-1">
                            Log in
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative h-full min-w-0">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10">
                    <div className="flex items-center">
                        <button className="flex items-center gap-1 text-[18px] font-bold text-[#0f0f0f] hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
                            ChatGPT
                            <ChevronDown className="w-[18px] h-[18px] text-gray-500 ml-1" strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-2 text-[14px] font-medium text-gray-800">
                            Welcome! Admin
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                router.push("/login");
                            }}
                            className="px-4 py-1.5 text-[13px] font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-100"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex-1 flex flex-col ${messages.length === 0 ? "items-center justify-center pb-[10vh]" : ""} overflow-y-auto px-4`}>
                    {messages.length === 0 ? (
                        <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-[#0f0f0f] tracking-tight">What are you working on?</h1>
                    ) : (
                        <div className="flex-1 w-full max-w-[800px] mx-auto py-6 space-y-3">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg max-w-xl ${msg.role === "user"
                                        ? "bg-blue-600 ml-auto text-white"
                                        : "bg-gray-700 text-white"
                                        }`}
                                >
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`w-full max-w-[800px] ${messages.length > 0 ? "mx-auto sticky bottom-0 pb-2 pt-2 shrink-0 bg-white" : ""}`}>
                        <div className="flex items-center bg-[#f4f4f4] rounded-[24px] px-3 py-3 border border-transparent focus-within:bg-white focus-within:shadow-[0_2px_15px_rgba(0,0,0,0.08)] focus-within:border-[#e5e5e5] transition-all duration-200">
                            <label className="p-2 ml-1 mr-1 hover:bg-[#e8e8e8] rounded-full transition-colors text-gray-600 cursor-pointer flex items-center">
                                <Plus className="w-[20px] h-[20px]" />
                                {files.length > 0 && (
                                    <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                        📎 {files.length === 1 ? files[0].name : `${files.length} files`}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setFiles(Array.from(e.target.files));
                                        }
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything"
                                className="flex-1 bg-transparent border-none outline-none px-2 text-[16px] text-black placeholder:text-gray-500"
                            />
                            <button onClick={sendMessage} disabled={!input.trim()} className="pl-3 pr-4 py-2 mr-1 bg-black text-white border border-transparent rounded-full flex items-center justify-center shadow-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 gap-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                                <span className="text-[14px] font-medium">Submit</span>
                                <Send className="w-[16px] h-[16px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pb-4 pt-2 text-center w-full bg-white z-10 shrink-0">
                    <p className="text-[12px] text-gray-500">
                        By messaging ChatGPT, an AI chatbot, you agree to our <a href="#" className="underline text-gray-600 hover:text-black">Terms</a> and have read our <a href="#" className="underline text-gray-600 hover:text-black">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}