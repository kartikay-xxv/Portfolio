import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { navLinks, navIcons } from "#constants/index.js";
import useWindowStore from "#store/window.js";

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

const NavIconButton = ({ src, alt, onClick = () => {} }) => (
    <button
        type="button"
        onClick={onClick}
        className="p-0.5 cursor-pointer rounded hover:bg-white/40 transition-colors flex items-center justify-center"
    >
        <img src={src} alt={alt} className="size-3.5" />
    </button>
);

const Navbar = () => {
    const { openWindow, closeWindow, windows } = useWindowStore();

    const handleRefresh = () => {
        window.location.href = "/";
    };

    const toggleWindow = (type) => {
        const win = windows[type];
        if (!win) return;
        win.isOpen ? closeWindow(type) : openWindow(type);
    };

    return (
        <nav>
            <div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="px-2 py-0.5 text-[13px] font-bold cursor-pointer rounded hover:bg-white/40 transition-colors flex items-center justify-center gap-1.5"
                >
                    <img src="/images/logo.svg" alt="Logo" className="size-3.5" />
                    <span>Kartikay's Portfolio</span>
                </button>
                <ul>
                    {navLinks.map(({ id, name, type }) => (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => toggleWindow(type)}
                                className="px-2 py-0.5 text-xs font-medium tracking-tight text-black/85 rounded-md cursor-pointer transition-all duration-150 flex items-center justify-center hover:bg-white/50 hover:backdrop-blur-md hover:ring-1 hover:ring-white/60 hover:shadow-sm hover:text-black active:bg-white/75 active:scale-95 active:ring-white/80"
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <ul>
                    {navIcons.map(({ id, img, type }) => (
                        <li key={id}>
                            <NavIconButton
                                src={img}
                                alt={`icon-${id}`}
                                onClick={type ? () => toggleWindow(type) : undefined}
                            />
                        </li>
                    ))}
                </ul>
                <LiveTime />
            </div>
        </nav>
    );
};

export default Navbar;