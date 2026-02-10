import { useEffect, useRef, useState } from "react";
import { Lock, LogOut, Terminal, ShieldCheck, CheckCircle2 } from "lucide-react";

import { WindowControls } from "#components/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { collectClientMeta, getVisitorId } from "../hooks/useVisitorLog.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const STORAGE_KEY = "macfolio_gmail_user";

function decodeJwtPayload(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
}

function loadSavedUser() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const Trash = () => {
    const [user, setUser] = useState(loadSavedUser);
    const [gsiReady, setGsiReady] = useState(Boolean(window.google?.accounts?.id));
    const [authError, setAuthError] = useState("");
    const googleBtnRef = useRef(null);

    const stopDrag = (e) => e.stopPropagation();

    // Load Google Identity Services script once
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || window.google?.accounts?.id) {
            if (window.google?.accounts?.id) setGsiReady(true);
            return;
        }

        const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existing) {
            existing.addEventListener("load", () => setGsiReady(true), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setGsiReady(true);
        script.onerror = () => setAuthError("Failed to load Google Sign-In.");
        document.head.appendChild(script);
    }, []);

    // Render Google Sign-In button whenever logged out & script is ready
    useEffect(() => {
        if (!gsiReady || !GOOGLE_CLIENT_ID || user || !googleBtnRef.current) return;

        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => {
                    try {
                        const payload = decodeJwtPayload(response.credential);
                        const loggedInUser = {
                            sub: payload.sub || "",
                            email: payload.email || "",
                            email_verified: Boolean(payload.email_verified),
                            name: payload.name || "",
                            given_name: payload.given_name || "",
                            family_name: payload.family_name || "",
                            picture: payload.picture || "",
                            hd: payload.hd || "",
                        };

                        setUser(loggedInUser);
                        setAuthError("");

                        try {
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
                        } catch {
                            // Ignore storage errors in strict browsers
                        }

                        // Log capture to D1 `gmail_users` + trigger Telegram alert
                        fetch("/api/gmail-login", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                credential: response.credential,
                                visitorId: getVisitorId(),
                                client: collectClientMeta(),
                            }),
                        }).catch(() => {});
                    } catch {
                        setAuthError("Could not read Google account details.");
                    }
                },
            });

            googleBtnRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: "filled_black",
                size: "large",
                shape: "pill",
                text: "signin_with",
                width: 240,
            });
        } catch {
            setAuthError("Google Sign-In could not initialize.");
        }
    }, [gsiReady, user]);

    const handleLogout = (e) => {
        e.stopPropagation();
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore
        }
        window.google?.accounts?.id?.disableAutoSelect?.();
        setUser(null);
    };

    return (
        <>
            <div id="window-header">
                <WindowControls target="trash" />
                <h2 className="font-roboto">
                    {user ? "secret_vault.app" : "trash_secret.app"}
                </h2>
            </div>

            <div
                className="trash-body p-4 sm:p-6 max-h-[65vh] overflow-y-auto font-roboto"
                onMouseDown={stopDrag}
                onPointerDown={stopDrag}
            >
                {!user ? (
                    <div className="flex flex-col items-center text-center space-y-5">
                        <div className="relative flex items-center justify-center size-14 rounded-xl border border-emerald-700/30 bg-emerald-50 text-emerald-700 dark:border-[#00ff41]/60 dark:bg-[#00ff41]/10 dark:text-[#00ff41] dark:shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                            <Lock className="size-6" />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded border border-emerald-700/30 bg-emerald-50 text-emerald-800 dark:border-[#00ff41]/40 dark:bg-[#00ff41]/10 dark:text-[#00ff41]">
                                <Terminal className="size-3" />
                                ./hidden_app.exe
                            </span>

                            <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-[#00ff41] leading-snug">
                                Login to unlock secret 7th App with mind blowing 🤩 features
                            </h3>

                            <p className="text-xs text-slate-600 dark:text-[#00ff41]/70">
                                Sign in with your Google account to unlock exclusive hidden app inside MacFolio.
                            </p>
                        </div>

                        <div className="w-full flex flex-wrap justify-center gap-2 text-[11px]">
                            <div className="px-2.5 py-1.5 rounded border border-emerald-700/25 bg-white text-emerald-900 dark:border-[#00ff41]/35 dark:bg-[#071109] dark:text-[#00ff41]/90">
                                ./vip_tools
                            </div>
                            <div className="px-2.5 py-1.5 rounded border border-emerald-700/25 bg-white text-emerald-900 dark:border-[#00ff41]/35 dark:bg-[#071109] dark:text-[#00ff41]/90">
                                ./hidden_app
                            </div>
                            <div className="px-2.5 py-1.5 rounded border border-emerald-700/25 bg-white text-emerald-900 dark:border-[#00ff41]/35 dark:bg-[#071109] dark:text-[#00ff41]/90">
                                ./easter_eggs
                            </div>
                        </div>

                        {!GOOGLE_CLIENT_ID ? (
                            <p className="text-xs text-emerald-900 dark:text-[#00ff41] bg-emerald-50 dark:bg-[#00ff41]/10 border border-emerald-700/30 dark:border-[#00ff41]/40 rounded-lg px-3 py-2">
                                Missing <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code>. Add it and restart the dev server.
                            </p>
                        ) : (
                            <div className="pt-1 flex flex-col items-center gap-2">
                                <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
                                {!gsiReady && !authError && (
                                    <span className="text-xs text-slate-500 dark:text-[#00ff41]/60">
                                        $ init google_auth...
                                    </span>
                                )}
                                {authError && (
                                    <span className="text-xs text-red-600 dark:text-red-400">{authError}</span>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name || user.email}
                                    referrerPolicy="no-referrer"
                                    className="size-18 rounded-full object-cover ring-2 ring-emerald-700/50 dark:ring-[#00ff41]/75 dark:shadow-[0_0_20px_rgba(0,255,65,0.28)]"
                                />
                            ) : (
                                <div className="size-18 rounded-full bg-emerald-700 dark:bg-[#00ff41]/20 text-white dark:text-[#00ff41] flex items-center justify-center text-xl font-bold ring-2 ring-emerald-700/50 dark:ring-[#00ff41]/75">
                                    {(user.name || user.email || "?")[0].toUpperCase()}
                                </div>
                            )}
                            <span className="absolute bottom-0 right-0 flex items-center justify-center size-5 rounded-full bg-emerald-600 dark:bg-[#00ff41] text-white dark:text-black ring-2 ring-[#f8faf9] dark:ring-[#050806]">
                                <CheckCircle2 className="size-3" />
                            </span>
                        </div>

                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-900 dark:text-[#00ff41]">
                                {user.name || "Mystery Visitor"}
                            </p>
                            <p className="text-[11px] text-emerald-800/80 dark:text-[#00ff41]/70 break-all">
                                {user.email}
                            </p>
                        </div>

                        <div className="w-full p-4 rounded-lg text-left bg-white dark:bg-[#070f09] border border-emerald-700/30 dark:border-[#00ff41]/55 dark:shadow-[0_0_22px_rgba(0,255,65,0.12)] space-y-2">
                            <p className="text-[11px] text-emerald-700/70 dark:text-[#00ff41]/55">
                                $ cat /vault/message.txt
                            </p>

                            <p className="text-[14px] font-bold text-slate-900 dark:text-[#00ff41]">
                                Thanks for providing your data 😜
                            </p>

                            <p className="text-[12.5px] leading-relaxed text-slate-700 dark:text-[#86efac]">
                                Now i will know which gmail has actually visited me 😎
                            </p>

                            <p className="text-[12.5px] font-semibold text-emerald-700 dark:text-[#00ff41]">
                                &gt; Can't believe you fell for it 🤣
                            </p>

                            <p className="text-[11.5px] text-slate-500 dark:text-[#00ff41]/70 pt-2.5 mt-1 border-t border-emerald-700/20 dark:border-[#00ff41]/25">
                                Take it as a joke &amp; m trustworthy 😇
                            </p>
                        </div>

                        <div className="w-full flex items-center justify-between pt-2 border-t border-emerald-700/20 dark:border-[#00ff41]/25">
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800/80 dark:text-[#00ff41]/70">
                                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-[#00ff41]" />
                                root@google_auth
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-emerald-700/40 text-emerald-800 hover:bg-emerald-700 hover:text-white dark:border-[#00ff41]/60 dark:bg-[#00ff41]/10 dark:text-[#00ff41] dark:hover:bg-[#00ff41] dark:hover:text-black dark:hover:shadow-[0_0_16px_rgba(0,255,65,0.45)] transition-all cursor-pointer"
                            >
                                <LogOut className="size-3.5" />
                                <span>./logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const TrashWindow = WindowWrapper(Trash, "trash");

export default TrashWindow;