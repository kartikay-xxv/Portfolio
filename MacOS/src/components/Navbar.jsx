import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { navLinks, navIcons } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useThemeStore from "#store/theme.js";

const THEME_OPTIONS = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
];

const LiveTime = () => {
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return <time>{currentTime.format("ddd MMM DD hh:mm:ss A")}</time>;
};

const NavIconButton = ({ src, alt, title, onClick = () => {} }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className="p-0.5 cursor-pointer rounded hover:bg-white/40 dark:hover:bg-white/15 transition-colors flex items-center justify-center"
    >
        <img src={src} alt={alt} className="size-3.5 dark:invert" />
    </button>
);

const Navbar = () => {
    const { openWindow, closeWindow, windows } = useWindowStore();
    const { theme, setTheme, initTheme } = useThemeStore();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const themeMenuRef = useRef(null);

    useEffect(() => {
        initTheme();
    }, [initTheme]);

    useEffect(() => {
        if (!themeMenuOpen) return;

        const handleOutsideClick = (e) => {
            if (!themeMenuRef.current?.contains(e.target)) {
                setThemeMenuOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setThemeMenuOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [themeMenuOpen]);

    const handleRefresh = () => {
        window.location.href = "/";
    };

    const toggleWindow = (type) => {
        const win = windows[type];
        if (!win) return;
        win.isOpen ? closeWindow(type) : openWindow(type);
    };

    return (
        <nav className="relative z-50">
            <div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="px-2 py-0.5 text-[13px] font-bold text-black dark:text-white cursor-pointer rounded hover:bg-white/40 dark:hover:bg-white/15 transition-colors flex items-center justify-center gap-1.5"
                >
                    <img src="/images/logo.svg" alt="Logo" className="size-3.5 dark:invert" />
                    <span>Kartikay's Portfolio</span>
                </button>
                <ul>
                    {navLinks.map(({ id, name, type }) => (
                    <li key={id}>
                        <button
                            type="button"
                            onClick={() => toggleWindow(type)}
                            className="px-2 py-0.5 text-xs font-medium tracking-tight text-black/85 dark:text-white/90 rounded-md cursor-pointer transition-all duration-150 flex items-center justify-center hover:bg-white/50 dark:hover:bg-white/15 hover:backdrop-blur-md hover:ring-1 hover:ring-white/60 dark:hover:ring-white/20 hover:shadow-sm hover:text-black dark:hover:text-white active:bg-white/75 dark:active:bg-white/25 active:scale-95"
                            >
                            {name}
                        </button>
                    </li>
                    ))}
                </ul>
            </div>

            <div>
                <ul>
                    {navIcons.map(({ id, img, type }) => {
                        const isModeIcon = id === 4 || img.includes("mode");

                        if (isModeIcon) {
                            return (
                                <li key={id} ref={themeMenuRef} className="relative">
                                <NavIconButton
                                    src={img}
                                    alt="Theme"
                                    title="Appearance"
                                    onClick={() => setThemeMenuOpen((open) => !open)}
                                />

                                {themeMenuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full mt-2 w-36 flex flex-col gap-0.5 p-1 rounded-lg border border-gray-200/80 dark:border-white/15 bg-white/90 dark:bg-[#232326]/95 backdrop-blur-xl shadow-xl py-1 text-xs text-gray-800 dark:text-gray-100"
                                >
                                    {THEME_OPTIONS.map(({ value, label, Icon }) => {
                                    const active = theme === value;
                                        return (
                                            <button
                                            key={value}
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setTheme(value);
                                                setThemeMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                                            active
                                            ? "bg-blue-500 text-white font-medium"
                                            : "hover:bg-black/5 dark:hover:bg-white/10"
                                            }`}
                                            >
                                            <span className="flex items-center gap-2">
                                            <Icon className="size-3.5" />
                                            <span>{label}</span>
                                            </span>
                                            {active && <Check className="size-3.5" />}
                                            </button>
                                            );
                                        })}
                                        </div>
                                    )}
                                </li>
                            );
                        }

                        return (
                            <li key={id}>
                                <NavIconButton
                                    src={img}
                                    alt={`icon-${id}`}
                                    onClick={type ? () => toggleWindow(type) : undefined}
                                />
                            </li>
                        );
                    })}
                </ul>
                <LiveTime />
            </div>
        </nav>
    );
};

export default Navbar;