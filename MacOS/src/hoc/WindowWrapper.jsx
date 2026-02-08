import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

import useWindowStore from "#store/window.js";

const WindowLayoutContext = createContext({
    isMaximized: false,
    maximizeWindow: () => {},
    restoreWindow: () => {},
});

export const useWindowLayout = () => useContext(WindowLayoutContext);

const getMaximizedBounds = () => ({
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
});

const WindowWrapper = (Component, windowKey) => {
    const Wrapped = (props) => {
        const { focusWindow, windows } = useWindowStore();
        const { isOpen, zIndex } = windows[windowKey];

        const ref = useRef(null);
        const draggableRef = useRef(null);
        const isMaximizedRef = useRef(false);
        const savedBoundsRef = useRef(null);

        const [isMaximized, setIsMaximized] = useState(false);

        const maximizeWindow = useCallback(() => {
            const el = ref.current;
            if (!el || !isOpen || isMaximizedRef.current) return;

            focusWindow(windowKey);
            gsap.killTweensOf(el);

            if (!savedBoundsRef.current) {
                const rect = el.getBoundingClientRect();
                savedBoundsRef.current = {
                    top: el.style.top || "45%",
                    left: el.style.left || "50%",
                    x: Number(gsap.getProperty(el, "x")) || 0,
                    y: Number(gsap.getProperty(el, "y")) || 0,
                    width: rect.width,
                    height: rect.height,
                };
            }

            isMaximizedRef.current = true;
            setIsMaximized(true);
            draggableRef.current?.disable();

            const bounds = getMaximizedBounds();
            gsap.to(el, {
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
                x: 0,
                y: 0,
                xPercent: 0,
                yPercent: 0,
                duration: 0.25,
                ease: "power2.out",
            });
        }, [focusWindow, isOpen]);

        const restoreWindow = useCallback(() => {
            const el = ref.current;
            if (!el || !isOpen || !isMaximizedRef.current) return;

            focusWindow(windowKey);
            gsap.killTweensOf(el);

            const saved = savedBoundsRef.current;
            isMaximizedRef.current = false;
            setIsMaximized(false);

            if (!saved) {
                gsap.set(el, { clearProps: "width,height" });
                draggableRef.current?.enable();
                return;
            }

            gsap.to(el, {
                top: saved.top,
                left: saved.left,
                width: saved.width,
                height: saved.height,
                x: saved.x,
                y: saved.y,
                xPercent: -50,
                yPercent: -50,
                duration: 0.25,
                ease: "power2.out",
                onComplete: () => {
                    if (isMaximizedRef.current) return;
                    gsap.set(el, { clearProps: "width,height" });
                    savedBoundsRef.current = null;
                    draggableRef.current?.enable();
                },
            });
        }, [focusWindow, isOpen]);

        useGSAP(() => {
            const el = ref.current;
            if (!el) return;

            if (!isOpen) {
                gsap.killTweensOf(el);
                isMaximizedRef.current = false;
                savedBoundsRef.current = null;
                setIsMaximized(false);
                gsap.set(el, { clearProps: "width,height" });
                draggableRef.current?.enable();
                return;
            }

            el.style.display = "block";
            el.style.top = "45%";
            el.style.left = "50%";

            gsap.fromTo(
                el,
                { scale: 0.1, opacity: 0, xPercent: -50, yPercent: -50, x: 0, y: 40 },
                { scale: 1, opacity: 1, xPercent: -50, yPercent: -50, x: 0, y: 0, duration: 0.3, ease: "power3.out" }
            );
        }, [isOpen]);

        useGSAP(() => {
            const el = ref.current;
            if (!el) return;

            const [instance] = Draggable.create(el, {
                onPress: () => focusWindow(windowKey),
            });
            draggableRef.current = instance;

            return () => {
                instance?.kill();
                draggableRef.current = null;
            };
        }, []);

        useEffect(() => {
            if (!isOpen || !isMaximized) return;

            const handleResize = () => {
                const el = ref.current;
                if (!el || !isMaximizedRef.current) return;
                gsap.set(el, getMaximizedBounds());
            };

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, [isOpen, isMaximized]);

        useLayoutEffect(() => {
            const el = ref.current;
            if (!el) return;

            el.style.display = isOpen ? (isMaximized ? "flex" : "block") : "none";
        }, [isOpen, isMaximized]);

        return (
            <WindowLayoutContext.Provider value={{ isMaximized, maximizeWindow, restoreWindow }}>
                <section
                    id={windowKey}
                    ref={ref}
                    style={{ zIndex }}
                    className={isMaximized ? "window-maximized" : undefined}
                >
                    <Component {...props} />
                </section>
            </WindowLayoutContext.Provider>
        );
    };

    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;

    return Wrapped;
};

export default WindowWrapper;