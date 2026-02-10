import { create } from "zustand";

const STORAGE_KEY = "portfolio-theme";
const VALID_THEMES = new Set(["light", "dark", "system"]);

const getInitialTheme = () => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(saved) ? saved : "dark";
};

const applyThemeToDocument = (theme) => {
    if (typeof window === "undefined") return;
    const isDark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
};

let mediaListenerBound = false;

const useThemeStore = create((set, get) => ({
    theme: getInitialTheme(),

    setTheme: (nextTheme) => {
        if (!VALID_THEMES.has(nextTheme)) return;
        localStorage.setItem(STORAGE_KEY, nextTheme);
        applyThemeToDocument(nextTheme);
        set({ theme: nextTheme });
    },

    initTheme: () => {
        applyThemeToDocument(get().theme);
        if (mediaListenerBound || typeof window === "undefined") return;

        mediaListenerBound = true;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", () => {
            if (get().theme === "system") applyThemeToDocument("system");
        });
    },
}));

export default useThemeStore;