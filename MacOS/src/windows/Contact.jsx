import { useState } from "react";
import { Briefcase, Check, Copy, Globe, MapPin } from "lucide-react";

import { WindowControls } from "#components/index.js";
import { profile, socials } from "#constants/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const Contact = () => {
    const [copied, setCopied] = useState(false);

    const stopDrag = (e) => e.stopPropagation();

    const handleCopyEmail = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(profile.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copy email address:", profile.email);
        }
    };

    return (
        <>
            <div id="window-header">
                <WindowControls target="contact" />
                <h2>Contact Me</h2>
            </div>

            <div
                className="p-5 space-y-4 max-h-[62vh] overflow-y-auto bg-white"
                onMouseDown={stopDrag}
                onPointerDown={stopDrag}
            >
                <div className="w-full flex items-center justify-between gap-6 pb-4 border-b border-gray-200">
                    <img
                        src="/images/kartikay.jpg"
                        alt={profile.name}
                        className="w-[116px] h-[116px] rounded-full object-cover shrink-0 ring-2 ring-gray-200"
                    />

                    <div className="flex-1 min-w-0 min-h-[116px] flex flex-col justify-between items-start gap-2">
                        <div className="w-full flex items-center justify-between gap-2">
                            <span className="text-[17px] font-bold text-gray-900 leading-snug truncate">
                                {profile.name}
                            </span>

                            <button
                                type="button"
                                onClick={handleCopyEmail}
                                title={`Copy ${profile.email}`}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium leading-none rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <Check className="size-3 text-emerald-600" />
                                        <span className="text-emerald-700">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-3" />
                                        <span>Copy Email</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium leading-snug rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Globe className="size-3 shrink-0" />
                            <span>{profile.workMode}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium leading-snug rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{profile.availability}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs leading-snug text-gray-600">
                            <Briefcase className="size-3.5 text-gray-400 shrink-0" />
                            <span>{profile.company}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs leading-snug text-gray-600">
                            <MapPin className="size-3.5 text-gray-400 shrink-0" />
                            <span>{profile.location}</span>
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3>Let's Connect</h3>
                    <p>Got an idea to ship, a bug to squash, or just wanna to talk tech? I'm in.</p>
                </div>

                <ul>
                    {socials.map(({ id, bg, link, icon, text }) => (
                        <li key={id} style={{ background: bg }}>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={text}
                            >
                                <img src={icon} alt={text} className="size-5" />
                                <p>{text}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

const ContactWindow = WindowWrapper(Contact, "contact");

export default ContactWindow;