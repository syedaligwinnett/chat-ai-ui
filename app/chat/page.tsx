"use client";

import { useState, useEffect, useRef } from "react";
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
    Send,
    Square,
    Copy,
    Check,
    Loader2,
    Camera,
    Menu,
    File as FileIcon,
    FileArchive,
    FileCode,
    FileSpreadsheet,
    FileText,
    Film,
    Music2,
    X
} from "lucide-react";

export default function ChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const nextMessageIdRef = useRef(0);

    const addFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles?.length) return;
        setFiles((current) => [...current, ...Array.from(selectedFiles)]);
    };

    const toggleSidebar = () => {
        if (window.matchMedia("(min-width: 768px)").matches) {
            setIsDesktopSidebarOpen((isOpen) => !isOpen);
            return;
        }
        setIsMobileSidebarOpen((isOpen) => !isOpen);
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [input]);

    const scrollToBottom = () => {
        const container = document.getElementById("chat-scroll-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const sendMessage = async () => {
        if (isProcessing) {
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
            setTypingMessageId(null);
            setIsProcessing(false);
            return;
        }
        if (!input.trim()) return;

        const currentInput = input;
        const currentFiles = [...files];

        const userMessage = { role: "user", text: currentInput };
        setMessages((prev) => [...prev, userMessage]);

        // Clear input immediately for better UX
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        const formData = new FormData();
        formData.append("prompt", currentInput);
        if (currentFiles.length > 0) {
            currentFiles.forEach((f) => {
                formData.append("files", f);
            });
        }

        setIsProcessing(true);
        const controller = new AbortController();
        abortControllerRef.current = controller;
        let responseIsTyping = false;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
                timeout: 210000,
            });

            if (controller.signal.aborted) return;
            const reply = res.data?.reply;
            if (typeof reply !== "string" || !reply.trim()) {
                throw new Error("The server returned an empty reply. Check whether it can read this attachment format.");
            }

            setFiles((pendingFiles) => pendingFiles.filter((file) => !currentFiles.includes(file)));
            const messageId = nextMessageIdRef.current++;
            const botMessage = { role: "bot", text: reply, isNew: true, id: messageId };
            responseIsTyping = true;
            setMessages((prev) => [...prev, botMessage]);
            setTypingMessageId(messageId);
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error("Error sending message:", error);
                const serverMessage = axios.isAxiosError(error) ? error.response?.data?.message : null;
                const errorMessage = typeof serverMessage === "string"
                    ? serverMessage
                    : axios.isAxiosError(error) && (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
                        ? "The request timed out while the server was processing your attachment. Try a smaller file or try again."
                        : "The server could not process this request. Check that the backend is running and supports this file format.";
                setMessages((prev) => [...prev, { role: "bot", text: `I couldn't process that request. ${errorMessage}` }]);
            }
        } finally {
            if (!responseIsTyping && abortControllerRef.current === controller) {
                setIsProcessing(false);
                abortControllerRef.current = null;
            }
        }
    };

    const finishTyping = (messageId: number) => {
        setMessages((prev) => prev.map((message) =>
            message.id === messageId ? { ...message, isNew: false } : message
        ));
        setTypingMessageId(null);
        setIsProcessing(false);
        abortControllerRef.current = null;
    };

    const startNewChat = () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setIsMobileSidebarOpen(false);
        setMessages([]);
        setInput("");
        setFiles([]);
        setTypingMessageId(null);
        setIsProcessing(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="relative flex h-screen h-[100dvh] w-full overflow-hidden bg-white font-sans antialiased text-[#0f0f0f]">
            {isMobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="fixed inset-0 z-20 bg-black/35 md:hidden"
                />
            )}
            {/* Sidebar */}
            <div
                id="chat-sidebar"
                className={`fixed inset-y-0 left-0 z-30 flex h-full w-[280px] max-w-[85vw] flex-col justify-between overflow-y-auto border-r border-[#ececec] bg-[#f9f9f9] shadow-xl transition-all duration-200 md:relative md:inset-auto md:z-auto md:h-full md:max-w-none md:translate-x-0 md:shadow-none ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isDesktopSidebarOpen ? "md:flex md:w-[260px]" : "md:w-0 md:overflow-hidden md:border-0"}`}
            >

                {/* Top section */}
                <div className="flex flex-col">
                    {/* Top corner logos */}
                    <div className="flex items-center justify-between p-3 h-14">
                        <button className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-700 transition-colors">
                            <Aperture className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            aria-label="Collapse sidebar"
                            onClick={toggleSidebar}
                            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-200/50"
                        >
                            <PanelLeftClose className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Top menu items */}
                    <div className="flex flex-col gap-1 px-3">
                        <button onClick={startNewChat} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
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
                        <button onClick={() => router.push("/change-password")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <Settings className="w-[18px] h-[18px] text-gray-700" />
                            Settings
                        </button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 text-[14px] font-medium text-gray-800 transition-colors">
                            <HelpCircle className="w-[18px] h-[18px] text-gray-700" />
                            Help
                        </button>
                    </div>

                    {/* Sign up banner on the left bottom */}
                    {/* <div className="p-4 flex flex-col gap-3">
                        <div className="text-[14px] font-semibold text-gray-800">Get responses tailored to you</div>
                        <div className="text-[13px] text-gray-500 leading-snug">Log in to get answers based on saved chats, plus create images and upload files.</div>
                        <button className="w-full py-2 bg-white border border-[#e5e5e5] rounded-full font-medium text-[14px] text-gray-800 hover:bg-gray-50 transition-colors mt-1">
                            Log in
                        </button>
                    </div> */}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
                {/* Top Bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white px-2 py-2 sm:px-4 sm:py-3">
                    <div className="flex min-w-0 items-center gap-1">
                        <button
                            type="button"
                            aria-label="Toggle navigation menu"
                            aria-controls="chat-sidebar"
                            onClick={toggleSidebar}
                            className="shrink-0 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <button className="flex min-w-0 items-center gap-1 rounded-lg px-1 py-1 text-left text-sm font-bold text-[#0f0f0f] transition-colors hover:bg-gray-100 sm:px-2 sm:text-base md:text-lg">
                            <span className="truncate">Gwinnett Psychiatry - AI Assistant</span>
                            <ChevronDown className="ml-1 h-[18px] w-[18px] shrink-0 text-gray-500" strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <div className="hidden px-3 py-2 text-[14px] font-medium text-gray-800 sm:block">
                            Welcome! Admin
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                router.push("/login");
                            }}
                            className="whitespace-nowrap rounded-full border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 sm:px-4 sm:text-[13px]"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div id="chat-scroll-container" className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-3 scroll-smooth sm:px-4 ${messages.length === 0 ? "items-center justify-center pb-[8vh]" : ""}`}>
                    {messages.length === 0 ? (
                        <h1 className="mb-6 px-3 text-center text-2xl font-semibold tracking-tight text-[#0f0f0f] sm:mb-8 sm:text-3xl md:text-4xl">What are you working on?</h1>
                    ) : (
                        <div className="mx-auto w-full max-w-[800px] flex-1 space-y-4 py-4 sm:py-6">
                            {messages.map((msg, i) => (
                                <ChatBubble
                                    key={i}
                                    msg={msg}
                                    isTyping={typingMessageId === msg.id}
                                    onTypingComplete={() => finishTyping(msg.id)}
                                />
                            ))}
                            {isProcessing && (
                                <div className="flex items-center gap-3 p-4 rounded-2xl max-w-xl bg-white border border-[#e5e5e5] text-gray-500 rounded-tl-none shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[13px] font-medium text-gray-400">Gwinnett AI is typing...</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`w-full max-w-[800px] ${messages.length > 0 ? "sticky bottom-0 mx-auto shrink-0 bg-white pb-2 pt-2" : ""}`}>
                        {files.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-3">
                                {files.map((file, index) => (
                                    <AttachmentPreview
                                        key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
                                        file={file}
                                        onRemove={() => setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="flex min-w-0 items-center rounded-[24px] border border-transparent bg-[#f4f4f4] px-2 py-2 transition-all duration-200 focus-within:border-[#e5e5e5] focus-within:bg-white focus-within:shadow-[0_2px_15px_rgba(0,0,0,0.08)] sm:px-3 sm:py-3">
                            <label className="ml-0.5 mr-0.5 flex shrink-0 cursor-pointer items-center rounded-full p-2 text-gray-600 transition-colors hover:bg-[#e8e8e8] sm:ml-1 sm:mr-1">
                                <Plus className="w-[20px] h-[20px]" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        addFiles(e.currentTarget.files);
                                        e.currentTarget.value = "";
                                    }}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                aria-label="Take a photo"
                                title="Take a photo"
                                className="mr-1 flex shrink-0 items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-[#e8e8e8] sm:mr-2"
                            >
                                <Camera className="h-5 w-5" />
                            </button>
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => {
                                    addFiles(e.currentTarget.files);
                                    e.currentTarget.value = "";
                                }}
                            />
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (input.trim()) {
                                            sendMessage();
                                        }
                                    }
                                }}
                                placeholder="Ask anything"
                                className="min-w-0 flex-1 resize-none border-none bg-transparent px-1.5 py-1 text-base text-black outline-none placeholder:text-gray-500 max-h-[160px] overflow-y-auto sm:max-h-[200px] sm:px-2"
                            />
                            <button onClick={sendMessage} disabled={!isProcessing && !input.trim()} aria-label={isProcessing ? "Stop response" : "Submit message"} className="mr-0.5 flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent bg-black py-2 pl-2.5 pr-3 text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:mr-1 sm:gap-2 sm:pl-3 sm:pr-4">
                                {isProcessing ? (
                                    <><span className="text-xs font-medium sm:text-[14px]">Stop</span><Square className="h-[14px] w-[14px] fill-current" /></>
                                ) : (
                                    <><span className="text-xs font-medium sm:text-[14px]">Submit</span><Send className="h-4 w-4" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="z-10 w-full shrink-0 bg-white px-2 pb-2 pt-1 text-center sm:px-3 sm:pb-4 sm:pt-2">
                    <p className="text-[10px] text-gray-500 sm:text-[12px]">
                        By messaging ChatGPT, an AI chatbot, you agree to our <a href="#" className="underline text-gray-600 hover:text-black">Terms</a> and have read our <a href="#" className="underline text-gray-600 hover:text-black">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const isImage = isImageFile(file);
    const PreviewIcon = isImage ? ImageIcon : getFileIcon(file);
    const fileExtension = file.name.split(".").pop()?.toUpperCase();

    useEffect(() => {
        if (!isImage) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setPreviewFailed(false);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file, isImage]);

    return (
        <div className="relative flex h-[88px] w-[220px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 pr-9 shadow-sm">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-500">
                {isImage && previewUrl && !previewFailed ? (
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        onError={() => setPreviewFailed(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                        <PreviewIcon className="h-7 w-7" strokeWidth={1.7} />
                        <span className="max-w-14 truncate text-[9px] font-semibold uppercase tracking-wide">
                            {fileExtension && fileExtension !== file.name.toUpperCase() ? fileExtension : "FILE"}
                        </span>
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-gray-800" title={file.name}>{file.name}</div>
                <div className="mt-1 text-[11px] text-gray-500">{formatFileSize(file.size)}</div>
            </div>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${file.name}`}
                title={`Remove ${file.name}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

function isImageFile(file: File) {
    return file.type.startsWith("image/") || /\.(avif|bmp|gif|jpe?g|png|svg|webp|heic|heif|tiff?)$/i.test(file.name);
}

function getFileIcon(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (file.type.startsWith("audio/") || ["aac", "m4a", "mp3", "ogg", "wav", "flac"].includes(extension)) return Music2;
    if (file.type.startsWith("video/") || ["avi", "mkv", "mov", "mp4", "webm"].includes(extension)) return Film;
    if (["csv", "ods", "xls", "xlsx"].includes(extension)) return FileSpreadsheet;
    if (["7z", "gz", "rar", "tar", "zip"].includes(extension)) return FileArchive;
    if (["c", "cpp", "css", "html", "java", "js", "json", "jsx", "py", "ts", "tsx", "xml"].includes(extension)) return FileCode;
    if (extension) return FileText;
    return FileIcon;
}

function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ChatBubble({ msg, isTyping, onTypingComplete }: { msg: any; isTyping: boolean; onTypingComplete: () => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(msg.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div
            className={`group relative p-4 rounded-2xl max-w-[85%] md:max-w-xl shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user"
                ? "bg-[#007AFF] ml-auto text-white rounded-tr-none"
                : "bg-white border border-[#e5e5e5] text-[#0f0f0f] rounded-tl-none"
                }`}
        >
            <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : ""}`}>
                {msg.role === "bot" && msg.isNew ? (
                    <Typewriter text={msg.text} active={isTyping} onComplete={onTypingComplete} />
                ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
            </div>

            <button
                onClick={handleCopy}
                className={`absolute ${msg.role === "user" ? "-left-12" : "-right-12"} top-1 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all duration-200 text-gray-500 cursor-pointer`}
                title="Copy this text"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}

function Typewriter({ text, active, onComplete }: { text: string; active: boolean; onComplete?: () => void }) {
    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        // Scroll to bottom as new characters are typed
        const container = document.getElementById("chat-scroll-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }

        if (active && index < text.length) {
            // Speed up typing for longer AI responses so user doesn't wait indefinitely
            const step = text.length > 3000 ? 8 : (text.length > 1500 ? 4 : (text.length > 500 ? 2 : 1));
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + text.substring(index, index + step));
                setIndex((prev) => prev + step);
            }, 10);
            return () => clearTimeout(timeout);
        } else if (active && onCompleteRef.current) {
            onCompleteRef.current();
        }
    }, [active, index, text]);

    return <ReactMarkdown>{displayText}</ReactMarkdown>;
}
